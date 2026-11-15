import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createHmac } from "node:crypto";

export async function POST(request: NextRequest) {
    try {
        const stripe = getStripe();
        const supabase = getSupabaseAdmin();

        const { listingId } = await request.json();

        if (
            typeof listingId !== "string" ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingId)
        ) {
            return NextResponse.json(
                { error: "Invalid listing." },
                { status: 400 }
            );
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL;

        if (!appUrl) {
            throw new Error("Application URL is not configured.");
        }

        // Retrieve listing information
        const { data: listing, error: listingError } =
            await supabase
                .from("listings")
                .select("id, title, price, status, seller_email")
                .eq("id", listingId)
                .maybeSingle();

        if (listingError) {
            throw listingError;
        }

        if (!listing) {
            return NextResponse.json(
                { error: "Listing not found." },
                { status: 404 }
            );
        }

        if (listing.status !== "available") {
            return NextResponse.json(
                { error: "This item is no longer available." },
                { status: 409 }
            );
        }

        // Retrieve connected seller
        const { data: seller, error: sellerError } =
            await supabase
                .from("sellers")
                .select("id, stripe_account_id, charges_enabled")
                .eq(
                    "email",
                    listing.seller_email.trim().toLowerCase()
                )
                .maybeSingle();

        if (sellerError) {
            throw sellerError;
        }

        if (
            !seller?.stripe_account_id ||
            !seller.charges_enabled
        ) {
            return NextResponse.json(
                { error: "This seller cannot accept payments yet." },
                { status: 400 }
            );
        }

        // Verify current Stripe payment capability
        const account =
            await stripe.v2.core.accounts.retrieve(
                seller.stripe_account_id,
                {
                    include: ["configuration.merchant"],
                }
            );

        const chargesEnabled =
            account.configuration?.merchant
                ?.capabilities?.card_payments?.status === "active";

        if (!chargesEnabled) {
            return NextResponse.json(
                { error: "Seller payments are currently unavailable." },
                { status: 400 }
            );
        }

        // Convert USD price to cents
        const amountTotal = Math.round(
            Number(listing.price) * 100
        );

        if (
            !Number.isSafeInteger(amountTotal) ||
            amountTotal < 50 ||
            amountTotal > 99999999
        ) {
            return NextResponse.json(
                { error: "Invalid listing price." },
                { status: 400 }
            );
        }

        // Calculate platform commission
        const feePercent = Number(
            process.env.STRIPE_PLATFORM_FEE_PERCENT || "10"
        );

        if (
            !Number.isFinite(feePercent) ||
            feePercent < 0 ||
            feePercent >= 100
        ) {
            throw new Error("Invalid platform fee configuration.");
        }

        const platformFee = Math.round(
            amountTotal * (feePercent / 100)
        );

        const sellerAmount = amountTotal - platformFee;

        // Reserve the listing with a pending order
        const { data: order, error: orderError } =
            await supabase
                .from("orders")
                .insert({
                    listing_id: listing.id,
                    seller_id: seller.id,
                    amount_total: amountTotal,
                    platform_fee: platformFee,
                    seller_amount: sellerAmount,
                    currency: "usd",
                    payment_status: "pending",
                })
                .select("id")
                .single();

        if (orderError) {
            if (orderError.code === "23505") {
                return NextResponse.json(
                    {
                        error: "This item already has an active purchase.",
                    },
                    { status: 409 }
                );
            }

            throw orderError;
        }

        const cancelToken = createHmac(
            "sha256",
            process.env.STRIPE_SECRET_KEY!
        )
            .update(`cancel-checkout:${order.id}`)
            .digest("hex");

        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create(
            {
                mode: "payment",

                adaptive_pricing: {
                    enabled: false,
                },

                line_items: [
                    {
                        price_data: {
                            currency: "usd",
                            product_data: {
                                name: listing.title,
                            },
                            unit_amount: amountTotal,
                        },
                        quantity: 1,
                    },
                ],

                payment_intent_data: {
                    application_fee_amount: platformFee,

                    metadata: {
                        order_id: order.id,
                        listing_id: listing.id,
                        seller_id: seller.id,
                    },
                },

                metadata: {
                    order_id: order.id,
                    listing_id: listing.id,
                    seller_id: seller.id,
                },

                client_reference_id: order.id,

                success_url:
                    `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,

                cancel_url: `${appUrl}/checkout/cancel?listing_id=${listing.id}&order_id=${order.id}&token=${cancelToken}`,

                expires_at:
                    Math.floor(Date.now() / 1000) + 35 * 60,
            },
            {
                stripeAccount: seller.stripe_account_id,
                idempotencyKey: `checkout-${order.id}`,
            }
        );

        // Save Checkout session ID
        const { error: updateError } = await supabase
            .from("orders")
            .update({
                stripe_checkout_session_id: session.id,
            })
            .eq("id", order.id);

        if (updateError) {
            throw updateError;
        }

        if (!session.url) {
            throw new Error("Checkout URL was not generated.");
        }

        return NextResponse.json({
            success: true,
            url: session.url,
        });

    } catch (error) {
        console.error("Stripe Checkout error:", error);

        return NextResponse.json(
            { error: "Unable to start checkout. Please try again later." },
            { status: 500 }
        );
    }
}