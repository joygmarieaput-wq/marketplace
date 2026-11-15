import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey || !secretKey.startsWith("sk_test_")) {
    throw new Error("A Stripe sandbox secret key is required.");
}

const stripe = new Stripe(secretKey);

const endpoint = await stripe.webhookEndpoints.create({
    url: "https://marketplace-demo-joygie.vercel.app/api/stripe/webhook",
    connect: true,
    enabled_events: [
        "checkout.session.completed",
        "checkout.session.expired",
        "checkout.session.async_payment_succeeded",
        "checkout.session.async_payment_failed",
        "account.updated",
    ],
});

console.log("Webhook ID:", endpoint.id);
console.log("Webhook URL:", endpoint.url);
console.log("Signing secret:", endpoint.secret);