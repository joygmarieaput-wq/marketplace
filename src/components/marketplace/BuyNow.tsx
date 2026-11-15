"use client";

import { useEffect, useState } from "react";
import {
    ShoppingBag,
    ShieldCheck,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BuyNowProps {
    listingId: string;
}

interface PurchaseAvailability {
    can_purchase: boolean;
    status: "available" | "sold";
    price: number;
    currency: string;
}

export default function BuyNow({
    listingId,
}: BuyNowProps) {
    const [purchase, setPurchase] =
        useState<PurchaseAvailability | null>(null);

    const [loading, setLoading] = useState(true);

    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const checkAvailability = async () => {
            try {
                const response = await fetch(
                    `/api/listings/${listingId}/purchase`,
                    {
                        cache: "no-store",
                        signal: controller.signal,
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    console.log("Purchase API status:", response.status);
                    console.log("Purchase API response:", data);

                    throw new Error(
                        data.error || "Unable to check purchase availability."
                    );
                }

                setPurchase(data);

            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error(error);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        checkAvailability();

        return () => controller.abort();

    }, [listingId]);

    const handleBuyNow = async () => {
        if (processing) return;

        setProcessing(true);

        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    listingId,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.url) {
                throw new Error(
                    data.error || "Unable to start checkout."
                );
            }

            window.location.href = data.url;

        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );

            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-xl border border-[#dadde1] bg-white p-5">
                <div className="flex items-center gap-2 text-sm text-[#65676b]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking purchase availability...
                </div>
            </div>
        );
    }

    if (purchase?.status === "sold") {
        return (
            <div className="rounded-xl border border-[#dadde1] bg-white p-5">
                <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />

                    <div>
                        <p className="font-semibold text-green-800">
                            Item Sold
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                            This item is no longer available for purchase.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!purchase?.can_purchase) {
        return null;
    }

    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: purchase.currency.toUpperCase(),
        minimumFractionDigits: 2,
    }).format(purchase.price);

    return (
        <div className="space-y-4 rounded-xl border border-[#dadde1] bg-white p-5">

            <h2 className="text-base font-semibold text-[#050505]">
                Purchase this item
            </h2>

            <div className="flex items-center justify-between">
                <span className="text-sm text-[#65676b]">
                    Item price
                </span>

                <span className="text-xl font-bold text-[#050505]">
                    {formattedPrice}
                </span>
            </div>

            <Button
                type="button"
                onClick={handleBuyNow}
                disabled={processing}
                className="h-12 w-full rounded-lg bg-[#1877f2] font-semibold text-white hover:bg-[#166fe5]"
            >
                {processing ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Redirecting to Checkout...
                    </>
                ) : (
                    <>
                        <ShoppingBag className="h-5 w-5" />
                        Buy Now - USD {formattedPrice}
                    </>
                )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-[#65676b]">
                <ShieldCheck className="h-4 w-4" />
                Secure payment with Stripe
            </div>

        </div>
    );
}