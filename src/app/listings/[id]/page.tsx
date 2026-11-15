"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MessageSeller from "@/components/marketplace/MessageSeller";
import BuyNow from "@/components/marketplace/BuyNow";

import {
    ArrowLeft,
    ImageIcon,
    UserRound,
    PackageOpen,
    AlertCircle,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";

import { getListingById } from "@/lib/listings";
import { formatPrice, formatRelativeDate } from "@/lib/format";
import { Listing } from "@/types/marketplace";

export default function ListingDetailPage() {
    const { id } = useParams<{ id: string }>();

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function fetchListing() {
            try {
                const data = await getListingById(id);

                if (active) {
                    setListing(data);
                    setError("");
                }
            } catch (error) {
                if (active) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "Unable to load listing."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        fetchListing();

        return () => {
            active = false;
        };
    }, [id]);

    return (
        <div className="min-h-screen">
            <MarketplaceHeader />

            <main className="mx-auto max-w-[1600px] px-4 pb-10 pt-24 lg:px-8">

                {/* Back button */}
                <Link
                    href="/"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#65676b] transition hover:text-[#1877f2]"
                >
                    <ArrowLeft size={18} />
                    Back to Marketplace
                </Link>

                {loading ? (
                    /* Loading state */
                    <div className="grid overflow-hidden rounded-xl border border-[#dadde1] bg-white lg:grid-cols-[minmax(0,1fr)_380px]">

                        <Skeleton className="min-h-[400px] rounded-none bg-[#e4e6eb] lg:min-h-[650px]" />

                        <div className="space-y-5 p-6">
                            <Skeleton className="h-9 w-4/5" />
                            <Skeleton className="h-7 w-24" />
                            <Skeleton className="h-4 w-full" />

                            <hr className="border-[#dadde1]" />

                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-20 w-full" />

                            <hr className="border-[#dadde1]" />

                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>

                    </div>
                ) : error || !listing ? (
                    /* Error or not found */
                    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">

                        <div className="mb-4 rounded-full bg-[#e4e6eb] p-5">
                            {error ? (
                                <AlertCircle
                                    size={40}
                                    className="text-[#65676b]"
                                />
                            ) : (
                                <PackageOpen
                                    size={40}
                                    className="text-[#65676b]"
                                />
                            )}
                        </div>

                        <h1 className="text-xl font-bold">
                            {error
                                ? "Unable to load listing"
                                : "Listing not found"}
                        </h1>

                        <p className="mt-2 text-sm text-[#65676b]">
                            {error
                                ? "Please try again later."
                                : "This listing may no longer be available."}
                        </p>

                        <Link
                            href="/"
                            className="mt-5 rounded-lg bg-[#1877f2] px-5 py-2.5 text-sm font-semibold text-white"
                        >
                            Browse Marketplace
                        </Link>

                    </div>
                ) : (
                    /* Listing details */
                    <div className="grid overflow-hidden rounded-xl border border-[#dadde1] bg-white lg:h-[calc(100dvh-160px)] lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[minmax(0,1fr)]">

                        {/* Product image */}
                        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-[#e4e6e9] p-4 lg:h-full lg:min-h-0 lg:p-6">

                            {listing.status === "sold" && (
                                <div className="absolute left-5 top-5 z-10 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold tracking-wide text-white shadow-sm">
                                    SOLD
                                </div>
                            )}

                            {listing.image_url ? (
                                <img
                                    src={listing.image_url}
                                    alt={listing.title}
                                    className="max-h-[500px] w-full object-contain lg:h-full lg:max-h-full"
                                />
                            ) : (
                                <div className="text-sm text-[#65676b]">
                                    No image available
                                </div>
                            )}

                        </div>

                        {/* Listing information */}
                        <aside className="min-h-0 min-w-0 border-t border-[#dadde1] bg-white p-6 lg:h-full lg:overflow-y-auto lg:border-l lg:border-t-0">

                            <h1 className="break-words text-3xl font-bold text-[#050505]">
                                {listing.title}
                            </h1>

                            <p className="mt-2 text-2xl font-semibold">
                                {formatPrice(listing.price)}
                            </p>

                            <p className="mt-3 text-sm text-[#65676b]">
                                Listed{" "}
                                {formatRelativeDate(listing.created_at)}
                                {" "}in{" "}
                                {listing.location || "Palo Alto, CA"}
                            </p>

                            <hr className="my-6 border-[#dadde1]" />

                            {/* Product details */}
                            <section>
                                <h2 className="mb-4 text-xl font-bold">
                                    Details
                                </h2>

                                <div className="mb-4 flex justify-between gap-4 text-sm">

                                    <span className="font-semibold">
                                        Category
                                    </span>

                                    <span className="text-right text-[#65676b]">
                                        {listing.category}
                                    </span>

                                </div>

                                <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                                    {listing.description ||
                                        "No description provided."}
                                </p>
                            </section>

                            <hr className="my-6 border-[#dadde1]" />

                            {/* Seller information */}
                            <section>
                                <h2 className="mb-4 text-xl font-bold">
                                    Seller information
                                </h2>

                                <div className="flex items-center gap-3">

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e4e6eb]">
                                        <UserRound
                                            size={24}
                                            className="text-[#65676b]"
                                        />
                                    </div>

                                    <span className="font-semibold">
                                        Marketplace seller
                                    </span>

                                </div>
                            </section>

                            <hr className="my-6 border-[#dadde1]" />

                            {/* Message seller */}
                            <div className="space-y-5">
                                <BuyNow
                                    key={`purchase-${listing.id}`}
                                    listingId={listing.id}
                                />

                                {listing.status !== "sold" && (
                                    <div className="rounded-xl border border-[#dadde1] bg-white p-5">
                                        <MessageSeller
                                            key={listing.id}
                                            listingId={listing.id}
                                        />
                                    </div>
                                )}
                            </div>

                        </aside>

                    </div>
                )}
            </main>
        </div>
    );
}