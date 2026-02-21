'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('product') || '';
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    address: '',
    city: '',
    zip_code: '',
    phone: '',
  });

  const INDIAN_STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand",
    "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal"
  ];

  const handleProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !form.address.trim() || !form.city.trim() || !form.zip_code.trim() || !form.phone.trim()) {
      alert('Please fill all fields.');
      return;
    }
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(form.zip_code.trim())) {
      alert('Please enter a valid 6-digit PIN code.');
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone.trim())) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    const orderPayload = {
      product_id: productId,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      address: form.address.trim(),
      city: form.city, // We are storing the state in the city column for now to avoid schema changes
      zip_code: form.zip_code.trim(),
      phone: `+91${form.phone.trim()}`,
      status: 'pending_payment' as const,
      payment_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { supabase } = await import('@/lib/supabase');
        const { data: order, error } = await supabase
          .from('orders')
          .insert(orderPayload)
          .select('id')
          .single();
        if (!error && order?.id) {
          router.push(`/payment?order=${order.id}`);
          setLoading(false);
          return;
        }
      }
      const orderId = `local-${Date.now()}`;
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(`flipkart_order_${orderId}`, JSON.stringify({ ...orderPayload, id: orderId, created_at: new Date().toISOString() }));
      }
      router.push(`/payment?order=${orderId}`);
    } catch (err) {
      const orderId = `local-${Date.now()}`;
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(`flipkart_order_${orderId}`, JSON.stringify({ ...orderPayload, id: orderId, created_at: new Date().toISOString() }));
      }
      router.push(`/payment?order=${orderId}`);
    }
    setLoading(false);
  };

  if (!productId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 mb-4">No product selected.</p>
        <Link href="/" className="text-[#2874f0] font-medium">← Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-[#2874f0] text-white px-4 py-3 flex items-center gap-3">
        <Link href={`/product/${productId}`} className="p-1 rounded hover:bg-white/10">←</Link>
        <span className="font-medium">Checkout</span>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <h1 className="text-lg font-semibold text-gray-900 mb-4">Delivery details</h1>
        <form onSubmit={handleProceed} className="space-y-4 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input
                type="text"
                required
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#2874f0] focus:border-[#2874f0] outline-none"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input
                type="text"
                required
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#2874f0] focus:border-[#2874f0] outline-none"
                placeholder="Last name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              required
              rows={3}
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#2874f0] focus:border-[#2874f0] outline-none"
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                required
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#2874f0] focus:border-[#2874f0] outline-none bg-white"
              >
                <option value="" disabled>Select state</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={form.zip_code}
                onChange={(e) => setForm((f) => ({ ...f, zip_code: e.target.value.replace(/\D/g, '') }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#2874f0] focus:border-[#2874f0] outline-none"
                placeholder="6 digits"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label>
            <div className="flex items-center">
              <span className="px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l">+91</span>
              <input
                type="text"
                required
                maxLength={10}
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-r focus:ring-2 focus:ring-[#2874f0] focus:border-[#2874f0] outline-none"
                placeholder="10 digit number"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Used for delivery purposes</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded font-semibold bg-[#ffe500] text-black hover:bg-yellow-400 transition disabled:opacity-70"
          >
            {loading ? 'Proceeding...' : 'Proceed'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}
