import { LocaleShellHeader } from '@/components/LocaleShellHeader';
import { MasteryMapClient } from '@/components/game/MasteryMapClient';
import {
  getAllLessons,
  getAllLevels,
  getAllSkills,
} from '@/lib/game/content/loaders';
import { getDictionary } from '@/lib/i18n/messages';
import { isSupportedLocale, SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/types';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : 'uz';
  const dict = getDictionary(loc);
  return buildLocalizedMetadata({
    locale: loc,
    subpath: '/map',
    title: `${dict.nav.map} — ${dict.nav.brand}`,
    description:
      'IT va dasturlash koʻnikmalari xaritasi: har bir tugun dars, oʻyin darajasi va takrorlashga bogʻlangan.',
    reviewStatus: 'draft',
  });
}

export default async function MasteryMapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : 'uz';
  const dict = getDictionary(loc);

  return (
    <div data-surface="blueprint" className="ws-surface ws-blueprint-grid min-h-screen">
      <LocaleShellHeader locale={loc} active="map" surface="blueprint" subpath="/map" />

      <main id="main-content" className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold sm:text-4xl">
            Bilim xaritasi — Koʻnikmalar zanjiri
          </h1>
          <p className="text-[17px] text-[var(--on-surface-muted)]">
            Har bir koʻnikma dars varagʻiga, Mirzo ustaxonasidagi buyurtmalarga va 7 kunlik takrorlashga bogʻlangan.
          </p>
        </div>

        <MasteryMapClient
          locale={loc}
          skills={getAllSkills()}
          levels={getAllLevels()}
          lessons={getAllLessons()}
          workshopLabels={dict.workshops}
        />
      </main>
    </div>
  );
}
