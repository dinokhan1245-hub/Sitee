'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';

const PAYMENT_DURATION_SEC = 5 * 60; // 5 minutes

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order') || '';
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_DURATION_SEC);
  const [qrCode, setQrCode] = useState('');
  const [fetchingQr, setFetchingQr] = useState(true);
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function fetchQrCode() {
      console.log('Fetching QR code...');
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        try {
          const { supabase } = await import('@/lib/supabase');
          const { data, error } = await supabase.from('settings').select('*').eq('id', 'qr_code').single();
          if (error) {
            console.error('[SUPABASE] Error fetching QR code:', error);
          } else if (data) {
            console.log('[SUPABASE] QR Code found:', data.value);
            setQrCode(data.value);
          }
        } catch (err) {
          console.error('[SUPABASE] Connection failed:', err);
        }
      }
      setFetchingQr(false);
    }
    fetchQrCode();
  }, []);

  useEffect(() => {
    if (!orderId) return;
    const end = typeof window !== 'undefined' ? sessionStorage.getItem(`payment_end_${orderId}`) : null;
    const endTime = end ? parseInt(end, 10) : Date.now() + PAYMENT_DURATION_SEC * 1000;
    if (!end && typeof window !== 'undefined') sessionStorage.setItem(`payment_end_${orderId}`, String(endTime));

    const tick = () => {
      const left = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleIHavePaid = async () => {
    const utrTrimmed = utr.trim();
    if (utrTrimmed.length !== 12) {
      alert('Please enter a valid 12-digit UTR / Reference number.');
      return;
    }
    setSubmitting(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && orderId && !orderId.startsWith('local-')) {
        const { supabase } = await import('@/lib/supabase');
        await supabase
          .from('orders')
          .update({ status: 'paid', utr: utrTrimmed, paid_at: new Date().toISOString() })
          .eq('id', orderId);
      } else if (orderId.startsWith('local-') && typeof window !== 'undefined') {
        const raw = sessionStorage.getItem(`flipkart_order_${orderId}`);
        if (raw) {
          const order = JSON.parse(raw);
          const saved = { ...order, status: 'paid', utr: utrTrimmed, paid_at: new Date().toISOString(), created_at: order.created_at || new Date().toISOString() };
          sessionStorage.removeItem(`flipkart_order_${orderId}`);
          const list = localStorage.getItem('flipkart_orders');
          const orders = list ? JSON.parse(list) : [];
          orders.unshift(saved);
          localStorage.setItem('flipkart_orders', JSON.stringify(orders));
        }
      }
      setDone(true);
      setTimeout(() => router.push('/success'), 1500);
    } catch (e) {
      setDone(true);
      setTimeout(() => router.push('/success'), 1500);
    }
    setSubmitting(false);
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 mb-4">Invalid order.</p>
        <Link href="/" className="text-[#2874f0] font-medium">← Back to shop</Link>
      </div>
    );
  }

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const expired = secondsLeft <= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-[#2874f0] text-white px-4 py-3 flex items-center gap-3">
        <Link href="/checkout" className="p-1 rounded hover:bg-white/10">←</Link>
        <span className="font-medium">Pay ₹99</span>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Scan to pay</p>
          <div className="w-48 h-48 mx-auto bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 text-sm overflow-hidden border border-gray-100 relative">
            {fetchingQr ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] text-gray-400">Loading QR...</p>
              </div>
            ) : qrCode ? (
              <img src={qrCode} alt="Payment QR Code" className="w-full h-full object-contain" />
            ) : (
              <div className="p-4 text-center">
                <p className="font-medium text-gray-400">QR Code Not Set</p>
                <p className="text-[10px] mt-1 text-gray-400">Please upload your payment QR in the Admin Panel (/raja)</p>
              </div>
            )}
          </div>
          <p className="mt-3 font-semibold text-gray-900">₹99</p>
          {!expired ? (
            <p className="text-sm text-orange-600 mt-2">Time left: {m}:{s.toString().padStart(2, '0')}</p>
          ) : (
            <p className="text-sm text-red-600 mt-2">Time expired. Please place order again.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">UTR / Reference number (12 digits)</label>
          <input
            type="text"
            maxLength={12}
            value={utr}
            onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 12-digit UTR"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#2874f0] focus:border-[#2874f0] outline-none"
          />
          <button
            type="button"
            onClick={handleIHavePaid}
            disabled={submitting || expired}
            className="w-full mt-4 py-3 rounded font-semibold bg-[#ffe500] text-black hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {done ? 'Saved! Redirecting...' : submitting ? 'Saving...' : 'I have paid'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
