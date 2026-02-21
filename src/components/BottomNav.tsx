'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const items = [
    { href: '/', label: 'Home', icon: 'home' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 sm:relative sm:border-0">
      <div className="flex items-center justify-around max-w-lg mx-auto h-14 sm:hidden">
        {items.map((item) => {
          const active = item.href === '/' ? isHome : false;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[80px] py-1 ${active ? 'text-[#2874f0]' : 'text-gray-600'
                }`}
            >
              {item.icon === 'home' && (
                <svg className="w-5 h-5 mb-[1px]" viewBox="0 0 24 24" fill={active ? '#2874f0' : 'currentColor'} strokeWidth={active ? 0 : 2}>
                  <path d="M12 2L2 11h3v10h14V11h3L12 2zm-2 15h4v-5h-4v5z" fill={active ? '#2874f0' : '#878787'} />
                </svg>
              )}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
