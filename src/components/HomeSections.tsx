'use client';

import { useEffect, useState } from 'react';
import { supabase, type Product } from '@/lib/supabase';
import { FALLBACK_PRODUCTS } from '@/lib/products';
import ProductCard from './ProductCard';

export default function HomeSections() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Sorting/Filtering State
  const [sortBy, setSortBy] = useState('relevance');

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

  // Compute displayed products
  const displayedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return Number(b.rating) - Number(a.rating);
    // relevance / popularity fallback to default order
    return 0;
  });

  return (
    <div className="bg-[#f1f3f6] pb-20 sm:pb-8">
      {/* Sticky Sort / Filter Header */}
      <div className="sticky top-[60px] sm:top-[73px] z-40 bg-white border-b border-gray-200 shadow-sm flex items-center justify-around py-3 text-[14px] font-medium text-gray-700">
        <button
          onClick={() => setSortOpen(true)}
          className="flex items-center justify-center gap-2 flex-1 border-r border-gray-200"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="13" y2="6"></line>
            <line x1="4" y1="12" x2="9" y2="12"></line>
            <line x1="4" y1="18" x2="7" y2="18"></line>
            <polyline points="15 15 18 18 21 15"></polyline>
            <line x1="18" y1="6" x2="18" y2="18"></line>
          </svg>
          Sort
        </button>
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center justify-center gap-2 flex-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
          Filter
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {displayedProducts.map((p, index) => (
              <ProductCard
                key={p.id}
                product={p}
                index={index}
                showSponsored={index < 4}
                deliveryText={index % 2 === 0 ? 'express_today' : 'tomorrow_2h'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sort Bottom Sheet */}
      {sortOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setSortOpen(false)}>
          <div className="bg-white w-full sm:w-[400px] rounded-t-lg sm:rounded-lg overflow-hidden animate-slide-up sm:animate-none" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-200 text-gray-500 font-medium text-sm">
              SORT BY
            </div>
            <div className="flex flex-col">
              {[
                { id: 'relevance', label: 'Relevance' },
                { id: 'popularity', label: 'Popularity' },
                { id: 'price_asc', label: 'Price -- Low to High' },
                { id: 'price_desc', label: 'Price -- High to Low' },
                { id: 'newest', label: 'Newest First' },
              ].map(option => (
                <label key={option.id} className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50">
                  <span className={`text-[15px] flex-1 ${sortBy === option.id ? 'font-medium text-blue-600' : 'text-gray-800'}`}>
                    {option.label}
                  </span>
                  <input
                    type="radio"
                    name="sort"
                    value={option.id}
                    checked={sortBy === option.id}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setTimeout(() => setSortOpen(false), 200);
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Sidebar / Sheet */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50" onClick={() => setFilterOpen(false)}>
          <div className="bg-white w-[85%] sm:w-[350px] h-full flex flex-col animate-slide-right sm:animate-none" onClick={e => e.stopPropagation()}>
            <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white pb-3 shadow-sm z-10">
              <button onClick={() => setFilterOpen(false)} className="mr-3 p-1 rounded-full hover:bg-gray-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <span className="font-medium text-[16px]">Filters</span>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Left Column (Categories) */}
              <div className="w-[120px] bg-[#f0f0f0] overflow-y-auto">
                {['Price', 'F-Assured', 'Discount', 'Age Group', 'Customer Ratings', 'Brand', 'Offers', 'Availability'].map((cat, i) => (
                  <div key={cat} className={`px-3 py-4 text-sm ${i === 0 ? 'bg-white text-blue-600 border-l-4 border-blue-600 font-medium' : 'text-gray-700'}`}>
                    {cat}
                  </div>
                ))}
              </div>

              {/* Right Column (Options) */}
              <div className="flex-1 overflow-y-auto p-4 bg-white">
                <div className="space-y-6">
                  {[
                    'Rs. 250 and Below',
                    'Rs. 251 - Rs. 500',
                    'Rs. 501 - Rs. 1000',
                    'Rs. 1001 - Rs. 2000',
                    'Rs. 2001 - Rs. 5000',
                    'Rs. 5001 and Above'
                  ].map(price => (
                    <label key={price} className="flex items-center gap-3">
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[14px] text-gray-800">{price}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-200 p-2 flex items-center justify-between bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
              <span className="text-[15px] font-medium pl-2">66,434 <span className="text-gray-500 text-xs font-normal relative -top-0.5">products</span></span>
              <button
                onClick={() => setFilterOpen(false)}
                className="bg-[#fb641b] text-white px-8 py-2.5 rounded shadow-sm font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
