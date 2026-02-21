# Flipkart-like E-commerce (Toys at ₹99)

A Flipkart-style mobile-first e-commerce page with 8 toys at ₹99 each, **Buy now** (no Add to cart), ratings, checkout with address form, payment page (QR + 5 min timer, UTR + "I have paid"), user orders section, and admin panel. Deployable on **Vercel** with **Supabase**.

## Features

- **Home**: Product grid with 8 toys at ₹99, Flipkart-style header (search, sort, filter), ratings, Hot Deal / Assured badges.
- **Product detail**: Tap a product → detail page with **Buy now** only (no Add to cart), rating and reviews count, delivery info.
- **Checkout**: First name, last name, address, city, zip code → **Proceed**.
- **Payment**: Placeholder for **merchant QR**, **5-minute timer**, **UTR** field, **I have paid** button. Submissions go to user orders.
- **My orders**: User sees all their orders (pending/paid, UTR).
- **Admin panel**: View all orders, products (protected by admin secret).

## Quick start (local)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Works without Supabase (uses fallback product data and localStorage for orders).

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migration:

   - Open `supabase/migrations/001_initial.sql` and run its contents in the Supabase SQL Editor.  
     This creates `products` and `orders` tables and seeds 8 toys at ₹99.

3. In **Project Settings → API**:
   - Copy **Project URL** and **anon public** key.

4. Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ADMIN_SECRET=your-admin-secret
```

5. Restart dev server: `npm run dev`.

## Deploy to Vercel

1. Push the repo to GitHub (or connect your Git provider in Vercel).
2. In [Vercel](https://vercel.com): **New Project** → import this repo.
3. **Environment variables** (same as above):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_SECRET`
4. Deploy. Vercel will use the default Next.js build.

## Adding your merchant QR

On the payment page, replace the placeholder “Add your merchant QR here” with your own QR image:

1. Put your QR image in the project (e.g. `public/merchant-qr.png`).
2. In `src/app/payment/page.tsx`, replace the gray placeholder div with:

```tsx
<Image src="/merchant-qr.png" alt="Pay" width={192} height={192} />
```

(Ensure `next.config.js` allows local images or keep the file in `public/`.)

## Admin panel

- URL: `/admin`
- Default secret: `admin123` (override with `NEXT_PUBLIC_ADMIN_SECRET` in production).

## Tech stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Supabase** (database + optional auth)
- **Vercel** (hosting)
