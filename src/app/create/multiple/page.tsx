"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
    ArrowLeft,
    Plus,
    Trash2,
    ImagePlus,
    Loader2,
    CheckCircle2,
    X,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";

import { categories } from "@/lib/categories";

import {
    createListing,
    uploadListingImage,
} from "@/lib/listings";

interface ListingItem {
    id: string;
    title: string;
    price: string;
    category: string;
    description: string;
    file: File | null;
    published: boolean;
    error: string;
}

function emptyListing(id: string): ListingItem {
    return {
        id,
        title: "",
        price: "",
        category: "",
        description: "",
        file: null,
        published: false,
        error: "",
    };
}

function PhotoPreview({ file }: { file: File }) {
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const url = URL.createObjectURL(file);

        if (imageRef.current) {
            imageRef.current.src = url;
        }

        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
            ref={imageRef}
            alt="Product preview"
            className="h-full w-full object-contain"
        />
    );
}

export default function CreateMultipleListingsPage() {
    const router = useRouter();

    const [sellerEmail, setSellerEmail] = useState("");
    const [location, setLocation] = useState("Palo Alto, CA");

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState("");

    const [listings, setListings] = useState<ListingItem[]>([
        emptyListing("initial-1"),
        emptyListing("initial-2"),
    ]);

    const pendingCount = listings.filter(
        (item) => !item.published
    ).length;

    function addListing() {
        if (listings.length >= 10) {
            toast.error("You can create up to 10 listings.");
            return;
        }

        setListings((previous) => [
            ...previous,
            emptyListing(crypto.randomUUID()),
        ]);
    }

    function removeListing(id: string) {
        if (listings.length === 1) {
            toast.error("At least one listing is required.");
            return;
        }

        setListings((previous) =>
            previous.filter((item) => item.id !== id)
        );
    }

    function updateListing(
        id: string,
        changes: Partial<ListingItem>
    ) {
        setListings((previous) =>
            previous.map((item) =>
                item.id === id
                    ? { ...item, ...changes }
                    : item
            )
        );
    }

    function handlePhoto(id: string, file?: File) {
        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error(
                "Please select a JPG, PNG, or WEBP image."
            );
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must not exceed 5 MB.");
            return;
        }

        updateListing(id, { file, error: "" });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (loading) return;

        if (!sellerEmail.trim()) {
            toast.error("Please enter your email address.");
            return;
        }

        const pending = listings.filter(
            (item) => !item.published
        );

        if (!pending.length) return;

        // Validate all listings before uploading anything.
        for (const item of pending) {
            const index = listings.findIndex(
                (listing) => listing.id === item.id
            );

            if (
                !item.file ||
                !item.title.trim() ||
                !item.price.trim() ||
                !item.category ||
                !item.description.trim()
            ) {
                toast.error(
                    `Please complete all fields in Listing ${index + 1}.`
                );
                return;
            }

            const price = Number(item.price);

            if (
                !Number.isFinite(price) ||
                price < 0 ||
                price > 99999999.99
            ) {
                toast.error(
                    `Invalid price in Listing ${index + 1}.`
                );
                return;
            }
        }

        setLoading(true);

        let successCount = 0;
        let failedCount = 0;

        try {
            for (const [index, item] of pending.entries()) {
                setProgress(
                    `Publishing ${index + 1} of ${pending.length}...`
                );

                try {
                    const imageUrl = await uploadListingImage(
                        item.file!
                    );

                    await createListing({
                        title: item.title.trim(),
                        description: item.description.trim(),
                        price: Number(item.price),
                        category: item.category,
                        seller_email: sellerEmail.trim(),
                        location:
                            location.trim() || "Palo Alto, CA",
                        image_url: imageUrl,
                    });

                    updateListing(item.id, {
                        published: true,
                        error: "",
                    });

                    successCount++;
                } catch (error) {
                    updateListing(item.id, {
                        error:
                            error instanceof Error
                                ? error.message
                                : "Unable to publish listing.",
                    });

                    failedCount++;
                }
            }

            if (failedCount === 0) {
                toast.success(
                    `${successCount} listing(s) published successfully!`
                );

                router.push("/");
            } else {
                toast.error(
                    `${successCount} published, ${failedCount} failed. You can retry the failed listings.`
                );
            }
        } finally {
            setLoading(false);
            setProgress("");
        }
    }

    return (
        <div className="min-h-screen">
            <MarketplaceHeader />

            <main className="mx-auto max-w-5xl px-4 pb-10 pt-24">

                <Link
                    href="/create"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#65676b] hover:text-[#1877f2]"
                >
                    <ArrowLeft size={18} />
                    Back to listing types
                </Link>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold">
                        Create multiple listings
                    </h1>

                    <p className="mt-2 text-sm text-[#65676b]">
                        Add and publish several items at once.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>

                    <fieldset
                        disabled={loading}
                        className="space-y-5"
                    >

                        {/* Shared seller information */}
                        <section className="rounded-xl border border-[#dadde1] bg-white p-5">

                            <h2 className="mb-4 text-lg font-bold">
                                Seller information
                            </h2>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="seller_email">
                                        Email address *
                                    </Label>

                                    <Input
                                        id="seller_email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={sellerEmail}
                                        onChange={(e) =>
                                            setSellerEmail(e.target.value)
                                        }
                                        maxLength={255}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">
                                        Location
                                    </Label>

                                    <Input
                                        id="location"
                                        value={location}
                                        maxLength={255}
                                        onChange={(e) =>
                                            setLocation(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <p className="mt-3 text-xs text-[#65676b]">
                                This information will be used for all
                                listings in this batch.
                            </p>

                        </section>

                        {/* Multiple listing forms */}
                        {listings.map((item, index) => (
                            <section
                                key={item.id}
                                className="rounded-xl border border-[#dadde1] bg-white p-5"
                            >

                                <div className="mb-5 flex items-center justify-between border-b border-[#dadde1] pb-4">

                                    <h2 className="text-lg font-bold">
                                        Listing {index + 1}
                                    </h2>

                                    {item.published ? (
                                        <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                                            <CheckCircle2 size={18} />
                                            Published
                                        </span>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Remove listing ${index + 1}`}
                                            disabled={listings.length === 1}
                                            onClick={() =>
                                                removeListing(item.id)
                                            }
                                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    )}

                                </div>

                                <fieldset
                                    disabled={item.published}
                                    className="grid gap-5 md:grid-cols-[260px_minmax(0,1fr)]"
                                >

                                    {/* Product photo */}
                                    <div className="space-y-2">

                                        <Label>
                                            Product photo *
                                        </Label>

                                        {item.file ? (
                                            <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f0f2f5]">

                                                <PhotoPreview
                                                    file={item.file}
                                                />

                                                {!item.published && (
                                                    <button
                                                        type="button"
                                                        aria-label="Remove photo"
                                                        onClick={() =>
                                                            updateListing(
                                                                item.id,
                                                                { file: null }
                                                            )
                                                        }
                                                        className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-sm hover:bg-gray-100"
                                                    >
                                                        <X size={17} />
                                                    </button>
                                                )}

                                            </div>
                                        ) : (
                                            <label
                                                htmlFor={`photo-${item.id}`}
                                                className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#ccd0d5] bg-[#f7f8fa] hover:bg-[#e7f3ff]"
                                            >

                                                <div className="mb-3 rounded-full bg-[#e4e6eb] p-4">
                                                    <ImagePlus size={28} />
                                                </div>

                                                <span className="text-sm font-semibold">
                                                    Add photo
                                                </span>

                                                <span className="mt-1 text-xs text-[#65676b]">
                                                    Click to upload
                                                </span>

                                                <input
                                                    id={`photo-${item.id}`}
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    className="sr-only"
                                                    onChange={(e) =>
                                                        handlePhoto(
                                                            item.id,
                                                            e.target.files?.[0]
                                                        )
                                                    }
                                                />

                                            </label>
                                        )}

                                        <p className="text-xs text-[#65676b]">
                                            JPG, PNG or WEBP. Max 5 MB.
                                        </p>

                                    </div>

                                    {/* Product fields */}
                                    <div className="space-y-4">

                                        <div className="space-y-2">
                                            <Label htmlFor={`title-${item.id}`}>
                                                Title *
                                            </Label>

                                            <Input
                                                id={`title-${item.id}`}
                                                placeholder="What are you selling?"
                                                value={item.title}
                                                onChange={(e) =>
                                                    updateListing(item.id, {
                                                        title: e.target.value,
                                                    })
                                                }
                                                maxLength={255}
                                                required
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">

                                            <div className="space-y-2">
                                                <Label htmlFor={`price-${item.id}`}>
                                                    Price ($) *
                                                </Label>

                                                <Input
                                                    id={`price-${item.id}`}
                                                    type="number"
                                                    min="0"
                                                    max="99999999.99"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={item.price}
                                                    onChange={(e) =>
                                                        updateListing(item.id, {
                                                            price: e.target.value,
                                                        })
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`category-${item.id}`}>
                                                    Category *
                                                </Label>

                                                <Select
                                                    value={item.category}
                                                    disabled={
                                                        item.published ||
                                                        loading
                                                    }
                                                    onValueChange={(value) =>
                                                        updateListing(item.id, {
                                                            category: value,
                                                        })
                                                    }
                                                    required
                                                >
                                                    <SelectTrigger
                                                        id={`category-${item.id}`}
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        {categories.map(({ name }) => (
                                                            <SelectItem
                                                                key={name}
                                                                value={name}
                                                            >
                                                                {name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`description-${item.id}`}>
                                                Description *
                                            </Label>

                                            <Textarea
                                                id={`description-${item.id}`}
                                                placeholder="Describe your item..."
                                                value={item.description}
                                                onChange={(e) =>
                                                    updateListing(item.id, {
                                                        description: e.target.value,
                                                    })
                                                }
                                                className="min-h-28 resize-y"
                                                maxLength={2000}
                                                required
                                            />
                                        </div>

                                    </div>

                                </fieldset>

                                {item.error && (
                                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                        {item.error}
                                    </div>
                                )}

                            </section>
                        ))}

                        {/* Add another listing */}
                        <button
                            type="button"
                            onClick={addListing}
                            disabled={listings.length >= 10}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#ccd0d5] bg-white p-5 font-semibold text-[#1877f2] transition hover:bg-[#e7f3ff] disabled:opacity-50"
                        >
                            <Plus size={20} />
                            Add another listing
                        </button>

                        {/* Publish button */}
                        <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dadde1] bg-white p-4 shadow-sm">

                            <div>
                                <p className="font-semibold">
                                    {pendingCount}{" "}
                                    {pendingCount === 1
                                        ? "listing"
                                        : "listings"}{" "}
                                    to publish
                                </p>

                                <p className="text-xs text-[#65676b]">
                                    Maximum of 10 items per batch
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={
                                    loading || pendingCount === 0
                                }
                                className="h-11 bg-[#1877f2] px-6 font-semibold text-white hover:bg-[#166fe5]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        {progress}
                                    </>
                                ) : (
                                    `Publish ${pendingCount} ${
                                        pendingCount === 1
                                            ? "listing"
                                            : "listings"
                                    }`
                                )}
                            </Button>

                        </div>

                    </fieldset>
                </form>
            </main>
        </div>
    );
}