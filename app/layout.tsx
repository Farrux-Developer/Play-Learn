import type { Metadata } from 'next';
import '@fontsource-variable/onest/wght.css';
import '@fontsource-variable/lexend/wght.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Oʻyna va oʻrgan — Algoritm Ustaxonasi',
  description:
    '5–6-sinf oʻquvchilari uchun oʻzbek tilidagi interaktiv dasturlash va algoritmik fikrlash ustaxonasi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" data-surface="paper" data-tier="mid">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
