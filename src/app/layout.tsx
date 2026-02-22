import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ToysDeal - Online Toy Store',
  description: 'Shop the best toys, games, and gifts for kids of all ages at ToysDeal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
