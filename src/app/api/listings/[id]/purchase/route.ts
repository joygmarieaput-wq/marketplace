import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = getSupabaseAdmin();

        // Retrieve the listing
        const { data: listing, error: listingError } =
            await supabase
                .from("listings")
                .select("id, price, status, seller_email")
                .eq("id", id)
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

        // Check if the listing has already been sold
        if (listing.status === "sold") {
            return NextResponse.json({
                can_purchase: false,
                status: "sold",
            });
        }

        const sellerEmail = listing.seller_email
            .trim()
            .toLowerCase();

        // Retrieve the seller's Stripe status
        const { data: seller, error: sellerError } =
            await supabase
                .from("sellers")
                .select("stripe_account_id, charges_enabled")
                .eq("email", sellerEmail)
                .maybeSingle();

        if (sellerError) {
            throw sellerError;
        }

        const price = Number(listing.price);

        const canPurchase =
            listing.status === "available" &&
            !!seller?.stripe_account_id &&
            seller?.charges_enabled === true &&
            Number.isFinite(price) &&
            price > 0;

        return NextResponse.json(
            {
                can_purchase: canPurchase,
                status: listing.status,
                price,
                currency: "usd",
            },
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );

    } catch (error) {
        console.error("Purchase eligibility error:", error);

        return NextResponse.json(
            { error: "Unable to check purchase availability." },
            { status: 500 }
        );
    }
}