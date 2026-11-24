import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Oʻyna va oʻrgan — Algoritm Ustaxonasi',
  description: 'Oʻzbek tilidagi interaktiv dasturlash va algoritmik fikrlash oʻyin-platformasi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
