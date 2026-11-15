import Stripe from "stripe";

export function getStripe(): Stripe {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
        throw new Error("Stripe secret key is not configured.");
    }

    if (!secretKey.startsWith("sk_test_")) {
        throw new Error("Only Stripe sandbox keys are allowed.");
    }

    return new Stripe(secretKey);
}