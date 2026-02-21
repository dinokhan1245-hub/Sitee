'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to home page after 3 seconds
        const timer = setTimeout(() => {
            router.push('/');
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            {/* Green Tick Circle Animation */}
            <div className="relative w-24 h-24 mb-6">
                <svg className="checkmark w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle className="checkmark-circle text-[#12b127]" cx="26" cy="26" r="25" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="checkmark-check text-[#12b127]" fill="none" stroke="currentColor" strokeWidth="3" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#212121] mb-2 font-sans tracking-tight">Order Placed!</h1>
            <p className="text-gray-500 text-center font-medium">Thank you for shopping with us.</p>
            <p className="text-gray-400 text-sm mt-8 animate-pulse">Redirecting to Home...</p>

            <style jsx>{`
        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-miterlimit: 10;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark-check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
        }
        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
        </div>
    );
}
