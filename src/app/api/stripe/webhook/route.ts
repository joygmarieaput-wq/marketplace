import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    const stripe = getStripe();

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = request.headers.get("stripe-signature");

    if (!webhookSecret || !signature) {
        return NextResponse.json(
            { error: "Missing webhook configuration." },
            { status: 400 }
        );
    }

    const body = await request.text();

    let event: Stripe.Event;

    // Verify Stripe webhook signature
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        );
    } catch (error) {
        console.error("Webhook signature error:", error);

        return NextResponse.json(
            { error: "Invalid webhook signature." },
            { status: 400 }
        );
    }

    // Only accept sandbox events
    if (event.livemode) {
        return NextResponse.json(
            { error: "Live payments are not supported." },
            { status: 400 }
        );
    }

    try {
        const supabase = getSupabaseAdmin();

        switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded":
            case "checkout.session.expired":
            case "checkout.session.async_payment_failed": {
                const session =
                    event.data.object as Stripe.Checkout.Session;

                const orderId = session.metadata?.order_id;

                // Ignore unrelated events from the shared sandbox
                if (
                    !orderId ||
                    !event.account ||
                    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)
                ) {
                    break;
                }

                // Verify that the connected account belongs
                // to our Marketplace.
                const { data: seller, error: sellerError } =
                    await supabase
                        .from("sellers")
                        .select("id")
                        .eq("stripe_account_id", event.account)
                        .maybeSingle();

                if (sellerError) {
                    throw sellerError;
                }

                if (!seller) {
                    break;
                }

                // Verify that the order belongs to our Marketplace
                // and to the connected seller.
                const { data: order, error: orderError } =
                    await supabase
                        .from("orders")
                        .select(
                            "id, stripe_checkout_session_id, payment_status"
                        )
                        .eq("id", orderId)
                        .eq("seller_id", seller.id)
                        .maybeSingle();

                if (orderError) {
                    throw orderError;
                }

                if (!order) {
                    break;
                }

                if (
                    order.stripe_checkout_session_id &&
                    order.stripe_checkout_session_id !== session.id
                ) {
                    break;
                }

                // Expired or failed payment
                if (
                    event.type === "checkout.session.expired" ||
                    event.type === "checkout.session.async_payment_failed"
                ) {
                    const { error } = await supabase
                        .from("orders")
                        .update({
                            payment_status: "failed",
                        })
                        .eq("id", orderId)
                        .eq("seller_id", seller.id)
                        .eq("stripe_checkout_session_id", session.id)
                        .eq("payment_status", "pending");

                    if (error) {
                        throw error;
                    }

                    break;
                }

                // Only process successful payments
                if (session.payment_status !== "paid") {
                    break;
                }

                const paymentIntentId =
                    typeof session.payment_intent === "string"
                        ? session.payment_intent
                        : session.payment_intent?.id;

                if (
                    !paymentIntentId ||
                    session.amount_total == null ||
                    !session.currency
                ) {
                    throw new Error("Missing payment information.");
                }

                const { error } = await supabase.rpc(
                    "complete_marketplace_order",
                    {
                        p_order_id: orderId,
                        p_session_id: session.id,
                        p_payment_intent_id: paymentIntentId,
                        p_buyer_email:
                            session.customer_details?.email || null,
                        p_stripe_account_id: event.account,
                        p_amount_total: session.amount_total,
                        p_currency: session.currency,
                    }
                );

                if (error) {
                    throw error;
                }

                console.log("Order completed:", orderId);

                break;
            }

            case "account.updated":
                // Account status is refreshed through
                // our existing Stripe status API.
                break;

            default:
                break;
        }

        return NextResponse.json({
            received: true,
        });
    } catch (error) {
        console.error("Stripe webhook error:", error);

        return NextResponse.json(
            { error: "Webhook processing failed." },
            { status: 500 }
        );
    }
}