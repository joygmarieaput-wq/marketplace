"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    UserRound,
    CreditCard,
    AlertCircle,
    ShieldCheck,
    Plus,
    CircleHelp,
    Loader2,
    ChevronRight,
    CheckCircle2,
    Clock,
    RefreshCw,
    Wallet,
} from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";

const quickActions = [
    {
        label: "Create New Listing",
        description: "Add a new item to sell",
        href: "/create",
        icon: Plus,
    },
    {
        label: "Seller Help",
        description: "Get help with selling",
        href: "/create/help",
        icon: CircleHelp,
    },
];

export default function SellerProfilePage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const [connected, setConnected] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [payoutsEnabled, setPayoutsEnabled] = useState(false);
    const [statusError, setStatusError] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [requiresAction, setRequiresAction] = useState(false);

    const checkStripeStatus = async () => {
        setCheckingStatus(true);
        setStatusError("");

        try {
            const response = await fetch("/api/stripe/status", {
                method: "POST",
                cache: "no-store",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to check Stripe status."
                );
            }

            setConnected(data.connected === true);
            setPayoutsEnabled(data.payouts_enabled === true);
            setPendingVerification(data.pending_verification === true);
            setRequiresAction(data.requires_action === true);

            if (data.email) {
                setEmail(data.email);
            }

        } catch (error) {
            console.error(error);
            setStatusError("Unable to verify Stripe account status.");
        } finally {
            setCheckingStatus(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            void checkStripeStatus();
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const handleConnect = async (event: FormEvent) => {
        event.preventDefault();

        if (!email.trim()) {
            toast.error("Please enter your email address.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/stripe/connect", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.url) {
                throw new Error(
                    data.error || "Unable to connect Stripe account."
                );
            }

            window.location.href = data.url;
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5]">
            <MarketplaceHeader />

            <main className="mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6">

                {/* Back navigation */}
                <Link
                    href="/"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#65676b] transition hover:text-[#1877f2]"
                >
                    <ArrowLeft size={17} />
                    Back to Marketplace
                </Link>

                {/* Page heading */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#050505]">
                        Seller Profile
                    </h1>

                    <p className="mt-1 text-sm text-[#65676b]">
                        Manage your listings and payment preferences.
                    </p>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">

                    {/* Left column */}
                    <div className="space-y-6">

                        {/* Profile card */}
                        <section className="rounded-xl border border-[#dadde1] bg-white p-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e7f3ff]">
                                    <UserRound
                                        size={30}
                                        className="text-[#1877f2]"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-[#050505]">
                                        Marketplace Seller
                                    </h2>

                                    <p className="mt-1 text-sm text-[#65676b]">
                                        Manage your selling experience
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Stripe payment setup */}
                        <section
                            id="payment-setup"
                            className="scroll-mt-24 rounded-xl border border-[#dadde1] bg-white p-6"
                        >
                            <div className="mb-2 flex items-center gap-3">
                                <CreditCard
                                    size={23}
                                    className="text-[#1877f2]"
                                />

                                <h2 className="text-lg font-semibold text-[#050505]">
                                    Stripe Payment Setup
                                </h2>
                            </div>

                            <p className="mb-6 text-sm leading-relaxed text-[#65676b]">
                                Connect your Stripe account to receive
                                payments when buyers purchase your
                                listings.
                            </p>

                            {/* Account status */}
                            {checkingStatus ? (
                                <div className="mb-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <Loader2
                                        size={20}
                                        className="animate-spin text-[#1877f2]"
                                    />

                                    <p className="text-sm text-[#65676b]">
                                        Checking Stripe account status...
                                    </p>
                                </div>
                            ) : statusError ? (
                                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                                    <p className="text-sm text-red-700">
                                        {statusError}
                                    </p>
                                </div>
                            ) : connected ? (
                                <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                                    <CheckCircle2
                                        size={22}
                                        className="mt-0.5 shrink-0 text-green-600"
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-green-800">
                                            Stripe account connected
                                        </p>

                                        <p className="mt-1 text-sm text-green-700">
                                            Your account is ready to accept test payments.
                                        </p>

                                        <p className="mt-2 text-xs text-green-700">
                                            Payouts: {payoutsEnabled ? "Enabled" : "Pending"}
                                        </p>
                                    </div>
                                </div>
                            ) : pendingVerification ? (
                                <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <Clock
                                        size={22}
                                        className="mt-0.5 shrink-0 text-amber-600"
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-amber-800">
                                            Stripe verification in progress
                                        </p>

                                        <p className="mt-1 text-sm leading-relaxed text-amber-700">
                                            Your information has been submitted successfully.
                                            Stripe is currently reviewing your account.
                                            Payments will be available once verification
                                            is complete.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <AlertCircle
                                        size={20}
                                        className="mt-0.5 shrink-0 text-amber-600"
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-amber-800">
                                            {requiresAction
                                                ? "Additional information required"
                                                : "Stripe account setup required"}
                                        </p>

                                        <p className="mt-1 text-sm text-amber-700">
                                            {requiresAction
                                                ? "Stripe requires additional information to enable payments."
                                                : "Connect your account to enable Buy Now on your listings."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <form
                                onSubmit={handleConnect}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="seller_email">
                                        Email for Stripe Account
                                    </Label>

                                    <Input
                                        id="seller_email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        maxLength={255}
                                        required
                                        className="h-11"
                                        disabled={
                                            connected ||
                                            checkingStatus ||
                                            pendingVerification ||
                                            requiresAction
                                        }
                                    />

                                    <p className="text-xs leading-relaxed text-[#65676b]">
                                        Use the same email address you
                                        entered when creating your listings.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        checkingStatus ||
                                        connected ||
                                        pendingVerification ||
                                        !!statusError ||
                                        !email.trim()
                                    }
                                    className="h-11 w-full bg-[#1877f2] font-semibold text-white hover:bg-[#166fe5]"
                                >
                                    {checkingStatus ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Checking status...
                                        </>
                                    ) : connected ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Stripe Account Connected
                                        </>
                                    ) : pendingVerification ? (
                                        <>
                                            <Clock className="h-4 w-4" />
                                            Verification in Progress
                                        </>
                                    ) : loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="h-4 w-4" />
                                            {requiresAction
                                                ? "Continue Stripe Setup"
                                                : "Connect Stripe Account"}
                                        </>
                                    )}
                                </Button>

                                {(pendingVerification || connected || statusError) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={checkStripeStatus}
                                        disabled={checkingStatus}
                                        className="h-10 w-full"
                                    >
                                        <RefreshCw
                                            className={`h-4 w-4 ${
                                                checkingStatus ? "animate-spin" : ""
                                            }`}
                                        />
                                        Refresh Account Status
                                    </Button>
                                )}
                            </form>

                            {/* Sandbox notice */}
                            <div className="mt-6 flex items-start gap-2 border-t border-[#e4e6eb] pt-4">
                                <ShieldCheck
                                    size={18}
                                    className="shrink-0 text-[#65676b]"
                                />

                                <p className="text-xs leading-relaxed text-[#65676b]">
                                    Payments are securely processed by
                                    Stripe. This marketplace operates in
                                    sandbox mode. No real money is involved.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Right column */}
                    <aside className="space-y-6">

                        {/* Payment information */}
                        <section className="rounded-xl border border-[#dadde1] bg-white p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Wallet
                                    size={22}
                                    className="text-[#1877f2]"
                                />

                                <h2 className="text-lg font-semibold text-[#050505]">
                                    Payment Information
                                </h2>
                            </div>

                            <p className="text-sm leading-relaxed text-[#65676b]">
                                Receive payments directly through your connected
                                Stripe account whenever an item is sold.
                            </p>

                            <div className="my-5 rounded-lg bg-[#f0f2f5] p-4">
                                <p className="text-3xl font-bold text-[#050505]">
                                    10%
                                </p>

                                <p className="mt-1 text-sm text-[#65676b]">
                                    Platform commission per sale
                                </p>
                            </div>

                            <h3 className="mb-4 text-sm font-semibold">
                                Example Transaction
                            </h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-[#65676b]">
                                        Product price
                                    </span>
                                    <span className="font-medium">
                                        $10.00
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[#65676b]">
                                        Platform fee (10%)
                                    </span>
                                    <span className="font-medium text-red-600">
                                        -$1.00
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-t border-[#e4e6eb] pt-3">
                                    <span className="font-semibold">
                                        Seller share
                                    </span>
                                    <span className="text-xl font-bold text-green-600">
                                        $9.00
                                    </span>
                                </div>
                            </div>

                            <p className="mt-4 text-xs leading-relaxed text-[#65676b]">
                                This is an illustrative transaction before applicable
                                Stripe processing fees.
                            </p>

                            {connected && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="mt-5 h-10 w-full"
                                >
                                    <a
                                        href="https://dashboard.stripe.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Open Stripe Dashboard
                                    </a>
                                </Button>
                            )}
                        </section>

                        {/* Quick actions */}
                        <section className="rounded-xl border border-[#dadde1] bg-white p-5">
                            <h2 className="mb-4 text-lg font-semibold">
                                Quick Actions
                            </h2>

                            <div className="space-y-2">
                                {quickActions.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className="flex items-center gap-3 rounded-lg border border-[#e4e6eb] p-3 transition hover:bg-[#f0f2f5]"
                                        >
                                            <Icon
                                                size={19}
                                                className="shrink-0 text-[#1877f2]"
                                            />

                                            <div className="flex-1">
                                                <p className="text-sm font-semibold">
                                                    {item.label}
                                                </p>

                                                <p className="mt-0.5 text-xs text-[#65676b]">
                                                    {item.description}
                                                </p>
                                            </div>

                                            <ChevronRight
                                                size={16}
                                                className="text-[#65676b]"
                                            />
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>

                    </aside>

                </div>
            </main>
        </div>
    );
}