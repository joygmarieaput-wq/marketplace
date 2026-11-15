import Link from "next/link";
import { Store, Plus } from "lucide-react";
import SellerMenu from "@/components/marketplace/SellerMenu";

export default function MarketplaceHeader() {
    return (
        <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#dadde1] bg-white px-4 md:px-6">
            <Link
                href="/"
                className="flex items-center gap-3"
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877f2] text-white">
                    <Store size={23} />
                </div>

                <span className="text-xl font-bold tracking-tight text-[#050505]">
                    Marketplace
                </span>
            </Link>

            <div className="flex items-center gap-3">
                <Link
                    href="/create"
                    className="flex items-center gap-2 rounded-lg bg-[#1877f2] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#166fe5]"
                >
                    <Plus size={18} />

                    <span className="hidden sm:inline">
                        Create new listing
                    </span>

                    <span className="sm:hidden">
                        Create
                    </span>
                </Link>

                <SellerMenu />
            </div>
        </header>
    );
}