import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

const CATEGORIES = [
  { name: 'Fashion', href: '/' },
  { name: 'Travel', href: '#' },
  { name: 'Electronics', href: '#' },
  { name: 'Home & Kitchen', href: '#' },
  { name: 'Auto', href: '#' },
  { name: 'Toys', href: '/' },
  { name: 'Mobiles', href: '#' },
  { name: 'Food & Health', href: '#' },
  { name: 'Appliances', href: '#' },
  { name: 'Beauty', href: '#' },
  { name: 'Furniture', href: '#' },
  { name: 'Sports', href: '#' },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-20 sm:pb-8">
      <Header />
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900 mb-4">Categories</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="flex items-center justify-center p-4 rounded-sm bg-white border border-gray-200 text-sm font-medium text-gray-800 hover:text-[#2874f0] hover:shadow-sm transition"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
