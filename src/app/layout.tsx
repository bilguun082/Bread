import type { Metadata, Viewport } from 'next';
import './globals.css';
import Link from 'next/link';
import { Truck, Store, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Гарын Сайн Талх - Хүргэлт & Тооцоо',
  description: 'Ээжийн талх хүргэлт, өр авлага, өдрийн хаалт, 58mm чек хэвлэх систем',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 antialiased flex flex-col items-center">
        {/* Main Mobile App Container */}
        <div className="w-full max-w-lg min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 shadow-2xl relative">
          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-5">{children}</main>

          {/* Bottom Sticky Mobile Navigation Bar */}
          <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
            <div className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-2 px-4 shadow-xl flex items-center justify-around pointer-events-auto">
              {/* Tab 1: Хүргэлт */}
              <Link
                href="/"
                className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-amber-600 active:scale-95 transition-all"
              >
                <Truck className="w-6 h-6 stroke-[2.2]" />
                <span className="text-[11px] font-black mt-1">Хүргэлт</span>
              </Link>

              {/* Tab 2: Дэлгүүрүүд */}
              <Link
                href="/stores"
                className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-amber-600 active:scale-95 transition-all"
              >
                <Store className="w-6 h-6 stroke-[2.2]" />
                <span className="text-[11px] font-black mt-1">Дэлгүүр</span>
              </Link>

              {/* Tab 3: Тайлан */}
              <Link
                href="/reports"
                className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-amber-600 active:scale-95 transition-all"
              >
                <BarChart3 className="w-6 h-6 stroke-[2.2]" />
                <span className="text-[11px] font-black mt-1">Тайлан</span>
              </Link>
            </div>
          </nav>
        </div>
      </body>
    </html>
  );
}
