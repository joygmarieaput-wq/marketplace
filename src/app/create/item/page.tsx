"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ImagePlus,
    X,
    Loader2,
    MapPin,
    UserRound,
    ImageIcon,
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

function CreateListingForm() {
    const router = useRouter();

    const inputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState("");

    const searchParams = useSearchParams();

    const listingType = searchParams.get("type");
    const requestedCategory = searchParams.get("category");

    const initialCategory =
        listingType === "vehicle"
            ? "Vehicles"
            : listingType === "property"
                ? "Home Sales"
                : categories.some(
                    (category) => category.name === requestedCategory
                )
                    ? requestedCategory || ""
                    : "";

    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        category: initialCategory,
        seller_email: "",
        location: "Palo Alto, CA",
    });

    const pageTitle =
    listingType === "vehicle"
        ? "Vehicle for sale"
        : listingType === "property"
            ? "Home for sale or rent"
            : "Item for sale";

    const availableCategories = categories.filter((category) => {
        if (listingType === "vehicle") {
            return category.name === "Vehicles";
        }

        if (listingType === "property") {
            return ["Home Sales", "Property Rentals"].includes(
                category.name
            );
        }

        return true;
    });

    function updateField(
        field: keyof typeof form,
        value: string
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    useEffect(() => {
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            setPreview(reader.result as string);
        };

        reader.readAsDataURL(file);

        return () => {
            reader.onload = null;

            if (reader.readyState === FileReader.LOADING) {
                reader.abort();
            }
        };
    }, [file]);

    function handlePhoto(selectedFile?: File) {
        if (!selectedFile) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            toast.error("Please select a JPG, PNG, or WEBP image.");
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error("Image must not exceed 5 MB.");
            return;
        }

        setFile(selectedFile);
    }

    function removePhoto() {
        setFile(null);
        setPreview("");

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (loading) return;

        if (!file) {
            toast.error("Please upload a product photo.");
            return;
        }

        if (
            !form.title.trim() ||
            !form.description.trim() ||
            !form.price.trim() ||
            !form.category ||
            !form.seller_email.trim()
        ) {
            toast.error("Please complete all required fields.");
            return;
        }

        const price = Number(form.price);

        if (!Number.isFinite(price) || price < 0 || price > 99999999.99) {
            toast.error("Please enter a valid price.");
            return;
        }

        try {
            setLoading(true);

            const imageUrl = await uploadListingImage(file);

            await createListing({
                title: form.title.trim(),
                description: form.description.trim(),
                price,
                category: form.category,
                seller_email: form.seller_email.trim(),
                location: form.location.trim() || "Palo Alto, CA",
                image_url: imageUrl,
            });

            toast.success("Listing published successfully!");

            router.push("/");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to publish listing."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen">
            <MarketplaceHeader />

            <main className="mx-auto max-w-[1600px] px-4 pb-10 pt-24">

                <Link
                    href="/create"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#65676b] hover:text-[#1877f2]"
                >
                    <ArrowLeft size={18} />
                    Back to listing types
                </Link>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold">
                        {pageTitle}
                    </h1>

                    <p className="mt-1 text-sm text-[#65676b]">
                        Add a photo and provide details about
                        the item you want to sell.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                        <fieldset
                            disabled={loading}
                            className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]"
                        >
                        <div className="space-y-4">
                            {/* Photo upload */}
                            <section className="rounded-xl border border-[#dadde1] bg-white p-5">

                                <h2 className="text-lg font-bold">
                                    Product photo
                                </h2>

                                <p className="mb-4 mt-1 text-sm text-[#65676b]">
                                    Add a clear photo of your item.
                                </p>

                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) =>
                                        handlePhoto(e.target.files?.[0])
                                    }
                                />

                                {file && preview ? (
                                    <div className="relative aspect-video overflow-hidden rounded-lg bg-[#f0f2f5]">

                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={preview}
                                            alt="Product preview"
                                            className="h-full w-full object-contain"
                                        />

                                        <button
                                            type="button"
                                            onClick={removePhoto}
                                            aria-label="Remove photo"
                                            className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-md hover:bg-gray-100"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => inputRef.current?.click()}
                                        className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#ccd0d5] bg-[#f7f8fa] transition hover:bg-[#e7f3ff]"
                                    >
                                        <div className="mb-3 rounded-full bg-[#e4e6eb] p-4">
                                            <ImagePlus size={30} />
                                        </div>

                                        <span className="font-semibold">
                                            Add photo
                                        </span>

                                        <span className="mt-1 text-xs text-[#65676b]">
                                            Click to upload
                                        </span>
                                    </button>
                                )}

                                <p className="mt-3 text-xs text-[#65676b]">
                                    JPG, PNG or WEBP. Maximum file size: 5 MB.
                                </p>

                            </section>

                            {/* Listing information */}
                            <section className="space-y-5 rounded-xl border border-[#dadde1] bg-white p-5">

                                <h2 className="text-lg font-bold">
                                    Listing details
                                </h2>

                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Title *
                                    </Label>

                                    <Input
                                        id="title"
                                        placeholder="What are you selling?"
                                        value={form.title}
                                        onChange={(e) =>
                                            updateField("title", e.target.value)
                                        }
                                        maxLength={255}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">
                                        Price ($) *
                                    </Label>

                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        max="99999999.99"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={form.price}
                                        onChange={(e) =>
                                            updateField("price", e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">
                                        Category *
                                    </Label>

                                    <Select
                                        value={form.category}
                                        onValueChange={(value) =>
                                            updateField("category", value)
                                        }
                                        required
                                    >
                                        <SelectTrigger
                                            id="category"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {availableCategories.map(({ name }) => (
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

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Description *
                                    </Label>

                                    <Textarea
                                        id="description"
                                        placeholder="Describe your item, condition, and other details..."
                                        className="min-h-28 resize-y"
                                        value={form.description}
                                        onChange={(e) =>
                                            updateField("description", e.target.value)
                                        }
                                        maxLength={2000}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="seller_email">
                                        Email address *
                                    </Label>

                                    <Input
                                        id="seller_email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={form.seller_email}
                                        onChange={(e) =>
                                            updateField("seller_email", e.target.value)
                                        }
                                        maxLength={255}
                                        required
                                    />

                                    <p className="text-xs text-[#65676b]">
                                        Used when a buyer contacts you.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">
                                        Location
                                    </Label>

                                    <div className="relative">
                                        <MapPin
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676b]"
                                        />

                                        <Input
                                            id="location"
                                            className="pl-9"
                                            value={form.location}
                                            maxLength={255}
                                            onChange={(e) =>
                                                updateField("location", e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="h-11 w-full bg-[#1877f2] font-semibold text-white hover:bg-[#166fe5]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            Publishing listing...
                                        </>
                                    ) : (
                                        "Create listing"
                                    )}
                                </Button>

                            </section>
                        </div>
                        {/* Live listing preview */}
                        <section className="rounded-xl border border-[#dadde1] bg-white p-5 lg:sticky lg:top-24">

                            <h2 className="mb-4 text-lg font-bold">
                                Preview
                            </h2>

                            <div className="overflow-hidden rounded-lg border border-[#dadde1]">

                                <div className="grid xl:grid-cols-[minmax(0,1fr)_300px]">

                                    {/* Product image preview */}
                                    <div className="flex min-h-[350px] items-center justify-center bg-[#f0f2f5]">

                                        {file && preview ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={preview}
                                                alt="Listing preview"
                                                className="h-full max-h-[650px] w-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-8 text-center text-[#65676b]">

                                                <ImageIcon
                                                    size={56}
                                                    strokeWidth={1.2}
                                                    className="mb-4 text-[#bcc0c4]"
                                                />

                                                <h3 className="text-lg font-semibold">
                                                    Your listing preview
                                                </h3>

                                                <p className="mt-2 max-w-xs text-sm">
                                                    As you create your listing, you can
                                                    preview how it will appear to others
                                                    on Marketplace.
                                                </p>

                                            </div>
                                        )}

                                    </div>

                                    {/* Product details preview */}
                                    <div className="min-w-0 border-t border-[#dadde1] bg-white p-5 xl:border-l xl:border-t-0">

                                        <h1
                                            className={`break-words text-2xl font-bold ${
                                                form.title.trim()
                                                    ? "text-[#050505]"
                                                    : "text-[#bcc0c4]"
                                            }`}
                                        >
                                            {form.title.trim() || "Title"}
                                        </h1>

                                        <p
                                            className={`mt-2 text-xl font-semibold ${
                                                form.price
                                                    ? "text-[#050505]"
                                                    : "text-[#bcc0c4]"
                                            }`}
                                        >
                                            {form.price
                                                ? Number(form.price).toLocaleString("en-US", {
                                                    style: "currency",
                                                    currency: "USD",
                                                })
                                                : "Price"}
                                        </p>

                                        <p className="mt-3 text-sm text-[#65676b]">
                                            Listed just now in{" "}
                                            {form.location.trim() || "Palo Alto, CA"}
                                        </p>

                                        <hr className="my-5 border-[#dadde1]" />

                                        {/* Details */}
                                        <h3 className="mb-3 text-lg font-bold">
                                            Details
                                        </h3>

                                        <div className="mb-4 flex justify-between gap-3 text-sm">
                                            <span className="font-semibold">
                                                Category
                                            </span>

                                            <span className="text-right text-[#65676b]">
                                                {form.category || "Not selected"}
                                            </span>
                                        </div>

                                        <p
                                            className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${
                                                form.description.trim()
                                                    ? "text-[#050505]"
                                                    : "text-[#bcc0c4]"
                                            }`}
                                        >
                                            {form.description.trim() || "Description"}
                                        </p>

                                        <hr className="my-5 border-[#dadde1]" />

                                        {/* Seller information */}
                                        <h3 className="mb-4 text-lg font-bold">
                                            Seller information
                                        </h3>

                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e4e6eb]">
                                                <UserRound
                                                    size={23}
                                                    className="text-[#65676b]"
                                                />
                                            </div>

                                            <span className="text-sm font-semibold">
                                                Marketplace seller
                                            </span>
                                        </div>

                                        <hr className="my-5 border-[#dadde1]" />

                                        {/* Message seller preview */}
                                        <h3 className="mb-3 text-base font-bold">
                                            Send seller a message
                                        </h3>

                                        <Textarea
                                            value="Hi, is this still available?"
                                            disabled
                                            className="mb-3 resize-none bg-[#f0f2f5]"
                                        />

                                        <Button
                                            type="button"
                                            disabled
                                            className="w-full bg-[#1877f2] text-white"
                                        >
                                            Send
                                        </Button>

                                    </div>

                                </div>

                            </div>

                        </section>
                    </fieldset>
                </form>
            </main>
        </div>
    );
}

export default function CreateListingPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1877f2]" />
                </div>
            }
        >
            <CreateListingForm />
        </Suspense>
    );
}