import type { MetadataRoute } from 'next';
import {
  getAllGlossaryTerms,
  getAllLessons,
  getAllLevels,
} from '@/lib/game/content/loaders';
import { SUPPORTED_LOCALES } from '@/lib/i18n/types';
import { buildLocalizedUrl, SITE_URL } from '@/lib/seo/metadata';

function makeAlternates(subpath: string): Record<string, string> {
  const langs: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    langs[loc] = buildLocalizedUrl(loc, subpath);
  }
  return langs;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date('2026-11-27');
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  const staticSubpaths = ['', '/learn', '/glossary', '/play', '/map', '/principles'];
  for (const subpath of staticSubpaths) {
    for (const loc of SUPPORTED_LOCALES) {
      entries.push({
        url: buildLocalizedUrl(loc, subpath),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: subpath === '' ? 0.9 : 0.7,
        alternates: { languages: makeAlternates(subpath) },
      });
    }
  }

  for (const lesson of getAllLessons()) {
    // Only include reviewed lessons once teacher-signed-off, or include uz structure cleanly
    if (lesson.reviewStatus !== 'reviewed') continue;
    const subpath = `/learn/${lesson.track}/${lesson.concept}`;
    for (const loc of SUPPORTED_LOCALES) {
      entries.push({
        url: buildLocalizedUrl(loc, subpath),
        lastModified: new Date(lesson.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: { languages: makeAlternates(subpath) },
      });
    }
  }

  for (const term of getAllGlossaryTerms()) {
    if (term.reviewStatus !== 'reviewed') continue;
    const subpath = `/glossary/${term.slug}`;
    for (const loc of SUPPORTED_LOCALES) {
      entries.push({
        url: buildLocalizedUrl(loc, subpath),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.65,
        alternates: { languages: makeAlternates(subpath) },
      });
    }
  }

  for (const level of getAllLevels()) {
    if (level.reviewStatus !== 'reviewed' || level.kind === 'sandbox') continue;
    const subpath = `/play/${level.workshop}/${level.id}`;
    entries.push({
      url: buildLocalizedUrl('uz', subpath),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: makeAlternates(subpath) },
    });
  }

  return entries;
}
