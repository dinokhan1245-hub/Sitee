# Supabase & Vercel Setup Guide

This file contains all the necessary instructions, SQL queries, and environment variables to deploy your Flipkart Clone on Vercel and configure your Supabase backend.

## 1. Supabase SQL Queries

Run the follow SQL code in your **Supabase -> SQL Editor**. This sets up all the tables (products and orders) with proper schemas and security policies.

```sql
-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;

-- 1. Create the `products` table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 99,
  original_price INTEGER,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  highlights JSONB DEFAULT '{}'::jsonb,
  rating DECIMAL(2,1) DEFAULT 4.2,
  review_count INTEGER DEFAULT 0,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on Row Level Security (RLS) for the `products` table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to SELECT products freely
CREATE POLICY "Allow public read access to products" 
  ON products FOR SELECT USING (true);

-- 2. Create the `orders` table (for saving user checkout data)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending_payment',
  utr TEXT,
  paid_at TIMESTAMPTZ,
  payment_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on Row Level Security (RLS) for the `orders` table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT new orders
CREATE POLICY "Allow public insert into orders" 
  ON orders FOR INSERT WITH CHECK (true);

-- Allow anonymous users to UPDATE orders they have created (for entering UTR digits)
CREATE POLICY "Allow public to update pending orders"
  ON orders FOR UPDATE USING (status = 'pending_payment');

-- Allow reading orders (Used in the Admin Panel)
CREATE POLICY "Allow public read access to orders" 
  ON orders FOR SELECT USING (true);

-- 3. Create the `settings` table (For admin settings like QR Code and Dynamic Password)
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on Row Level Security (RLS) for the `settings` table
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access to settings (In production, restrict to authenticated users)
CREATE POLICY "Allow public access to settings" 
  ON settings FOR ALL USING (true) WITH CHECK (true);

-- Insert the default admin password into the settings table
INSERT INTO settings (id, value) VALUES ('admin_password', 'admin123') ON CONFLICT (id) DO NOTHING;

-- 4. Set up Supabase Storage for Admin QR Code Uploads
-- Insert a new public bucket named 'public-assets' if it doesn't already exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read files from 'public-assets'
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'public-assets');

-- Allow public access to upload files to 'public-assets' (In production, restrict to authenticated)
CREATE POLICY "Allow Public Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'public-assets');

-- Allow public access to update files in 'public-assets'
CREATE POLICY "Allow Public Updates" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'public-assets');
```

## 2. Vercel Environment Variables

When deploying the application to Vercel, go into your project settings -> **Environment Variables** and add the following keys.

*Grab your Supabase URL and Anon Key from **Project Settings -> API** in your Supabase dashboard.*

| Key | Value (Example) | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-url.supabase.co` | Your Supabase project REST URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsIn...` | Your Supabase `anon` / `public` API key |
| `NEXT_PUBLIC_ADMIN_SECRET` | `admin123` | Secure password to log into the `/raja` Admin route |

### Required `.env.local` for Local Testing
Create a `.env.local` file in the root of the project with the same keys above if you want to test database connections locally. 
*(If not provided, the code will default to using raw fallback JSON products)*.

## 3. Deployment Notes
- Connect your GitHub repository to Vercel.
- The framework preset should automatically be detected as `Next.js`.
- The Build Command is `npm run build` by default. 
- Ensure your environment variables are set **before** deploying so that the initial build can connect successfully to Supabase if you are using static fetching, otherwise client-side connects on load.
