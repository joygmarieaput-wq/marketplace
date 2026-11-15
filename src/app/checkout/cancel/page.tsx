"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function CheckoutCancelContent() {
    const searchParams = useSearchParams();

    const listingId = searchParams.get("listing_id");
    const orderId = searchParams.get("order_id");
    const token = searchParams.get("token");

    const [status, setStatus] = useState<
        "loading" | "cancelled" | "error"
    >("loading");

    useEffect(() => {
        async function cancelCheckout() {
            if (!orderId || !token) {
                setStatus("error");
                return;
            }

            try {
                const response = await fetch("/api/stripe/cancel", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        orderId,
                        token,
                    }),
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error);
                }

                setStatus("cancelled");

            } catch {
                setStatus("error");
            }
        }

        cancelCheckout();
    }, [orderId, token]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f0f2f5] p-5">

            <div className="w-full max-w-md rounded-2xl border border-[#dadde1] bg-white p-8 text-center shadow-sm">

                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">

                    {status === "loading" ? (
                        <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
                    ) : (
                        <XCircle className="h-10 w-10 text-amber-600" />
                    )}

                </div>

                <h1 className="text-2xl font-bold text-[#050505]">
                    {status === "loading"
                        ? "Cancelling Checkout..."
                        : status === "cancelled"
                        ? "Checkout Cancelled"
                        : "Cancellation Not Confirmed"}
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-[#65676b]">

                    {status === "loading"
                        ? "Please wait while we cancel your Checkout session."
                        : status === "cancelled"
                        ? "Your payment was not completed. No payment was collected and you can purchase this item again."
                        : "We could not confirm the cancellation. Your reservation may still be active. Please check the listing before trying again."}

                </p>

                <div className="mt-8 space-y-3">

                    {listingId && status !== "loading" && (
                        <Button
                            asChild
                            className="w-full bg-[#1877f2] hover:bg-[#166fe5]"
                        >
                            <Link
                                href={`/listings/${encodeURIComponent(listingId)}`}
                            >
                                Back to Listing
                            </Link>
                        </Button>
                    )}

                    {status !== "loading" && (
                        <Button
                            asChild
                            variant="outline"
                            className="w-full"
                        >
                            <Link href="/">
                                Continue Shopping
                            </Link>
                        </Button>
                    )}

                </div>

                <p className="mt-6 text-xs text-[#65676b]">
                    Stripe Sandbox · Test Mode
                </p>

            </div>

        </main>
    );
}

export default function CheckoutCancelPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-[#f0f2f5]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1877f2]" />
                </div>
            }
        >
            <CheckoutCancelContent />
        </Suspense>
    );
}