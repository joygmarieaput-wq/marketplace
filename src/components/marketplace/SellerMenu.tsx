"use client";

import Link from "next/link";
import {
    UserRound,
    Package,
    CreditCard,
    Receipt,
    CircleHelp,
    ChevronRight,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
    {
        label: "Seller Profile",
        href: "/seller",
        icon: UserRound,
    },
    {
        label: "Payment Setup",
        href: "/seller#payment-setup",
        icon: CreditCard,
    },
    {
        label: "Seller Help",
        href: "/create/help",
        icon: CircleHelp,
    },
];

export default function SellerMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Open seller menu"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e4e6eb] transition hover:bg-[#d8dadf] focus-visible:ring-2 focus-visible:ring-[#1877f2]"
                >
                    <UserRound className="h-5 w-5 text-[#050505]" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="w-72 rounded-xl border-[#dadde1] bg-white p-2 shadow-xl"
            >
                <div className="flex items-center gap-3 p-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7f3ff]">
                        <UserRound className="h-6 w-6 text-[#1877f2]" />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-[#050505]">
                            Seller Center
                        </p>

                        <p className="text-xs text-[#65676b]">
                            Manage your marketplace
                        </p>
                    </div>
                </div>

                <DropdownMenuSeparator />

                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <DropdownMenuItem
                            key={item.label}
                            asChild
                            className="cursor-pointer rounded-lg p-2"
                        >
                            <Link
                                href={item.href}
                                className="flex items-center gap-3"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f2f5]">
                                    <Icon className="h-[18px] w-[18px] text-[#050505]" />
                                </span>

                                <span className="flex-1 text-sm font-medium">
                                    {item.label}
                                </span>

                                <ChevronRight className="h-4 w-4 text-[#65676b]" />
                            </Link>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}