export interface Listing {
    id: string;
    title: string;
    description: string | null;
    price: number;
    category: string;
    image_url: string | null;
    location: string | null;
    status: "available" | "sold";
    sold_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateListing {
    title: string;
    description: string;
    price: number;
    category: string;
    seller_email: string;
    image_url: string;
    location: string;
}

export interface SellerMessage {
    listing_id: string;
    buyer_email: string;
    seller_email: string;
    message: string;
}