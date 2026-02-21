'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, type Order, type Product } from '@/lib/supabase';

export default function AdminPage() {
  const [orders, setOrders] = useState<(Order & { product?: Product })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [qrCode, setQrCode] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingQr, setSavingQr] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [secret, setSecret] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [dbPassword, setDbPassword] = useState(process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin123');

  useEffect(() => {
    if (!unlocked) return;
    async function fetchData() {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const [ordersRes, productsRes, qrRes, passRes] = await Promise.all([
          supabase.from('orders').select('*, product:products(*)').order('created_at', { ascending: false }),
          supabase.from('products').select('*').order('created_at'),
          supabase.from('settings').select('*').eq('id', 'qr_code').single(),
          supabase.from('settings').select('*').eq('id', 'admin_password').single(),
        ]);
        setOrders((ordersRes.data as (Order & { product: Product })[]) || []);
        setProducts((productsRes.data as Product[]) || []);
        if (qrRes.data) {
          setQrCode(qrRes.data.value);
        }
        if (passRes.data) {
          setDbPassword(passRes.data.value);
          setAdminPassword(passRes.data.value);
        } else {
          setAdminPassword(process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin123');
        }
      } else {
        const local = typeof window !== 'undefined' ? localStorage.getItem('flipkart_orders') : null;
        setOrders(local ? JSON.parse(local) : []);
        setProducts([]);
      }
      setLoading(false);
    }
    fetchData();
    async function fetchPreLoginData() {
      if (!unlocked && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const passRes = await supabase.from('settings').select('*').eq('id', 'admin_password').single();
        if (passRes.data) {
          setDbPassword(passRes.data.value);
        }
      }
    }
    fetchPreLoginData();
  }, [unlocked]);

  const saveQrCode = async () => {
    setSavingQr(true);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await supabase.from('settings').upsert({ id: 'qr_code', value: qrCode });
      alert('QR Code updated successfully!');
    } else {
      alert('Supabase not connected. Cannot save setting.');
    }
    setSavingQr(false);
  };

  const saveAdminPassword = async () => {
    setSavingPassword(true);
    if (!adminPassword.trim()) {
      alert('Password cannot be empty');
      setSavingPassword(false);
      return;
    }
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { error } = await supabase.from('settings').upsert({ id: 'admin_password', value: adminPassword });
      if (!error) {
        setDbPassword(adminPassword);
        alert('Admin password updated successfully!');
      } else {
        alert('Failed to update password');
      }
    } else {
      alert('Supabase not connected. Cannot save custom password.');
    }
    setSavingPassword(false);
  };

  // Derive unique 'users' from orders (buyers)
  const users = Array.from(new Set(orders.map(o => o.first_name + ' ' + o.last_name))).map(name => {
    const userOrders = orders.filter(o => o.first_name + ' ' + o.last_name === name);
    return {
      name,
      address: userOrders[0].address,
      city: userOrders[0].city,
      zip: userOrders[0].zip_code,
      orderCount: userOrders.length,
      lastOrder: userOrders[0].created_at
    };
  });

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-sm">
          <h1 className="text-lg font-semibold text-gray-900 mb-4">Admin login</h1>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin secret"
            className="w-full px-3 py-2 border border-gray-300 rounded mb-4 outline-none focus:ring-2 focus:ring-[#2874f0]"
          />
          <button
            type="button"
            onClick={() => setUnlocked(secret === dbPassword)}
            className="w-full py-2 rounded font-medium bg-[#2874f0] text-white hover:bg-blue-700"
          >
            Enter
          </button>
          <p className="text-xs text-gray-500 mt-4">Default: admin123 (or whatever you set below)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-gray-800 text-white px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-1 rounded hover:bg-white/10">←</Link>
        <span className="font-medium">Admin panel</span>
        <Link href="/orders" className="ml-auto text-sm text-[#ffe500]">My orders</Link>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-8 pb-20">

        {/* Settings Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Settings</h2>
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment QR Code URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="https://example.com/my-qr-code.png"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#2874f0]"
              />
              <button
                onClick={saveQrCode}
                disabled={savingQr}
                className="px-4 py-2 bg-[#2874f0] text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {savingQr ? 'Saving...' : 'Save'}
              </button>
            </div>
            {qrCode && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                <img src={qrCode} alt="QR Code Preview" className="w-24 h-24 object-contain border border-gray-200 rounded" />
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Change Admin Password</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter new admin password"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#2874f0]"
              />
              <button
                onClick={saveAdminPassword}
                disabled={savingPassword}
                className="px-4 py-2 bg-[#2874f0] text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {savingPassword ? 'Saving...' : 'Update Password'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              This changes the password required to access this admin panel. It immediately applies to all future logins.
            </p>
          </div>
        </section>

        {/* Users Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Users / Customers</h2>
          {loading ? (
            <div className="bg-white rounded-lg shadow p-4 animate-pulse h-40" />
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Address</th>
                      <th className="px-4 py-2">Total Orders</th>
                      <th className="px-4 py-2">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No customers yet.</td></tr>
                    ) : (
                      users.map((u, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-4 py-2 font-medium">{u.name}</td>
                          <td className="px-4 py-2 text-gray-600">{u.address}, {u.city} {u.zip}</td>
                          <td className="px-4 py-2">{u.orderCount}</td>
                          <td className="px-4 py-2 text-gray-500">{new Date(u.lastOrder).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">All orders</h2>
          {loading ? (
            <div className="bg-white rounded-lg shadow p-4 animate-pulse h-40" />
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Item</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">UTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No orders yet.</td></tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-2 max-w-[150px] truncate" title={order.product?.name}>{order.product?.name || 'Unknown'}</td>
                          <td className="px-4 py-2">{order.first_name} {order.last_name}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                              order.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-mono text-xs">{order.utr || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Products Library</h2>
          {products.length === 0 && !loading ? (
            <p className="text-gray-500 text-sm">Connect Supabase to see products.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-lg shadow p-3 text-sm flex flex-col">
                  {p.image_url && <img src={p.image_url} alt="" className="w-full h-24 object-contain mb-2" />}
                  <p className="font-medium text-gray-900 line-clamp-2 leading-tight flex-1">{p.name}</p>
                  <p className="text-gray-600 mt-2 font-semibold">₹{p.price}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
