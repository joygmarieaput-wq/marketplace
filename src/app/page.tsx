"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    PackageOpen,
    Search,
    SearchX,
    AlertCircle,
    Plus,
} from "lucide-react";

import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import MarketplaceSidebar from "@/components/marketplace/MarketplaceSidebar";
import ListingCard from "@/components/marketplace/ListingCard";
import ListingSkeleton from "@/components/marketplace/ListingSkeleton";

import { getListings } from "@/lib/listings";
import { categories } from "@/lib/categories";
import { Listing } from "@/types/marketplace";

export default function HomePage() {
    const [selectedCategory, setSelectedCategory] =
        useState("All");

    const [search, setSearch] = useState("");

    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let active = true;

        async function fetchListings() {
            try {
                const data = await getListings();

                if (active) {
                    setListings(data);
                    setError("");
                }
            } catch (error) {
                if (active) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "Unable to load listings."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        fetchListings();

        return () => {
            active = false;
        };
    }, [retryCount]);

    const filteredListings = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return listings.filter((listing) => {
            const matchesCategory =
                selectedCategory === "All" ||
                listing.category === selectedCategory;

            const matchesSearch =
                !keyword ||
                listing.title.toLowerCase().includes(keyword) ||
                (listing.description || "")
                    .toLowerCase()
                    .includes(keyword) ||
                listing.category.toLowerCase().includes(keyword) ||
                (listing.location || "")
                    .toLowerCase()
                    .includes(keyword);

            return matchesCategory && matchesSearch;
        });
    }, [listings, selectedCategory, search]);

    const gridClass =
        "grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

    function resetFilters() {
        setSearch("");
        setSelectedCategory("All");
    }

    return (
        <div className="min-h-screen">
            <MarketplaceHeader />

            <MarketplaceSidebar
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                search={search}
                onSearchChange={setSearch}
            />

            <main className="min-h-screen px-4 pb-8 pt-24 lg:ml-[280px] lg:px-6">

                {/* Mobile search and categories */}
                <div className="mb-6 space-y-4 lg:hidden">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676b]"
                        />

                        <input
                            type="search"
                            placeholder="Search Marketplace"
                            aria-label="Search Marketplace"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="w-full rounded-full border border-[#dadde1] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#1877f2]"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {["All", ...categories.map((c) => c.name)].map(
                            (category) => (
                                <button
                                    key={category}
                                    onClick={() =>
                                        setSelectedCategory(category)
                                    }
                                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                                        selectedCategory === category
                                            ? "bg-[#1877f2] text-white"
                                            : "bg-white text-[#050505]"
                                    }`}
                                >
                                    {category === "All"
                                        ? "Browse all"
                                        : category}
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Page heading */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">
                        {search.trim()
                            ? "Search results"
                            : selectedCategory === "All"
                                ? "Today's picks"
                                : selectedCategory}
                    </h2>

                    {search.trim() && !loading && !error && (
                        <p className="mt-1 text-sm text-[#65676b]">
                            {filteredListings.length} results for
                            &quot;{search.trim()}&quot;
                        </p>
                    )}
                </div>

                {/* Loading state */}
                {loading ? (
                    <div className={gridClass}>
                        {Array.from({ length: 10 }).map((_, index) => (
                            <ListingSkeleton key={index} />
                        ))}
                    </div>

                /* Error state */
                ) : error ? (
                    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
                        <AlertCircle
                            size={42}
                            className="mb-4 text-red-500"
                        />

                        <h3 className="text-lg font-semibold">
                            Unable to load listings
                        </h3>

                        <p className="mt-2 text-sm text-[#65676b]">
                            Please try again.
                        </p>

                        <button
                            onClick={() => {
                                setLoading(true);
                                setRetryCount((count) => count + 1);
                            }}
                            className="mt-5 rounded-lg bg-[#1877f2] px-5 py-2.5 text-sm font-semibold text-white"
                        >
                            Try again
                        </button>
                    </div>

                /* Product grid */
                ) : filteredListings.length > 0 ? (
                    <div className={gridClass}>
                        {filteredListings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                            />
                        ))}
                    </div>

                /* Empty state */
                ) : (
                    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
                        <div className="mb-4 rounded-full bg-[#e4e6eb] p-5">
                            {search.trim() ||
                            selectedCategory !== "All" ? (
                                <SearchX
                                    size={36}
                                    className="text-[#65676b]"
                                />
                            ) : (
                                <PackageOpen
                                    size={36}
                                    className="text-[#65676b]"
                                />
                            )}
                        </div>

                        <h3 className="text-lg font-semibold">
                            {search.trim() ||
                            selectedCategory !== "All"
                                ? "No matching listings"
                                : "No listings yet"}
                        </h3>

                        <p className="mt-2 text-sm text-[#65676b]">
                            {search.trim() ||
                            selectedCategory !== "All"
                                ? "Try a different keyword or category."
                                : "Be the first to list an item for sale."}
                        </p>

                        {search.trim() ||
                        selectedCategory !== "All" ? (
                            <button
                                onClick={resetFilters}
                                className="mt-5 rounded-lg bg-[#e4e6eb] px-5 py-2.5 text-sm font-semibold"
                            >
                                Clear filters
                            </button>
                        ) : (
                            <Link
                                href="/create"
                                className="mt-5 flex items-center gap-2 rounded-lg bg-[#1877f2] px-5 py-2.5 text-sm font-semibold text-white"
                            >
                                <Plus size={18} />
                                Create new listing
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}