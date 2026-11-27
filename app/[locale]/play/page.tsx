import { LocaleShellHeader } from '@/components/LocaleShellHeader';
import { GameHubClient } from '@/components/game/GameHubClient';
import { getAllLevels, getAllSkills } from '@/lib/game/content/loaders';
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
    subpath: '/play',
    title: `${dict.nav.games} — ${dict.nav.brand}`,
    description:
      'Mirzo Ustaxonasida algoritm, mantiq, protsessor va tarmoq vazifalarini yeching.',
    reviewStatus: 'draft',
  });
}

export default async function PlayHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : 'uz';
  const dict = getDictionary(loc);

  return (
    <div data-surface="blueprint" className="ws-surface ws-blueprint-grid min-h-screen">
      <LocaleShellHeader locale={loc} active="play" surface="blueprint" subpath="/play" />

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <GameHubClient
          locale={loc}
          levels={getAllLevels()}
          skills={getAllSkills()}
          workshopLabels={dict.workshops}
        />
      </main>
    </div>
  );
}
