import Link from 'next/link';
import { LocaleShellHeader } from '@/components/LocaleShellHeader';
import { getAllLessons } from '@/lib/game/content/loaders';
import { WORKSHOP_ORDER } from '@/lib/game/core/types';
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
    subpath: '/learn',
    title: `${dict.nav.lessons} — ${dict.nav.brand}`,
    description:
      '5–6-sinf oʻquvchilari uchun IT va algoritmlar boʻyicha tushunarli darslar kutubxonasi.',
    reviewStatus: 'draft',
  });
}

export default async function LearnHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : 'uz';
  const dict = getDictionary(loc);
  const lessons = getAllLessons();

  return (
    <div data-surface="paper" className="ws-surface min-h-screen">
      <LocaleShellHeader locale={loc} active="learn" surface="paper" subpath="/learn" />

      <main id="main-content" className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold sm:text-4xl">
            Tushunish varagʻi — Darslar kutubxonasi
          </h1>
          <p className="text-[17px] text-[var(--on-surface-muted)]">
            Har bir mavzuni avval oddiy hayotiy misollar bilan tushuning, keyin Mirzo ustaxonasida sinab koʻring.
          </p>
        </div>

        <div className="space-y-6">
          {WORKSHOP_ORDER.filter((w) => w !== 'kompyuter-yasa').map((wsId, idx) => {
            const trackLessons = lessons.filter((l) => l.track === wsId);
            const wsTitle = dict.workshops[wsId];
            return (
              <section
                key={wsId}
                className="rounded-[var(--r-panel)] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-5 shadow-[var(--sh-2)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
                    {idx + 1}. {wsTitle}
                  </h2>
                  <Link
                    href={`/${loc}/play`}
                    className="inline-flex min-h-[44px] items-center font-bold text-[var(--info-ink)] underline underline-offset-4"
                  >
                    Ustaxonaga oʻtish
                  </Link>
                </div>

                {trackLessons.length > 0 ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {trackLessons.map((lesson) => (
                      <article
                        key={lesson.slug}
                        className="flex flex-col justify-between gap-3 rounded-[var(--r-card)] border-2 border-[var(--line)] bg-[var(--surface)] p-4"
                      >
                        <div>
                          <p className="text-[13px] font-bold text-[var(--info-ink)]">
                            {lesson.readingMinutes} daqiqa oʻqish · {lesson.reviewStatus === 'reviewed' ? 'Tekshirilgan' : 'Qoralama'}
                          </p>
                          <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-extrabold">
                            {lesson.title}
                          </h3>
                          <p className="mt-1.5 text-[15px] text-[var(--on-surface-muted)]">
                            {lesson.heroSummary}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`/${loc}/learn/${lesson.track}/${lesson.concept}`}
                            className="ws-key-btn ws-key-btn--primary min-h-[48px] px-4 no-underline"
                          >
                            Darsni oʻqish
                          </Link>
                          <Link
                            href={`/${loc}/play/${lesson.track}/${lesson.playLevelId}`}
                            className="ws-key-btn ws-key-btn--secondary min-h-[48px] px-4 no-underline"
                          >
                            Oʻyinda sinab koʻr
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[15px] text-[var(--on-surface-muted)]">
                    Ushbu ustaxona darslari 4-bosqichda qoʻshiladi. Hozir 5-ustaxona (Algoritm) toʻliq ochiq!
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
