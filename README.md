
# Mini Marketplace

A modern, responsive mini-marketplace application inspired by Facebook Marketplace, where visitors can create listings, browse products, contact sellers, and purchase items without creating a marketplace account.

Built as part of a technical assessment to demonstrate full-stack development, database integration, third-party API integration, and marketplace payment processing using Stripe Connect.

## Live Demo

https://marketplace-demo-joygie.vercel.app

## Features

### Test 3 — Mini Marketplace

#### Core Features

- Create product listings with photos, titles, descriptions, prices, categories, and seller emails.
- Browse product listings.
- Filter listings by category.
- View individual listing details.
- Contact sellers without registration.
- Store buyer messages in Supabase.

#### Bonus Features

- Keyword search across listings.
- Email notifications using Resend.

### Test 4 — Stripe Connect Integration

- Seller onboarding through Stripe Connect.
- Stripe-hosted account verification using sandbox test data.
- Connected seller accounts stored in Supabase.
- Automatic Buy Now availability for eligible seller listings.
- Secure payments through Stripe Checkout.
- Automatic 10% platform commission per successful sale.
- Payments processed directly through connected seller accounts.
- Webhook-based payment confirmation.
- Automatic order recording in Supabase.
- Automatic listing status updates after successful payments.
- Payment success and cancellation pages.
- Duplicate purchase prevention.
- Stripe account status monitoring.

### Additional Features

- Live listing preview during creation.
- Multiple listing creation.
- Vehicle and property listing options.
- Seller profile and payment setup.
- Seller Help and FAQs.
- Visual indicators for sold listings.
- Responsive desktop and mobile layouts.
- Form validation and loading indicators.
- Success and error notifications.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack application framework |
| React | User interface |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling and responsive layouts |
| shadcn/ui | UI components |
| Lucide React | Icons |
| Supabase | PostgreSQL database and image storage |
| Resend | Email notifications |
| Stripe Connect | Seller onboarding and marketplace payments |
| Stripe Checkout | Hosted payment processing |
| Stripe Webhooks | Payment confirmation and order processing |
| Vercel | Hosting and deployment |

## How It Works

### Marketplace Workflow

1. A visitor creates a listing and uploads a product photo.
2. The listing is stored in Supabase, and the photo is uploaded to Supabase Storage.
3. Other visitors can browse, search, and filter listings.
4. A buyer opens a listing and submits a message to the seller.
5. The message is saved in Supabase, and the server attempts to send an email notification through Resend.

### Seller Onboarding

1. The seller opens the Seller Profile page.
2. The seller enters the same email address used when creating their listings.
3. The seller clicks Connect Stripe Account.
4. Stripe redirects the seller to its hosted onboarding page.
5. The seller completes onboarding using sandbox test information.
6. The connected Stripe account ID and account status are stored in Supabase.
7. Eligible listings associated with the seller's email address display a Buy Now button.

### Purchase and Payment Workflow

1. A buyer opens an available listing belonging to a connected seller.
2. The buyer clicks Buy Now.
3. The server validates the listing and creates a pending order.
4. The buyer is redirected to Stripe Checkout.
5. Stripe processes the payment through the connected seller account and applies the platform commission.
6. A Stripe webhook confirms the successful payment.
7. The order is marked as paid in Supabase.
8. The listing is automatically marked as Sold.
9. The buyer sees a payment success page.

## Platform Commission

The marketplace applies a configurable platform commission of 10% per successful transaction.

### Example Transaction

| Description | Amount |
|---|---:|
| Product price | $100.00 |
| Platform commission (10%) | $10.00 |
| Seller share | $90.00 |

The seller share is calculated before applicable Stripe processing fees.

The integration uses Stripe Connect direct charges with an application fee. Payment transactions and platform fees can be verified through Stripe, while order details are recorded in Supabase.

## Stripe Sandbox Testing

The application uses Stripe sandbox mode only. No real payments are processed.

### Testing Seller Onboarding

1. Create a listing using a test seller email address.
2. Navigate to the Seller Profile page.
3. Enter the same seller email address.
4. Click Connect Stripe Account.
5. Complete Stripe onboarding using test information.
6. Return to the marketplace and verify the connected account status.
7. Open the listing and confirm that the Buy Now button is available.

### Testing a Purchase

Use the following Stripe test card details during Checkout:

| Field | Test Value |
|---|---|
| Card number | 4242 4242 4242 4242 |
| Expiration date | Any future date |
| CVC | Any three digits |
| Cardholder name | Any test name |
| Postal code | Any valid test postal code, if required |

After completing the payment, verify that:

- The payment succeeds in Stripe sandbox.
- The platform commission is applied.
- The seller receives the remaining amount, less any applicable Stripe fees.
- The buyer is redirected to the payment success page.
- The order is recorded in Supabase.
- The listing displays a Sold badge.
- The sold listing can no longer be purchased.

## Database

The application uses Supabase PostgreSQL for data storage.

| Table | Purpose |
|---|---|
| listings | Product listings and availability status |
| messages | Buyer messages sent to sellers |
| sellers | Connected Stripe accounts and account status |
| orders | Purchase records, payment status, and commission breakdown |

Supabase Storage is used to store uploaded listing images.

## Email Notification

Email notifications are integrated using the Resend API and have been successfully tested.

For demonstration purposes, the application uses Resend's default testing sender domain. Email delivery is currently limited to the registered Resend account email address.

Messages are still successfully stored in Supabase regardless of email delivery status. A verified sending domain is required to enable notifications to other sellers.

## Getting Started

Clone the repository:

```bash
git clone https://github.com/joygmarieaput-wq/Marketplace.git
cd Marketplace
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file with the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL="Marketplace <onboarding@resend.dev>"

STRIPE_SECRET_KEY=your_stripe_test_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_test_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
STRIPE_PLATFORM_FEE_PERCENT=10

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Configure the required database tables, storage bucket, access policies, and order completion database function in Supabase.

Configure an authorized Stripe sandbox account with Stripe Connect enabled.

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Stripe Webhook Configuration

The application uses the following webhook endpoint:

```text
/api/stripe/webhook
```

The webhook listens for the following connected account events:

- `checkout.session.completed`
- `checkout.session.expired`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`

For local development, Stripe CLI can be used to forward connected account events:

```bash
stripe listen \
  --events checkout.session.completed,checkout.session.expired,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed \
  --forward-connect-to localhost:3000/api/stripe/webhook
```

Use authorized sandbox credentials when running Stripe CLI.

For deployment, configure the webhook endpoint using the deployed application URL and its corresponding webhook signing secret.

## Security

- Stripe secret keys are handled on the server.
- Live-mode Stripe secret keys are rejected.
- Environment credentials are excluded from version control.
- Stripe Checkout handles sensitive card information.
- Webhook signatures are verified before processing payment events.
- Product prices and platform fees are calculated on the server.
- Sensitive seller and order records are restricted from public database access.
- Successful order completion and listing status updates are performed within a database transaction.

## Project Scope and Limitations

This application is a technical assessment prototype designed to demonstrate core marketplace functionality and Stripe Connect integration.

- All payments are processed in Stripe sandbox mode.
- A full marketplace authentication system is outside the assessment scope.
- Seller listings are associated with connected accounts using matching email addresses.
- Seller email ownership is not independently verified by the marketplace.
- Email notifications are limited by Resend's testing sender restrictions.
- Certain unexpected payment initialization failures may require manual reconciliation.

The application is not intended for production use without additional authentication, authorization, and operational safeguards.

## Author

**Joygie Marie Aput**

Full-Stack Web Developer

GitHub: https://github.com/joygmarieaput-wq