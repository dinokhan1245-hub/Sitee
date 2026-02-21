'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, type Order, type Product } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';

export default function OrdersPage() {
  const [orders, setOrders] = useState<(Order & { product?: Product })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { data } = await supabase
          .from('orders')
          .select(`
            *,
            product:products(*)
          `)
          .order('created_at', { ascending: false });
        setOrders((data as (Order & { product: Product })[]) || []);
      } else {
        const local = typeof window !== 'undefined' ? localStorage.getItem('flipkart_orders') : null;
        setOrders(local ? JSON.parse(local) : []);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-20">
      <header className="sticky top-0 z-50 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-1 rounded hover:bg-gray-100 text-gray-700">←</Link>
        <span className="font-medium text-gray-900">Account / Cart</span>
        <Link href="/admin" className="ml-auto text-sm text-[#2874f0] font-medium">Admin</Link>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>No orders yet.</p>
            <Link href="/" className="inline-block mt-4 text-[#2874f0] font-medium">Continue shopping</Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.first_name} {order.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.address}, {order.city} - {order.zip_code}
                      </p>
                      {order.product && (
                        <p className="text-sm text-gray-700 mt-1">{order.product.name}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        ₹99 • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        order.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'cancelled'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status === 'paid' ? 'Paid' : order.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                    </span>
                  </div>
                  {order.utr && (
                    <p className="text-xs text-gray-500 mt-2">UTR: {order.utr}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
