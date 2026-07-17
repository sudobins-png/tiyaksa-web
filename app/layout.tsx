import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/Toaster';
import './globals.css';

const inter = Inter({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ТиЯКСа.Ремонт — Ремонт квартир в Санкт-Петербурге',
  description:
    'Ремонт квартир под ключ в Санкт-Петербурге. Фиксированная смета, видеоотчёты каждую неделю, управляющая компания. Гарантия 3 года.',
  keywords: 'ремонт квартир СПб, ремонт под ключ, ТиЯКСа, ремонт Санкт-Петербург',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
