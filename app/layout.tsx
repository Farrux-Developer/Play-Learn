import type { Metadata } from 'next';
import {
  Bricolage_Grotesque,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from 'next/font/google';
import './globals.css';

const displayFont = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Oʻyna va oʻrgan — Algoritm Ustaxonasi',
  description:
    '12 yoshli oʻquvchilar uchun oʻzbek tilidagi interaktiv dasturlash va mantiqiy fikrlash oʻyinlari.',
  openGraph: {
    title: 'Oʻyna va oʻrgan — Algoritm Ustaxonasi',
    description:
      '12 yoshli oʻquvchilar uchun oʻzbek tilidagi interaktiv dasturlash va mantiqiy fikrlash oʻyinlari.',
    type: 'website',
    locale: 'uz_UZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oʻyna va oʻrgan — Algoritm Ustaxonasi',
    description:
      '12 yoshli oʻquvchilar uchun oʻzbek tilidagi interaktiv dasturlash va mantiqiy fikrlash oʻyinlari.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="uz"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
}
