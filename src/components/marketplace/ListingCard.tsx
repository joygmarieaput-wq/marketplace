import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Listing } from "@/types/marketplace";
import { formatPrice } from "@/lib/format";

interface ListingCardProps {
    listing: Listing;
}

export default function ListingCard({
    listing,
}: ListingCardProps) {

    const isSold = listing.status === "sold";

    return (
        <Link
            href={`/listings/${listing.id}`}
            className="group block min-w-0"
        >

            {/* Product image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-[#e4e6eb]">

                {listing.image_url ? (
                    <img
                        src={listing.image_url}
                        alt={listing.title}
                        loading="lazy"
                        className={`h-full w-full object-cover transition duration-300 ${
                            isSold
                                ? "opacity-60"
                                : "group-hover:scale-105"
                        }`}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon
                            size={40}
                            className="text-[#65676b]"
                        />
                    </div>
                )}

                {/* Sold badge */}
                {isSold && (
                    <div className="absolute left-3 top-3 rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm">
                        SOLD
                    </div>
                )}

            </div>

            {/* Product information */}
            <div className="space-y-1 pt-2">

                <p className="text-lg font-bold text-[#050505]">
                    {formatPrice(listing.price)}
                </p>

                <h3 className="truncate text-[15px] text-[#050505]">
                    {listing.title}
                </h3>

                <p className="truncate text-sm text-[#65676b]">
                    {listing.location || "Palo Alto, CA"}
                </p>

            </div>

        </Link>
    );
}