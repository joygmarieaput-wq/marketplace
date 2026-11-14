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
    return (
        <Link
            href={`/listings/${listing.id}`}
            className="group block min-w-0"
        >
            {/* Product photo */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-[#e4e6eb]">
                {listing.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={listing.image_url}
                        alt={listing.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <ImageIcon
                            size={40}
                            className="text-[#bcc0c4]"
                        />
                    </div>
                )}
            </div>

            {/* Product information */}
            <div className="space-y-1 py-3">
                <p className="text-lg font-bold text-[#050505]">
                    {formatPrice(listing.price)}
                </p>

                <h3 className="truncate text-[15px] text-[#050505]">
                    {listing.title}
                </h3>

                <p className="truncate text-xs text-[#65676b]">
                    {listing.location || "Palo Alto, CA"}
                </p>
            </div>
        </Link>
    );
}