import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DesignGalleryClient } from '@/components/ui/DesignGalleryClient';

export const metadata: Metadata = {
  title: 'Dizayn tizimi galereyasi — Oʻyna va oʻrgan',
  robots: { index: false, follow: false },
};

export default function DesignGalleryPage() {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.SHOW_GALLERY !== '1'
  ) {
    notFound();
  }

  return <DesignGalleryClient />;
}
