import { notFound } from 'next/navigation';
import { LocaleShellHeader } from '@/components/LocaleShellHeader';
import { LazyGameIsland } from '@/components/game/LazyGameIsland';
import {
  getAllGlossaryTerms,
  getAllLessons,
  getAllLevels,
  getLevelById,
  getLevelsByWorkshop,
} from '@/lib/game/content/loaders';
import { isSupportedLocale, SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/types';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

export function generateStaticParams() {
  const params: { locale: string; workshop: string; level: string }[] = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const lvl of getAllLevels()) {
      params.push({ locale, workshop: lvl.workshop, level: lvl.id });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; workshop: string; level: string }>;
}) {
  const { locale, workshop, level } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : 'uz';
  const def = getLevelById(level);
  if (!def || def.workshop !== workshop) return {};
  return buildLocalizedMetadata({
    locale: loc,
    subpath: `/play/${workshop}/${level}`,
    title: `${def.title} — Mirzo Ustaxonasi`,
    description: def.goalText ?? def.title,
    reviewStatus: def.reviewStatus,
    forceNoIndex: def.kind === 'sandbox',
  });
}

export default async function PlayLevelPage({
  params,
}: {
  params: Promise<{ locale: string; workshop: string; level: string }>;
}) {
  const { locale, workshop, level } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : 'uz';
  const def = getLevelById(level);
  if (!def || def.workshop !== workshop) {
    notFound();
  }

  const wsLevels = getLevelsByWorkshop(def.workshop);
  const idx = wsLevels.findIndex((l) => l.id === def.id);
  const nextLevel = idx >= 0 && idx + 1 < wsLevels.length ? wsLevels[idx + 1] : null;
  const lesson =
    getAllLessons().find((l) => l.track === def.workshop) ?? getAllLessons()[0];
  const lessonHref = lesson
    ? `/${loc}/learn/${lesson.track}/${lesson.concept}`
    : `/${loc}/learn`;

  return (
    <div data-surface="blueprint" className="ws-surface ws-blueprint-grid ws-girih-bg min-h-screen">
      <LocaleShellHeader
        locale={loc}
        active="play"
        surface="blueprint"
        subpath={`/play/${workshop}/${level}`}
      />

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <LazyGameIsland
          locale={loc}
          level={def}
          nextLevelId={nextLevel ? nextLevel.id : null}
          glossaryTerms={[...getAllGlossaryTerms()]}
          lessonHref={lessonHref}
        />
      </main>
    </div>
  );
}
