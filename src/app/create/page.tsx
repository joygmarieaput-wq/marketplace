import Link from "next/link";

import {
    Package,
    Layers,
    CarFront,
    House,
    Tag,
    ArrowLeft,
    CircleHelp,
    ChevronRight,
} from "lucide-react";

import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import { categories } from "@/lib/categories";

const listingTypes = [
    {
        title: "Item for sale",
        description: "Sell your everyday items on Marketplace.",
        icon: Package,
        href: "/create/item",
        disabled: false,
    },
    {
        title: "Create multiple listings",
        description: "Create several listings at the same time.",
        icon: Layers,
        href: "/create/multiple",
        disabled: false,
    },
    {
        title: "Vehicle for sale",
        description: "Sell your car, motorcycle or other vehicle.",
        icon: CarFront,
        href: "/create/item?type=vehicle",
        disabled: false,
    },
    {
        title: "Home for sale or rent",
        description: "List your house, apartment or property.",
        icon: House,
        href: "/create/item?type=property",
        disabled: false,
    },
];

export default function ChooseListingTypePage() {
    return (
        <div className="min-h-screen">
            <MarketplaceHeader />

            {/* Sidebar */}
            <aside className="marketplace-sidebar fixed bottom-0 left-0 top-16 hidden w-[280px] overflow-y-auto border-r border-[#dadde1] bg-white p-4 lg:block">

                <h1 className="mb-5 text-2xl font-bold">
                    Create new listing
                </h1>

                <nav className="space-y-1">

                    <div className="flex items-center gap-3 rounded-lg bg-[#e7f3ff] p-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1877f2] text-white">
                            <Tag size={19} />
                        </div>

                        <span className="text-sm font-semibold text-[#1877f2]">
                            Choose listing type
                        </span>

                    </div>

                    <Link
                        href="/"
                        className="flex items-center gap-3 rounded-lg p-3 hover:bg-[#f0f2f5]"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e4e6eb]">
                            <ArrowLeft size={19} />
                        </div>

                        <span className="text-sm font-medium">
                            Back to Marketplace
                        </span>
                    </Link>

                    <Link
                        href="/create/help"
                        className="flex items-center gap-3 rounded-lg p-3 hover:bg-[#f0f2f5]"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e4e6eb]">
                            <CircleHelp size={19} />
                        </div>

                        <span className="text-sm font-medium">
                            Seller help
                        </span>
                    </Link>

                </nav>

                <hr className="my-5 border-[#dadde1]" />

                {/* Categories */}
                <h2 className="mb-3 text-lg font-bold">
                    Categories
                </h2>

                <div className="space-y-1">
                    {categories.map((category) => {
                        const Icon = category.icon;

                        return (
                            <Link
                                key={category.name}
                                href={`/create/item?category=${encodeURIComponent(category.name)}`}
                                className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-[#f0f2f5]"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e4e6eb]">
                                    <Icon size={18} />
                                </div>

                                <span className="flex-1 text-sm font-medium">
                                    {category.name}
                                </span>

                                <ChevronRight
                                    size={15}
                                    className="text-[#65676b]"
                                />
                            </Link>
                        );
                    })}
                </div>

            </aside>

            {/* Main content */}
            <main className="min-h-screen px-4 pb-10 pt-24 lg:ml-[280px] lg:px-8">

                <div className="mx-auto max-w-[1200px]">

                    <Link
                        href="/"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-[#65676b] lg:hidden"
                    >
                        <ArrowLeft size={18} />
                        Back to Marketplace
                    </Link>

                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-bold">
                            Choose listing type
                        </h2>

                        <p className="mt-2 text-sm text-[#65676b]">
                            What would you like to sell today?
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                        {listingTypes.map((item) => {
                            const Icon = item.icon;

                            const content = (
                                <>
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#e7f3ff]">
                                        <Icon
                                            size={36}
                                            strokeWidth={1.7}
                                            className="text-[#1877f2]"
                                        />
                                    </div>

                                    <h3 className="mb-3 text-lg font-bold">
                                        {item.title}
                                    </h3>

                                    <p className="text-sm leading-relaxed text-[#65676b]">
                                        {item.description}
                                    </p>
                                </>
                            );

                            const cardClass =
                                "relative flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-[#dadde1] bg-white p-6 text-center transition";

                            if (item.disabled) {
                                return (
                                    <div
                                        key={item.title}
                                        aria-disabled="true"
                                        className={`${cardClass} cursor-not-allowed opacity-60`}
                                    >
                                        <span className="absolute right-3 top-3 rounded-full bg-[#e4e6eb] px-2.5 py-1 text-[10px] font-semibold">
                                            Coming soon
                                        </span>

                                        {content}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className={`${cardClass} hover:-translate-y-1 hover:border-[#1877f2] hover:shadow-md`}
                                >
                                    {content}
                                </Link>
                            );
                        })}

                    </div>
                </div>

            </main>
        </div>
    );
}