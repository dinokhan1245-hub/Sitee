'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, type Product } from '@/lib/supabase';
import { FALLBACK_PRODUCTS } from '@/lib/products';

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { data, error } = await supabase.from('products').select('*').order('created_at');
        if (!error && data?.length) {
          setProducts(data as Product[]);
          setLoading(false);
          return;
        }
      }
      setProducts(FALLBACK_PRODUCTS as Product[]);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded mb-3" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((p) => (
        <Link key={p.id} href={`/product/${p.id}`} className="group block">
          <article className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden border border-gray-100">
            <div className="relative aspect-square bg-gray-100">
              {p.image_url ? (
                <Image
                  src={p.image_url}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
              {p.badge && (
                <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-green-500 text-white rounded">
                  {p.badge}
                </span>
              )}
              <button type="button" className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow hover:bg-white" onClick={(e) => e.preventDefault()}>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-500 truncate">Flipkart</p>
              <h2 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-[#2874f0]">{p.name}</h2>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-green-600 text-xs font-medium">↓{p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : 0}%</span>
                {p.original_price && <span className="text-gray-400 text-xs line-through">₹{p.original_price}</span>}
                <span className="font-semibold text-gray-900">₹{p.price}</span>
              </div>
              {p.badge && <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">Hot Deal</span>}
              <div className="mt-2 flex items-center gap-1">
                <span className="inline-flex text-green-600 text-xs font-medium">★ {Number(p.rating).toFixed(1)}</span>
                <span className="text-gray-500 text-xs">Assured</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Delivery by tomorrow</p>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
