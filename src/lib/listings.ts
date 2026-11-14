import { supabase } from "@/lib/supabase";
import { CreateListing, Listing } from "@/types/marketplace";

export async function uploadListingImage(file: File) {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error("Please upload a JPG, PNG, or WEBP image.");
    }

    if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image must not exceed 5 MB.");
    }

    const extension = file.type.split("/")[1];

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
        .from("listing-images")
        .upload(fileName, file, {
            contentType: file.type,
            upsert: false,
        });

    if (error) {
        throw new Error(error.message);
    }

    const { data } = supabase.storage
        .from("listing-images")
        .getPublicUrl(fileName);

    return data.publicUrl;
}

export async function createListing(listing: CreateListing) {
    const { error } = await supabase
        .from("listings")
        .insert(listing);

    if (error) {
        throw new Error(error.message);
    }
}

export async function getListings(): Promise<Listing[]> {
    const { data, error } = await supabase
        .from("listings")
        .select(`
            id,
            title,
            description,
            price,
            category,
            image_url,
            location,
            created_at,
            updated_at
        `)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
}

export async function getListingById(
    id: string
): Promise<Listing | null> {
    const { data, error } = await supabase
        .from("listings")
        .select(`
            id,
            title,
            description,
            price,
            category,
            image_url,
            location,
            created_at,
            updated_at
        `)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}