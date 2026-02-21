# Deployment Guide: Flipkart Clone

This guide covers how to deploy the Next.js application to Vercel and set up your Supabase database.

## 1. Supabase Database Setup

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Once the project is created, navigate to the **SQL Editor** on the left sidebar.
3. Open the `supabase/migrations/001_initial.sql` file from this repository.
4. Copy the entire contents of `001_initial.sql` and paste it into the Supabase SQL Editor.
5. Click **Run** to execute the SQL. This will:
   - Create the `products`, `orders`, and `settings` tables.
   - Insert the initial 8 fallback toys into the database.
   - Insert the default QR code URL into the settings table.
   - Enable Row Level Security (RLS) policies.

## 2. Obtain Supabase API Keys

1. In your Supabase dashboard, go to **Project Settings** (the gear icon).
2. Click on **API** under the Configuration section.
3. You will need two values:
   - **Project URL**: This will be your `NEXT_PUBLIC_SUPABASE_URL`.
   - **Project API Keys (anon public)**: This will be your `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 3. Vercel Deployment

1. Make sure your code is pushed to a GitHub, GitLab, or Bitbucket repository.
2. Go to [Vercel](https://vercel.com/) and log in.
3. Click **Add New** -> **Project**.
4. Import the repository containing your Flipkart clone.
5. In the **Configure Project** step, open the **Environment Variables** section.
6. Add the following variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: (Paste your Supabase Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Paste your Supabase anon key)
   - `NEXT_PUBLIC_ADMIN_SECRET`: (Choose a secure password for your Admin Panel. Default is `admin123`)
7. Click **Deploy**.

Vercel will build and deploy your Next.js App Router application. Once finished, you will be provided with a live deployment URL.

## 4. Admin Panel Access
You can access the admin panel on your live site by navigating to `https://<your-vercel-domain>/admin`. Use the password you set in `NEXT_PUBLIC_ADMIN_SECRET` to log in, view orders, see users, and update your payment QR code.
