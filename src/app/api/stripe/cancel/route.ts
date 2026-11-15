import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const { orderId, token } = await request.json();

        if (
            typeof orderId !== "string" ||
            typeof token !== "string" ||
            !/^[a-f0-9]{64}$/.test(token)
        ) {
            return NextResponse.json(
                { error: "Invalid cancellation request." },
                { status: 400 }
            );
        }

        const stripe = getStripe();
        const supabase = getSupabaseAdmin();

        // Validate the cancellation token.
        const expectedToken = createHmac(
            "sha256",
            process.env.STRIPE_SECRET_KEY!
        )
            .update(`cancel-checkout:${orderId}`)
            .digest("hex");

        if (
            !timingSafeEqual(
                Buffer.from(token, "hex"),
                Buffer.from(expectedToken, "hex")
            )
        ) {
            return NextResponse.json(
                { error: "Invalid cancellation token." },
                { status: 403 }
            );
        }

        // Retrieve the order.
        const { data: order, error: orderError } =
            await supabase
                .from("orders")
                .select(`
                    id,
                    seller_id,
                    payment_status,
                    stripe_checkout_session_id
                `)
                .eq("id", orderId)
                .maybeSingle();

        if (orderError) throw orderError;

        if (!order) {
            return NextResponse.json(
                { error: "Order not found." },
                { status: 404 }
            );
        }

        if (order.payment_status === "failed") {
            return NextResponse.json({
                success: true,
                message: "Checkout already cancelled.",
            });
        }

        if (
            order.payment_status !== "pending" ||
            !order.stripe_checkout_session_id
        ) {
            return NextResponse.json(
                { error: "This order cannot be cancelled." },
                { status: 409 }
            );
        }

        // Retrieve the connected seller account.
        const { data: seller, error: sellerError } =
            await supabase
                .from("sellers")
                .select("stripe_account_id")
                .eq("id", order.seller_id)
                .single();

        if (sellerError) throw sellerError;

        if (!seller?.stripe_account_id) {
            throw new Error("Connected seller account not found.");
        }

        const stripeOptions = {
            stripeAccount: seller.stripe_account_id,
        };

        // Retrieve the current Checkout session.
        let session = await stripe.checkout.sessions.retrieve(
            order.stripe_checkout_session_id,
            {},
            stripeOptions
        );

        if (
            session.livemode ||
            session.metadata?.order_id !== order.id
        ) {
            throw new Error("Invalid Checkout session.");
        }

        // Expire the session if it is still open.
        if (
            session.status === "open" &&
            session.payment_status === "unpaid"
        ) {
            session = await stripe.checkout.sessions.expire(
                session.id,
                {},
                stripeOptions
            );
        }

        // Never release a paid or completed Checkout session.
        if (
            session.status !== "expired" ||
            session.payment_status !== "unpaid"
        ) {
            return NextResponse.json(
                { error: "This Checkout session cannot be cancelled." },
                { status: 409 }
            );
        }

        // Release the pending order.
        const { error: updateError } = await supabase
            .from("orders")
            .update({
                payment_status: "failed",
            })
            .eq("id", order.id)
            .eq("stripe_checkout_session_id", session.id)
            .eq("payment_status", "pending");

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: "Checkout cancelled successfully.",
        });

    } catch (error) {
        console.error("Checkout cancellation failed:", error);

        return NextResponse.json(
            { error: "Unable to cancel Checkout session." },
            { status: 500 }
        );
    }
}