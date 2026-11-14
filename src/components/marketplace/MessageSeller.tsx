"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { sendSellerMessage } from "@/lib/messages";

interface MessageSellerProps {
    listingId: string;
}

export default function MessageSeller({
    listingId,
}: MessageSellerProps) {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(
        "Hi, is this still available?"
    );

    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (loading) return;

        if (!email.trim() || !message.trim()) {
            toast.error("Please enter your email and message.");
            return;
        }

        try {
            setLoading(true);

            const result = await sendSellerMessage({
                listing_id: listingId,
                buyer_email: email.trim(),
                message: message.trim(),
            });

            setSent(true);

            if (result.emailSent) {
                toast.success("Message sent successfully!");
            } else {
                toast.warning(
                    "Message saved. Email notification is unavailable in this demo."
                );
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to send message."
            );
        } finally {
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-center">

                <CheckCircle2
                    size={36}
                    className="mx-auto mb-3 text-green-600"
                />

                <h3 className="font-semibold text-green-800">
                    Message sent successfully!
                </h3>

                <p className="mt-2 text-sm text-green-700">
                    The seller will receive an email notification.
                </p>

            </div>
        );
    }

    return (
        <section>
            <h2 className="mb-4 text-lg font-bold">
                Send seller a message
            </h2>

            <form onSubmit={handleSubmit}>
                <fieldset
                    disabled={loading}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="buyer_email">
                            Your email address
                        </Label>

                        <Input
                            id="buyer_email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            maxLength={255}
                            required
                        />

                        <p className="text-xs text-[#65676b]">
                            So the seller knows how to contact you.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="buyer_message">
                            Message
                        </Label>

                        <Textarea
                            id="buyer_message"
                            value={message}
                            onChange={(e) =>
                                setMessage(e.target.value)
                            }
                            placeholder="Write your message..."
                            maxLength={1000}
                            className="min-h-24 resize-none bg-[#f0f2f5]"
                            required
                        />

                        <p className="text-right text-xs text-[#65676b]">
                            {message.length}/1000
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={
                            loading ||
                            !email.trim() ||
                            !message.trim()
                        }
                        className="h-11 w-full bg-[#1877f2] font-semibold text-white hover:bg-[#166fe5]"
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={17} />
                                Send
                            </>
                        )}
                    </Button>
                </fieldset>
            </form>
        </section>
    );
}