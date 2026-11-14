interface SendMessageInput {
    listing_id: string;
    buyer_email: string;
    message: string;
}

export async function sendSellerMessage(
    input: SendMessageInput
): Promise<{
    success: boolean;
    emailSent: boolean;
    message: string;
}> {
    const response = await fetch("/api/messages", {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Unable to send message."
        );
    }

    return data;
}