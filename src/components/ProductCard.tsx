'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/supabase';

const BRANDS = ['J K INTERNATIONAL', 'Easymart', 'Flipkart', 'BabyMart', 'ToyWorld', 'KidZone', 'PlayPlus', 'FunLearn'];

function productTitleDisplay(name: string, maxChars = 28): string {
  if (name.length <= maxChars) return name;
  return name.slice(0, maxChars).trim() + '...';
}

function StarRating({ rating }: { rating: number }) {
  const r = Math.min(5, Math.max(0, Number(rating)));
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const isFilled = r >= i;
        const isHalf = !isFilled && r >= i - 0.5;

        return (
          <span key={i} className="relative w-4 h-4 shrink-0">
            {/* Empty Star Background */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#e0e0e0" aria-hidden="true" className="absolute top-0 left-0">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {/* Filled Star Foreground */}
            {(isFilled || isHalf) && (
              <span
                className={`absolute top-0 left-0 overflow-hidden ${isHalf ? 'w-1/2' : 'w-full'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#12b127" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function AssuredBadge() {
  return (
    <span className="inline-flex items-center">
      <img
        src="/flipkart-assured.png"
        alt="Assured"
        className="h-4 w-auto object-contain"
      />
    </span>
  );
}

type ProductCardProps = {
  product: Product;
  index: number;
  showSponsored?: boolean;
  deliveryText?: 'express_today' | 'tomorrow_2h';
};

export default function ProductCard({ product: p, index }: ProductCardProps) {
  const brand = BRANDS[index % BRANDS.length];
  const discount = p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : 0;

  return (
    <Link
      href={`/product/${p.id}`}
      className="block relative bg-white hover:shadow-md transition-shadow group"
    >
      <div className="relative aspect-square w-full">
        {(p.images?.[0] || p.image_url) ? (
          <Image
            src={p.images?.[0] || p.image_url || ''}
            alt={p.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}

        {/* Heart Icon */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-sm border border-gray-100 hover:bg-gray-50"
          aria-label="Add to wishlist"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="px-2 pb-4 pt-1">
        <h3 className="text-[14px] text-[#212121] leading-tight mb-1 truncate group-hover:text-[#2874f0]">
          {brand} {productTitleDisplay(p.name)}
        </h3>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#12b127] font-semibold text-[16px] flex items-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-[1px]">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
            {discount}%
          </span>
          {p.original_price && (
            <span className="text-[14px] text-[#878787] line-through decoration-[#878787]">
              ₹{p.original_price.toLocaleString('en-IN')}
            </span>
          )}
          <span className="text-[16px] font-bold text-[#212121]">
            ₹{p.price.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Hot Deal Badge */}
        <div className="mt-2">
          <span className="inline-block px-1.5 py-0.5 text-[12px] font-medium text-[#12b127] bg-[#e6f4ea] rounded-sm">
            Hot Deal
          </span>
        </div>

        {/* Ratings and Assured */}
        <div className="flex items-center gap-2 mt-2.5">
          <StarRating rating={Number(p.rating)} />
          <AssuredBadge />
        </div>
      </div>
    </Link>
  );
}
