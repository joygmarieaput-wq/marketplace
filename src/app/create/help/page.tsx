import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";

const questions = [
    {
        question: "How do I create a listing?",
        answer: "Choose a listing type, upload a photo, enter your product details and click Create listing.",
    },
    {
        question: "Do I need an account?",
        answer: "No. You can create a listing without registering for an account.",
    },
    {
        question: "What images can I upload?",
        answer: "You can upload JPG, PNG or WEBP images up to 5 MB.",
    },
    {
        question: "Is creating a listing free?",
        answer: "Yes. Creating a listing on Marketplace is free.",
    },
    {
        question: "How do I contact a seller?",
        answer: "Open a listing, enter your email address and write a message using the Message Seller form.",
    },
];

export default function SellerHelpPage() {
    return (
        <div className="min-h-screen">
            <MarketplaceHeader />

            <main className="mx-auto max-w-3xl px-4 pb-10 pt-24">
                <Link
                    href="/create"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-[#65676b] hover:text-[#1877f2]"
                >
                    <ArrowLeft size={18} />
                    Back to listing types
                </Link>

                <h1 className="mb-2 text-3xl font-bold">
                    Seller help
                </h1>

                <p className="mb-6 text-[#65676b]">
                    Everything you need to get started.
                </p>

                <div className="divide-y divide-[#dadde1] rounded-xl border border-[#dadde1] bg-white">
                    {questions.map((item) => (
                        <details
                            key={item.question}
                            className="p-5"
                        >
                            <summary className="cursor-pointer font-semibold">
                                {item.question}
                            </summary>

                            <p className="mt-3 text-sm leading-relaxed text-[#65676b]">
                                {item.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </main>
        </div>
    );
}