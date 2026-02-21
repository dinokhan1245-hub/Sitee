import type { Product } from './supabase';

export const FALLBACK_PRODUCTS: Omit<Product, 'created_at'>[] = [];
