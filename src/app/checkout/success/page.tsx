"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import {
    CheckCircle2,
    Clock,
    ShoppingBag,
    ShieldCheck,
    Loader2,
    AlertCircle,
    ArrowRight,
    RefreshCw,
} from "lucide-react";

import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";

interface PaymentDetails {
    order: {
        id: string;
        listing_id: string;
        amount_total: number;
        currency: string;
        payment_status: string;
        paid_at: string | null;
    };

    listing: {
        id: string;
        title: string;
        image_url: string | null;
    } | null;
}

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");

    const [payment, setPayment] =
        useState<PaymentDetails | null>(null);

    const [loading, setLoading] = useState(!!sessionId);
    const [error, setError] = useState(
        sessionId ? "" : "Invalid checkout session."
    );
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        if (!sessionId) return;

        let active = true;
        let attempts = 0;

        let timeout: ReturnType<typeof setTimeout>;

        const controller = new AbortController();

        const checkPaymentStatus = async () => {
            try {
                const response = await fetch(
                    `/api/stripe/payment-status?session_id=${encodeURIComponent(sessionId)}`,
                    {
                        cache: "no-store",
                        signal: controller.signal,
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Unable to verify payment."
                    );
                }

                if (!active) return;

                setPayment(data);
                setError("");

                // Keep checking while payment is pending
                if (
                    data.order.payment_status === "pending" &&
                    attempts < 15
                ) {
                    attempts++;

                    timeout = setTimeout(
                        checkPaymentStatus,
                        2000
                    );
                }

            } catch (error) {
                if (!active) return;

                setError(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong."
                );

            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        checkPaymentStatus();

        return () => {
            active = false;
            controller.abort();
            clearTimeout(timeout);
        };

    }, [sessionId, retry]);

    const isPaid =
        payment?.order.payment_status === "paid";

    const isPending =
        payment?.order.payment_status === "pending";

    const formattedAmount = payment
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: payment.order.currency.toUpperCase(),
        }).format(payment.order.amount_total / 100)
        : "";

    return (
        <div className="min-h-screen bg-[#f0f2f5]">

            <MarketplaceHeader />

            <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 pb-12 pt-24">

                <div className="w-full rounded-2xl border border-[#dadde1] bg-white p-8 text-center shadow-sm">

                    {/* Payment status icon */}
                    <div
                        className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                            error
                                ? "bg-red-50"
                                : isPaid
                                    ? "bg-green-50"
                                    : isPending || loading
                                        ? "bg-blue-50"
                                        : "bg-amber-50"
                        }`}
                    >
                        {loading ? (
                            <Loader2
                                size={36}
                                className="animate-spin text-[#1877f2]"
                            />
                        ) : error ? (
                            <AlertCircle
                                size={40}
                                className="text-red-600"
                            />
                        ) : isPaid ? (
                            <CheckCircle2
                                size={44}
                                className="text-green-600"
                            />
                        ) : isPending ? (
                            <Clock
                                size={40}
                                className="text-[#1877f2]"
                            />
                        ) : (
                            <AlertCircle
                                size={40}
                                className="text-amber-600"
                            />
                        )}
                    </div>

                    {/* Page heading */}
                    <h1 className="text-2xl font-bold text-[#050505]">
                        {loading
                            ? "Checking your payment"
                            : error
                                ? "Unable to verify payment"
                                : isPaid
                                    ? "Payment Successful!"
                                    : isPending
                                        ? "Confirming your payment"
                                        : "Payment Not Completed"}
                    </h1>

                    <p className="mt-3 text-sm leading-relaxed text-[#65676b]">
                        {loading
                            ? "Please wait while we retrieve your order."
                            : error
                                ? error
                                : isPaid
                                    ? "Thank you for your purchase. Your payment has been successfully confirmed."
                                    : isPending
                                        ? "We are waiting for payment confirmation from Stripe."
                                        : "This order does not currently have a confirmed payment."}
                    </p>

                    {/* Order summary */}
                    {isPaid && payment && !error && !loading && (
                        <div className="mt-6 rounded-xl border border-[#e4e6eb] bg-[#f7f8fa] p-5 text-left">

                            <h2 className="mb-4 text-sm font-semibold text-[#050505]">
                                Order summary
                            </h2>

                            {/* Purchased product */}
                            <div className="flex items-center gap-4">

                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#e4e6eb]">

                                    {payment.listing?.image_url ? (
                                        <img
                                            src={payment.listing.image_url}
                                            alt={payment.listing.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <ShoppingBag
                                            size={28}
                                            className="text-[#65676b]"
                                        />
                                    )}

                                </div>

                                <div className="min-w-0">
                                    <p className="break-words font-semibold text-[#050505]">
                                        {payment.listing?.title ||
                                            "Marketplace item"}
                                    </p>

                                    <p className="mt-1 text-sm text-[#65676b]">
                                        Quantity: 1
                                    </p>
                                </div>

                            </div>

                            <hr className="my-4 border-[#dadde1]" />

                            <div className="space-y-3 text-sm">

                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-[#65676b]">
                                        Order reference
                                    </span>

                                    <span className="font-medium uppercase">
                                        #{payment.order.id.slice(0, 8)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[#65676b]">
                                        Payment status
                                    </span>

                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                        Paid
                                    </span>
                                </div>

                                {payment.order.paid_at && (
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[#65676b]">
                                            Payment date
                                        </span>

                                        <span className="font-medium">
                                            {new Intl.DateTimeFormat(
                                                "en-US",
                                                {
                                                    dateStyle: "medium",
                                                }
                                            ).format(
                                                new Date(payment.order.paid_at)
                                            )}
                                        </span>
                                    </div>
                                )}

                            </div>

                            <hr className="my-4 border-[#dadde1]" />

                            <div className="flex items-center justify-between">
                                <span className="font-semibold">
                                    Total paid
                                </span>

                                <span className="text-2xl font-bold text-[#050505]">
                                    {formattedAmount}
                                </span>
                            </div>

                        </div>
                    )}

                    {/* Retry payment verification */}
                    {!loading && (isPending || error) && (
                        <button
                            type="button"
                            onClick={() => setRetry((value) => value + 1)}
                            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#dadde1] text-sm font-semibold text-[#1877f2] transition hover:bg-[#f0f2f5]"
                        >
                            <RefreshCw size={16} />
                            Refresh Payment Status
                        </button>
                    )}

                    {/* Continue shopping */}
                    <Link
                        href="/"
                        className="mt-6 flex h-12 items-center justify-center gap-2 rounded-lg bg-[#1877f2] font-semibold text-white transition hover:bg-[#166fe5]"
                    >
                        <ShoppingBag size={18} />
                        Continue Shopping
                    </Link>

                    {/* View purchased item */}
                    {isPaid && payment && !error && !loading && (
                        <Link
                            href={`/listings/${payment.order.listing_id}`}
                            className="mt-3 flex h-12 items-center justify-center gap-2 rounded-lg border border-[#dadde1] font-semibold text-[#050505] transition hover:bg-[#f0f2f5]"
                        >
                            View Purchased Item
                            <ArrowRight size={16} />
                        </Link>
                    )}

                    {/* Security information */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#65676b]">
                        <ShieldCheck size={16} />
                        Secure payment with Stripe
                    </div>

                    <p className="mt-2 text-xs text-[#65676b]">
                        This transaction is in sandbox mode.
                    </p>

                </div>

            </main>

        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-[#f0f2f5]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1877f2]" />
                </div>
            }
        >
            <CheckoutSuccessContent />
        </Suspense>
    );
}