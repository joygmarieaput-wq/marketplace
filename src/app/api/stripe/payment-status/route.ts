import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
    try {
        const sessionId =
            request.nextUrl.searchParams.get("session_id");

        if (!sessionId || !sessionId.startsWith("cs_test_")) {
            return NextResponse.json(
                { error: "Invalid checkout session." },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Retrieve the order using the Stripe session ID
        const { data: order, error: orderError } =
            await supabase
                .from("orders")
                .select(`
                    id,
                    listing_id,
                    amount_total,
                    currency,
                    payment_status,
                    paid_at
                `)
                .eq("stripe_checkout_session_id", sessionId)
                .maybeSingle();

        if (orderError) {
            throw orderError;
        }

        if (!order) {
            return NextResponse.json(
                { error: "Order not found." },
                { status: 404 }
            );
        }

        // Retrieve product information
        const { data: listing, error: listingError } =
            await supabase
                .from("listings")
                .select("id, title, image_url")
                .eq("id", order.listing_id)
                .maybeSingle();

        if (listingError) {
            throw listingError;
        }

        return NextResponse.json(
            {
                order,
                listing,
            },
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );

    } catch (error) {
        console.error("Payment status error:", error);

        return NextResponse.json(
            { error: "Unable to retrieve payment status." },
            { status: 500 }
        );
    }
}