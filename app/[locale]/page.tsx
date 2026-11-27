import Link from 'next/link';
import { LocaleShellHeader } from '@/components/LocaleShellHeader';
import { getAllLessons, getAllLevels, getAllSkills } from '@/lib/game/content/loaders';
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
    subpath: '',
    title: `${dict.nav.brand} — Mirzo Ustaxonasi`,
    description: dict.privacy.summary,
    reviewStatus: 'draft',
  });
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : 'uz';
  const dict = getDictionary(loc);
  const lessons = getAllLessons();
  const levels = getAllLevels();
  const skills = getAllSkills();

  return (
    <div data-surface="paper" className="ws-surface min-h-screen">
      <LocaleShellHeader locale={loc} active="home" surface="paper" subpath="" />

      <main id="main-content" className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
        <section className="ws-chamfer border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-6 shadow-[var(--sh-3)] sm:p-8">
          <p className="text-[14px] font-bold text-[var(--info-ink)]">
            5–6-sinf · IT va dasturlash asoslari
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold sm:text-4xl">
            Avval tushun, keyin oʻyna va kodni oʻzing boshqar
          </h1>
          <p className="mt-3 text-[17px] text-[var(--on-surface-muted)]">
            Mirzo Ustaxonasida har bir gʻoyani avval tushunish varagʻida koʻrasan, soʻng haqiqiy ishlaydigan mashinada yigʻib sinaysan.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/${loc}/play`}
              className="ws-key-btn ws-key-btn--primary min-h-[52px] px-6 no-underline"
            >
              {dict.nav.games} ({levels.length} daraja)
            </Link>
            <Link
              href={`/${loc}/learn`}
              className="ws-key-btn ws-key-btn--secondary min-h-[52px] px-5 no-underline"
            >
              {dict.nav.lessons} ({lessons.length})
            </Link>
            <Link
              href={`/${loc}/map`}
              className="ws-key-btn ws-key-btn--secondary min-h-[52px] px-5 no-underline"
            >
              {dict.nav.map} ({skills.length})
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--r-panel)] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-5 shadow-[var(--sh-2)]">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
              Tushunish varagʻi va Lugʻat
            </h2>
            <p className="mt-2 text-[15.5px] text-[var(--on-surface-muted)]">
              Internetsiz ham ochiladigan tushunarli darslar, jonli namunalar va bolalar uchun yozilgan atamalar lugʻati.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/${loc}/learn`}
                className="inline-flex min-h-[48px] items-center font-bold text-[var(--info-ink)] underline underline-offset-4"
              >
                Darslarni ochish
              </Link>
              <Link
                href={`/${loc}/glossary`}
                className="inline-flex min-h-[48px] items-center font-bold text-[var(--info-ink)] underline underline-offset-4"
              >
                Atamalar lugʻati
              </Link>
            </div>
          </div>

          <div
            data-surface="blueprint"
            className="ws-blueprint-grid rounded-[var(--r-panel)] border-2 border-[var(--line-strong)] p-5 text-[var(--on-surface)] shadow-[var(--sh-3)]"
          >
            <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[var(--on-surface)]">
              {dict.privacy.title}
            </h2>
            <p className="mt-2 text-[15.5px] text-[var(--on-surface-muted)]">
              {dict.privacy.summary}
            </p>
            <Link
              href={`/${loc}/principles`}
              className="mt-4 inline-flex min-h-[48px] items-center font-bold text-[var(--reward-ink)] underline underline-offset-4"
            >
              Tamoyillar va nusxa saqlash
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
