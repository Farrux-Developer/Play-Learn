import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LocaleShellHeader } from '@/components/LocaleShellHeader';
import {
  getAllGlossaryTerms,
  getAllLessons,
  getGlossaryTermBySlug,
} from '@/lib/game/content/loaders';
import { getDictionary } from '@/lib/i18n/messages';
import { isSupportedLocale, SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/types';
import {
  buildBreadcrumbJsonLd,
  buildDefinedTermJsonLd,
} from '@/lib/seo/jsonld';
import { buildLocalizedMetadata, buildLocalizedUrl } from '@/lib/seo/metadata';

export function generateStaticParams() {
  const out: { locale: string; term: string }[] = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const term of getAllGlossaryTerms()) {
      out.push({ locale, term: term.slug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; term: string }>;
}) {
  const { locale, term } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : 'uz';
  const entry = getGlossaryTermBySlug(term);
  if (!entry) return {};
  return buildLocalizedMetadata({
    locale: loc,
    subpath: `/glossary/${term}`,
    title: `${entry.term} nima? — Oʻyna va oʻrgan`,
    description: entry.shortDef,
    reviewStatus: entry.reviewStatus,
  });
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ locale: string; term: string }>;
}) {
  const { locale, term } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : 'uz';
  const entry = getGlossaryTermBySlug(term);
  if (!entry) notFound();

  const dict = getDictionary(loc);
  const subpath = `/glossary/${term}`;
  const url = buildLocalizedUrl(loc, subpath);
  const relatedLessons = getAllLessons().filter((l) =>
    l.glossaryTerms.includes(entry.slug)
  );

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: dict.nav.brand, url: buildLocalizedUrl(loc, '') },
    { name: 'Lugʻat', url: buildLocalizedUrl(loc, '/glossary') },
    { name: entry.term, url },
  ]);
  const termJsonLd = buildDefinedTermJsonLd({
    term: entry.term,
    description: entry.shortDef,
    url,
    locale: loc,
  });

  return (
    <div data-surface="paper" className="ws-surface min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termJsonLd) }}
      />

      <LocaleShellHeader locale={loc} active="glossary" surface="paper" subpath={subpath} />

      <main id="main-content" className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <article className="ws-chamfer border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-6 shadow-[var(--sh-3)] sm:p-8">
          <p className="text-[13.5px] font-bold text-[var(--info-ink)]">
            {dict.workshops[entry.workshop]} · {entry.reviewStatus === 'reviewed' ? 'Tekshirilgan' : 'Qoralama'}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold">
            {entry.term} nima?
          </h1>
          <p className="mt-4 text-[18px] leading-relaxed text-[var(--on-surface)]">
            {entry.shortDef}
          </p>

          <div className="mt-5 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] p-4">
            <h2 className="font-[family-name:var(--font-display)] text-base font-extrabold text-[var(--on-surface)]">
              Misol
            </h2>
            <p className="mt-1 text-[16px] text-[var(--on-surface-muted)]">
              {entry.example}
            </p>
          </div>
        </article>

        {relatedLessons.length > 0 ? (
          <section className="rounded-[var(--r-panel)] border-2 border-[var(--line)] bg-[var(--surface-raised)] p-5">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
              Bogʻlangan darslar
            </h2>
            <ul className="mt-3 space-y-2">
              {relatedLessons.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/${loc}/learn/${l.track}/${l.concept}`}
                    className="inline-flex min-h-[44px] items-center font-bold text-[var(--info-ink)] underline underline-offset-4"
                  >
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${loc}/glossary`}
            className="ws-key-btn ws-key-btn--secondary min-h-[48px] px-4 no-underline"
          >
            Barcha atamalar
          </Link>
          <Link
            href={`/${loc}/play`}
            className="ws-key-btn ws-key-btn--primary min-h-[48px] px-4 no-underline"
          >
            Ustaxonada oʻynash
          </Link>
        </div>
      </main>
    </div>
  );
}
