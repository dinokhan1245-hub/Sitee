import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client when env vars are set; otherwise use placeholder so the app runs without Supabase (fallback data + localStorage)
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder');

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url?: string | null;
  images: string[];
  highlights: Record<string, string>;
  rating: number;
  review_count: number;
  badge: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  product_id: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  zip_code: string;
  status: 'pending_payment' | 'paid' | 'cancelled';
  utr: string | null;
  paid_at: string | null;
  created_at: string;
  payment_expires_at: string | null;
  product?: Product;
};
