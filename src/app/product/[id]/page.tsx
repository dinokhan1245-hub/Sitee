'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, type Product } from '@/lib/supabase';
import { FALLBACK_PRODUCTS } from '@/lib/products';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { data } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
          setProduct(data as Product);
          setLoading(false);
          return;
        }
      }
      const fallback = FALLBACK_PRODUCTS.find((p) => p.id === id);
      setProduct(fallback ? { ...fallback, created_at: '' } as Product : null);
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-1 text-gray-700 hover:text-[#2874f0]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </Link>
          <span className="flex-1 text-sm font-medium text-gray-900">Product</span>
        </header>
        <div className="max-w-lg mx-auto p-4 animate-pulse">
          <div className="aspect-square bg-gray-100 rounded-sm mb-4" />
          <div className="h-6 bg-gray-100 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 mb-4">Product not found.</p>
        <Link href="/" className="text-[#2874f0] font-medium">Back to shop</Link>
      </div>
    );
  }

  const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0;

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-1 text-gray-700 hover:text-[#2874f0]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </Link>
        <span className="flex-1 text-sm font-medium text-gray-900 truncate">{product.name.slice(0, 36)}</span>
      </header>

      <main className="max-w-lg mx-auto">

        {/* Horizontal Image Carousel */}
        <div className="relative group bg-gray-50">
          <div id="image-carousel" className="relative flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {(product.images && product.images.length > 0) ? (
              product.images.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-square w-full shrink-0 snap-center">
                  <Image src={imgUrl} alt={`${product.name} - ${idx + 1}`} fill className="object-contain" sizes="100vw" priority={idx === 0} />
                </div>
              ))
            ) : product.image_url ? (
              <div className="relative aspect-square w-full shrink-0 snap-center">
                <Image src={product.image_url} alt={product.name} fill className="object-contain" sizes="100vw" priority />
              </div>
            ) : (
              <div className="relative aspect-square w-full shrink-0 snap-center flex items-center justify-center text-gray-400">No image</div>
            )}

            {product.badge && (
              <span className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold bg-purple-600 text-white rounded z-10">
                {product.badge}
              </span>
            )}
          </div>

          {(product.images && product.images.length > 1) && (
            <>
              <button
                type="button"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-80 hover:opacity-100 z-10 text-gray-800"
                onClick={() => {
                  const el = document.getElementById('image-carousel');
                  if (el) el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' });
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-80 hover:opacity-100 z-10 text-gray-800"
                onClick={() => {
                  const el = document.getElementById('image-carousel');
                  if (el) el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </>
          )}
        </div>

        <div className="p-4 pt-4">
          <p className="text-[#878787] text-[14px]">Flipkart</p>
          <a href="#" className="text-[#2b39a3] text-[14px] font-medium block mt-0.5 mb-1.5">Visit store</a>
          <h1 className="text-[17px] font-medium text-[#212121] leading-[1.3]">{product.name}</h1>

          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center px-1.5 py-0.5 text-[12px] font-semibold bg-[#12b127] text-white rounded-[4px] gap-1">
              {Number(product.rating).toFixed(1)}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </span>
            <span className="text-[#878787] text-[13px]">{(product.review_count).toLocaleString('en-IN')} ratings</span>
            {product.badge && (
              <img src="/flipkart-assured.png" alt="Assured" className="h-[14px] w-auto ml-1" />
            )}
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[#12b127] font-semibold text-[16px]">↓{discount}%</span>
            {product.original_price && <span className="text-[#878787] line-through text-[16px]">₹{product.original_price}</span>}
            <span className="text-[24px] font-bold text-[#212121] ml-1">₹{product.price}</span>
          </div>

          {/* Highlights Grid */}
          {product.highlights && Object.keys(product.highlights).length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h2 className="text-[16px] font-medium text-[#212121] mb-3">Highlights</h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[14px]">
                {Object.entries(product.highlights).slice(0, 4).map(([key, value], idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-gray-400 shrink-0">•</span>
                    <div>
                      <span className="text-[#878787] block text-[13px]">{key}</span>
                      <span className="text-[#212121] font-medium truncate w-[140px] block">{String(value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.description && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h2 className="text-[16px] font-medium text-[#212121] mb-2">Description</h2>
              <p className="text-[14px] text-[#6c6c6c] leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="mt-6 border-t border-gray-100 pt-4">
            <h2 className="text-[16px] font-medium text-[#212121] mb-2">Delivery details</h2>
            <div className="space-y-1.5 text-[14px] text-[#212121]">
              <p className="text-[#6c6c6c]">Enter delivery address at checkout</p>
              <p>EXPRESS Delivery by Tomorrow</p>
              <p className="text-[#6c6c6c]">Fulfilled by Flipkart · 5 years with Flipkart</p>
            </div>
          </div>

          <div className="mt-5 flex gap-4 text-[13px] text-[#6c6c6c] items-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">↺</div>
              <span>7-Day Return</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">₹</div>
              <span>Cash on Delivery</span>
            </div>
            {product.badge === 'Assured' && (
              <div className="flex flex-col items-center gap-1 ml-auto mr-4">
                <img src="/flipkart-assured.png" alt="Assured" className="h-4 w-auto" />
                <span className="text-[#2874f0] font-medium text-[11px]">Assured</span>
              </div>
            )}
          </div>

        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-white border-t border-gray-200 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] flex gap-3 z-50">
        <button
          type="button"
          onClick={() => router.push(`/checkout?product=${product.id}`)}
          className="flex-1 py-3.5 px-6 rounded-[2px] font-medium bg-[#fb641b] text-white hover:bg-[#e05a18] transition"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
