import type { Metadata } from 'next';
import type { ReviewStatus } from '@/lib/game/core/types';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/types';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
  'https://oynavaorgan.uz';

export const SITE_NAME = 'Oʻyna va oʻrgan';

export interface LocalizedMetaInput {
  locale: Locale;
  /** Path after /{locale}, e.g. '' or '/learn/algoritm/ketma-ketlik' */
  subpath: string;
  title: string;
  description: string;
  reviewStatus?: ReviewStatus;
  forceNoIndex?: boolean;
}

export function buildLocalizedUrl(locale: Locale, subpath: string): string {
  const clean = subpath.startsWith('/') || subpath === '' ? subpath : `/${subpath}`;
  return `${SITE_URL}/${locale}${clean}`;
}

export function buildLocalizedMetadata({
  locale,
  subpath,
  title,
  description,
  reviewStatus = 'draft',
  forceNoIndex = false,
}: LocalizedMetaInput): Metadata {
  const canonical = buildLocalizedUrl(locale, subpath);
  const languages: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    languages[loc] = buildLocalizedUrl(loc, subpath);
  }
  languages['x-default'] = buildLocalizedUrl('uz', subpath);

  const indexable = !forceNoIndex && reviewStatus === 'reviewed';

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
      languages,
    },
    robots: {
      index: indexable,
      follow: true,
    },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
      locale: locale === 'uz' ? 'uz_UZ' : locale === 'ru' ? 'ru_RU' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
