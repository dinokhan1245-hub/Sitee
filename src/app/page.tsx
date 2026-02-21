import Header from '@/components/Header';
import HomeSections from '@/components/HomeSections';
import BottomNav from '@/components/BottomNav';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Header />
      <main>
        <HomeSections />
      </main>
      <BottomNav />
    </div>
  );
}
