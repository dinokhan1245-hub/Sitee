import Header from '@/components/Header';
import HomeSections from '@/components/HomeSections';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

export default function ProductsPage() {
    return (
        <div className="min-h-screen bg-[#f1f3f6]">
            <Header />
            <main>
                <div className="bg-white px-4 py-3 mb-1 shadow-sm flex items-center gap-2 text-sm text-gray-600 font-inter">
                    <Link href="/" className="hover:text-[#2874f0] transition-colors">Home</Link>
                    <span className="text-gray-400">›</span>
                    <span className="font-medium text-gray-800">All Products</span>
                </div>
                <HomeSections />
            </main>
            <BottomNav />
        </div>
    );
}
