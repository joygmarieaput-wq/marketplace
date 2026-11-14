import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
    title: "Marketplace | Buy and Sell",
    description:
        "Discover, buy, and sell items in your local community.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}

                <Toaster
                    position="top-right"
                    richColors
                />
            </body>
        </html>
    );
}