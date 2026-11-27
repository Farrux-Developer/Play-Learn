import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Oʻyna va oʻrgan — Mirzo Ustaxonasi',
    short_name: 'Mirzo Ustaxonasi',
    description:
      '5–6-sinf oʻquvchilari uchun oflayn IT-asoslari va algoritmik fikrlash oʻyin ustaxonasi.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6F3EA',
    theme_color: '#0B3566',
    lang: 'uz',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
