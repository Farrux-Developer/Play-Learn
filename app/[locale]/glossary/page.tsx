import Link from 'next/link';
import { LocaleShellHeader } from '@/components/LocaleShellHeader';
import { getAllGlossaryTerms } from '@/lib/game/content/loaders';
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
  return buildLocalizedMetadata({
    locale: loc,
    subpath: '/glossary',
    title: 'Atamalar lugʻati — Oʻyna va oʻrgan',
    description:
      '5–6-sinf informatikasi uchun oʻzgaruvchi, algoritm, bit, bayt, takt va shifrlash atamalarining sodda izohlari.',
    reviewStatus: 'draft',
  });
}

export default async function GlossaryIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : 'uz';
  const dict = getDictionary(loc);
  const terms = getAllGlossaryTerms();

  return (
    <div data-surface="paper" className="ws-surface min-h-screen">
      <LocaleShellHeader locale={loc} active="glossary" surface="paper" subpath="/glossary" />

      <main id="main-content" className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold sm:text-4xl">
            Atamalar lugʻati — «Bu nima?»
          </h1>
          <p className="text-[17px] text-[var(--on-surface-muted)]">
            Har bir yangi IT soʻzi qisqa izoh va hayotiy misol bilan berilgan.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {terms.map((t) => (
            <Link
              key={t.slug}
              href={`/${loc}/glossary/${t.slug}`}
              className="flex flex-col justify-between gap-2 rounded-[var(--r-card)] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-4 no-underline shadow-[var(--sh-2)] hover:border-[var(--accent)]"
            >
              <div>
                <p className="text-[12.5px] font-bold text-[var(--info-ink)]">
                  {dict.workshops[t.workshop]}
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-extrabold text-[var(--on-surface)]">
                  {t.term} nima?
                </h2>
                <p className="mt-1.5 text-[15px] text-[var(--on-surface-muted)]">
                  {t.shortDef}
                </p>
              </div>
              <span className="text-[14px] font-bold text-[var(--info-ink)] underline underline-offset-4">
                Batafsil oʻqish
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
