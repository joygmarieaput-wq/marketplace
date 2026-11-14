# Mini Marketplace

A modern, responsive mini-marketplace application inspired by Facebook Marketplace, where visitors can create listings, browse products, and contact sellers without creating an account.

Built as part of a technical assessment to demonstrate full-stack development, database integration, and third-party API integration.

## Features

### Core Features
- Create product listings with photos, titles, descriptions, prices, categories, and seller emails.
- Browse all available listings.
- Filter listings by category.
- View individual listing details.
- Contact sellers without registration.
- Store buyer messages in Supabase.

### Bonus Features
- Keyword search across listings.
- Email notifications using Resend.

### Additional Features
- Live listing preview during creation.
- Multiple listing creation.
- Vehicle and property listing options.
- Seller Help and FAQs.
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
| Vercel | Hosting and deployment |

## How It Works

1. A visitor creates a listing and uploads a product photo.
2. The listing is stored in Supabase, and the photo is uploaded to Supabase Storage.
3. Other visitors can browse, search, and filter available listings.
4. A buyer opens a listing and submits a message to the seller.
5. The message is saved in Supabase, and the server attempts to send an email notification through Resend.

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
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL="Marketplace <onboarding@resend.dev>"
```

Configure the required `listings` and `messages` database tables, storage bucket, and access policies in Supabase.

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Project Scope

This application is a technical assessment prototype designed to demonstrate core marketplace functionality. It is not intended for production use.

## Author

**Joygie Marie Aput**

Full-Stack Web Developer

GitHub: https://github.com/joygmarieaput-wq