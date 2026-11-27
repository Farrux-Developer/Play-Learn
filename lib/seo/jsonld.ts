import type { Locale } from '@/lib/i18n/types';
import { SITE_NAME, SITE_URL } from './metadata';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildOrganizationAndSiteJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: `${SITE_URL}/${locale}`,
        inLanguage: locale,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };
}

export function buildBreadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildLearningResourceJsonLd(input: {
  title: string;
  description: string;
  url: string;
  locale: Locale;
  dateModified: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: input.title,
    headline: input.title,
    description: input.description,
    url: input.url,
    inLanguage: input.locale,
    dateModified: input.dateModified,
    isAccessibleForFree: true,
    educationalLevel: 'Grades 5-6',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function buildDefinedTermJsonLd(input: {
  term: string;
  description: string;
  url: string;
  locale: Locale;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: input.term,
    description: input.description,
    url: input.url,
    inLanguage: input.locale,
  };
}
