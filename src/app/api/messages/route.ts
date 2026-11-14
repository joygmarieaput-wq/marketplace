import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const listing_id = String(body.listing_id ?? "").trim();
        const buyer_email = String(body.buyer_email ?? "").trim();
        const message = String(body.message ?? "").trim();

        // Validate required fields
        if (!listing_id || !buyer_email || !message) {
            return NextResponse.json(
                { error: "Please complete all required fields." },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailRegex.test(buyer_email) ||
            buyer_email.length > 255
        ) {
            return NextResponse.json(
                { error: "Please enter a valid email address." },
                { status: 400 }
            );
        }

        if (message.length > 1000) {
            return NextResponse.json(
                { error: "Message must not exceed 1000 characters." },
                { status: 400 }
            );
        }

        // Retrieve listing information
        const { data: listing, error: listingError } =
            await supabase
                .from("listings")
                .select("id, title, seller_email")
                .eq("id", listing_id)
                .single();

        if (listingError || !listing) {
            return NextResponse.json(
                { error: "Listing not found." },
                { status: 404 }
            );
        }

        // Save message in Supabase
        const { error: messageError } = await supabase
            .from("messages")
            .insert({
                listing_id,
                buyer_email,
                seller_email: listing.seller_email,
                message,
            });

        if (messageError) {
            return NextResponse.json(
                { error: "Unable to save message." },
                { status: 500 }
            );
        }

        // Send email notification
        let emailSent = false;

        try {
            const resend = new Resend(
                process.env.RESEND_API_KEY
            );

            const { error: emailError } =
                await resend.emails.send({
                    from:
                        process.env.RESEND_FROM_EMAIL ||
                        "Marketplace <onboarding@resend.dev>",

                    to: listing.seller_email,

                    replyTo: buyer_email,

                    subject: `New inquiry: ${listing.title}`,

                    text: `
Hello,

Someone is interested in your Marketplace listing.

Listing: ${listing.title}
Buyer email: ${buyer_email}

Message:
${message}

You can reply directly to this email to contact the buyer.

Thank you,
Marketplace
                    `.trim(),
                });

            if (emailError) {
                console.error(
                    "Resend error:",
                    emailError.message
                );
            } else {
                emailSent = true;
            }

        } catch (error) {
            console.error("Email notification failed:", error);
        }

        return NextResponse.json({
            success: true,
            emailSent,
            message: emailSent
                ? "Message saved and email notification submitted."
                : "Message saved, but email notification unavailable.",
        });

    } catch (error) {
        console.error("Message submission error:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}