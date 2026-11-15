import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
    try {
        const stripe = getStripe();
        const supabase = getSupabaseAdmin();

        const token = request.cookies.get(
            "seller_onboarding"
        )?.value;

        if (!token) {
            return NextResponse.json({
                connected: false,
            });
        }

        // Retrieve registered sellers
        const { data: sellers, error: sellerError } =
            await supabase
                .from("sellers")
                .select("id, email, stripe_account_id")
                .not("stripe_account_id", "is", null);

        if (sellerError) {
            throw sellerError;
        }

        // Identify seller using the signed onboarding cookie
        const seller = sellers?.find((item) => {
            const signature = createHmac(
                "sha256",
                process.env.STRIPE_SECRET_KEY!
            )
                .update(item.stripe_account_id)
                .digest("hex");

            return signature === token;
        });

        if (!seller) {
            return NextResponse.json({
                connected: false,
            });
        }

        // Retrieve Stripe Accounts v2 information
        const account = await stripe.v2.core.accounts.retrieve(
            seller.stripe_account_id,
            {
                include: [
                    "configuration.merchant",
                    "requirements",
                ],
            }
        );


        // Check card payment capability
        const chargesEnabled =
            account.configuration?.merchant
                ?.capabilities?.card_payments?.status === "active";

        // Retrieve additional account status fields
        const legacyAccount = await stripe.accounts.retrieve(
            seller.stripe_account_id
        );

        const payoutsEnabled =
            account.configuration?.merchant?.capabilities
                ?.stripe_balance?.payouts?.status === "active";

        const detailsSubmitted =
            legacyAccount.details_submitted === true;

        const requirements = account.requirements?.entries ?? [];

        const requiresAction = requirements.some(
            (entry) => entry.awaiting_action_from === "user"
        );

        const pendingVerification =
            !chargesEnabled &&
            !requiresAction &&
            requirements.some(
                (entry) => entry.awaiting_action_from === "stripe"
        );

        // Update Supabase
        const { error: updateError } = await supabase
            .from("sellers")
            .update({
                charges_enabled: chargesEnabled,
                payouts_enabled: payoutsEnabled,
                details_submitted: detailsSubmitted,
                updated_at: new Date().toISOString(),
            })
            .eq("id", seller.id);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            connected: chargesEnabled,
            email: seller.email,
            charges_enabled: chargesEnabled,
            payouts_enabled: payoutsEnabled,
            details_submitted: detailsSubmitted,
            pending_verification: pendingVerification,
            requires_action: requiresAction,
        });

    } catch (error) {
        console.error("Stripe status error:", error);

        return NextResponse.json(
            {
                error: "Unable to verify Stripe account status.",
            },
            { status: 500 }
        );
    }
}