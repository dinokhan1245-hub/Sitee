'use client';

import Link from 'next/link';

/** Flipkart-style logo: yellow panel + blue stylized "f" + "Flipkart" wordmark. Matches brand colors #2874f0, #ffe500. */
export default function FlipkartLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-1 shrink-0 no-underline text-[#2874f0] hover:opacity-90"
      aria-label="Flipkart Home"
    >
      <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-sm bg-[#ffe500] flex-shrink-0">
        <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[22px] sm:h-6" aria-hidden>
          {/* Lowercase f: stem + crossbar + curved top */}
          <path d="M8 2v20h2v-8h5v-2h-5V8c0-1.1.9-2 2-2h3V4h-3c-2.2 0-4 1.8-4 4v4H6v2h2v8H6V2h2z" fill="#2874f0"/>
        </svg>
      </span>
      <span className="font-semibold text-[#2874f0] text-base sm:text-lg tracking-tight italic" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        Flipkart
      </span>
    </Link>
  );
}
