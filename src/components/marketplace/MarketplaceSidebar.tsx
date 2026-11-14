"use client";

import { Search, Store } from "lucide-react";
import { categories } from "@/lib/categories";

interface MarketplaceSidebarProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    search: string;
    onSearchChange: (search: string) => void;
}

export default function MarketplaceSidebar({
    selectedCategory,
    onCategoryChange,
    search,
    onSearchChange,
}: MarketplaceSidebarProps) {
    return (
        <aside className="marketplace-sidebar fixed bottom-0 left-0 top-16 hidden w-[280px] overflow-y-auto border-r border-[#dadde1] bg-white p-4 lg:block">
            <h1 className="mb-4 text-2xl font-bold">
                Marketplace
            </h1>

            <div className="relative mb-4">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676b]"
                />

                <input
                    type="search"
                    placeholder="Search Marketplace"
                    value={search}
                    aria-label="Search Marketplace"
                    onChange={(e) =>
                        onSearchChange(e.target.value)
                    }
                    className="w-full rounded-full bg-[#f0f2f5] py-2.5 pl-10 pr-4 text-sm outline-none"
                />
            </div>

            <button
                onClick={() => onCategoryChange("All")}
                className={`flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm font-semibold transition ${
                    selectedCategory === "All"
                        ? "bg-[#e7f3ff] text-[#1877f2]"
                        : "hover:bg-[#f0f2f5]"
                }`}
            >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877f2] text-white">
                    <Store size={19} />
                </div>

                Browse all
            </button>

            <hr className="my-4 border-[#dadde1]" />

            <h2 className="mb-3 text-lg font-bold">
                Categories
            </h2>

            <nav className="space-y-1">
                {categories.map(({ name, icon: Icon }) => {
                    const active =
                        selectedCategory === name;

                    return (
                        <button
                            key={name}
                            onClick={() =>
                                onCategoryChange(name)
                            }
                            className={`flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm font-medium transition ${
                                active
                                    ? "bg-[#e7f3ff] text-[#1877f2]"
                                    : "hover:bg-[#f0f2f5]"
                            }`}
                        >
                            <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                    active
                                        ? "bg-[#1877f2] text-white"
                                        : "bg-[#e4e6eb]"
                                }`}
                            >
                                <Icon size={19} />
                            </div>

                            {name}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}