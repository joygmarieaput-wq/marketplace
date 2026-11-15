import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const email = String(body.email ?? "")
            .trim()
            .toLowerCase();

        // Validate seller email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email) || email.length > 255) {
            return NextResponse.json(
                { error: "Please enter a valid email address." },
                { status: 400 }
            );
        }

        const stripe = getStripe();
        const supabase = getSupabaseAdmin();

        const appUrl = process.env.NEXT_PUBLIC_APP_URL;

        if (!appUrl) {
            throw new Error("Application URL is not configured.");
        }

        // Check if seller already exists
        const { data: seller, error: sellerError } =
            await supabase
                .from("sellers")
                .select("*")
                .eq("email", email)
                .maybeSingle();

        if (sellerError) {
            throw sellerError;
        }

        let accountId = seller?.stripe_account_id;

        // Create a signed browser token for onboarding
        const createToken = (id: string) =>
            createHmac("sha256", process.env.STRIPE_SECRET_KEY!)
                .update(id)
                .digest("hex");

        // Create a Stripe connected account
        if (!accountId) {
            const account = await stripe.v2.core.accounts.create({
                contact_email: email,

                dashboard: "full",

                identity: {
                    country: "US",
                },

                defaults: {
                    responsibilities: {
                        fees_collector: "stripe",
                        losses_collector: "stripe",
                    },
                },

                configuration: {
                    merchant: {
                        capabilities: {
                            card_payments: {
                                requested: true,
                            },
                        },
                    },
                },
            });

            accountId = account.id;

            // Save Stripe account in Supabase
            const { error: saveError } = await supabase
            .from("sellers")
            .insert({
                email: email,
                stripe_account_id: accountId,
                charges_enabled: false,
                payouts_enabled: false,
                details_submitted: false,
            });

            if (saveError) {
                throw saveError;
            }
        } else {
            // Prevent other visitors from reopening
            // an existing seller's onboarding session
            const token = request.cookies.get(
                "seller_onboarding"
            )?.value;

            if (token !== createToken(accountId)) {
                return NextResponse.json(
                    {
                        error: "This email already has a Stripe account associated with it.",
                    },
                    { status: 403 }
                );
            }
        }

        // Create Stripe hosted onboarding link
        // Create Stripe hosted onboarding link
        const accountLink = await stripe.v2.core.accountLinks.create({
            account: accountId,

            use_case: {
                type: "account_onboarding",

                account_onboarding: {
                    refresh_url: `${appUrl}/seller?stripe=refresh`,
                    return_url: `${appUrl}/seller?stripe=return`,
                },
            },
        });

        const response = NextResponse.json({
            success: true,
            url: accountLink.url,
        });

        response.cookies.set(
            "seller_onboarding",
            createToken(accountId),
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
            }
        );

        return response;

    } catch (error) {
        console.error("Stripe onboarding error:", error);

        return NextResponse.json(
            {
                error: "Unable to connect Stripe account. Please try again.",
            },
            { status: 500 }
        );
    }
}