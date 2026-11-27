import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LocaleShellHeader } from '@/components/LocaleShellHeader';
import { LazyLessonDemo } from '@/components/learn/LazyLessonDemo';
import { TermChip } from '@/components/ui/TermChip';
import {
  getAllGlossaryTerms,
  getAllLessons,
} from '@/lib/game/content/loaders';
import { getDictionary } from '@/lib/i18n/messages';
import { isSupportedLocale, SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/types';
import {
  buildBreadcrumbJsonLd,
  buildLearningResourceJsonLd,
} from '@/lib/seo/jsonld';
import { buildLocalizedMetadata, buildLocalizedUrl } from '@/lib/seo/metadata';

export function generateStaticParams() {
  const params: { locale: string; track: string; concept: string }[] = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const lesson of getAllLessons()) {
      params.push({ locale, track: lesson.track, concept: lesson.concept });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; track: string; concept: string }>;
}) {
  const { locale, track, concept } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : 'uz';
  const lesson = getAllLessons().find(
    (l) => l.track === track && l.concept === concept
  );
  if (!lesson) return {};
  return buildLocalizedMetadata({
    locale: loc,
    subpath: `/learn/${track}/${concept}`,
    title: `${lesson.title} — Oʻyna va oʻrgan`,
    description: lesson.description,
    reviewStatus: lesson.reviewStatus,
  });
}

export default async function LessonConceptPage({
  params,
}: {
  params: Promise<{ locale: string; track: string; concept: string }>;
}) {
  const { locale, track, concept } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : 'uz';
  const allLessons = getAllLessons();
  const lesson = allLessons.find(
    (l) => l.track === track && l.concept === concept
  );
  if (!lesson) {
    notFound();
  }

  const dict = getDictionary(loc);
  const glossaryMap = new Map(
    getAllGlossaryTerms().map((t) => [t.slug, t])
  );
  const subpath = `/learn/${track}/${concept}`;
  const pageUrl = buildLocalizedUrl(loc, subpath);
  const prereqLessons = lesson.prerequisites
    .map((slug) => allLessons.find((l) => l.slug === slug))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  const nextLesson = lesson.nextLessonSlug
    ? allLessons.find((l) => l.slug === lesson.nextLessonSlug) ?? null
    : null;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: dict.nav.brand, url: buildLocalizedUrl(loc, '') },
    { name: dict.nav.lessons, url: buildLocalizedUrl(loc, '/learn') },
    { name: lesson.title, url: pageUrl },
  ]);
  const resourceJsonLd = buildLearningResourceJsonLd({
    title: lesson.title,
    description: lesson.description,
    url: pageUrl,
    locale: loc,
    dateModified: lesson.updatedAt,
  });

  return (
    <div data-surface="paper" className="ws-surface min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(resourceJsonLd) }}
      />

      <LocaleShellHeader locale={loc} active="learn" surface="paper" subpath={subpath} />

      <main id="main-content" className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-[14px] font-semibold text-[var(--on-surface-muted)]">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href={`/${loc}`} className="underline underline-offset-4">
                Bosh sahifa
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/${loc}/learn`} className="underline underline-offset-4">
                {dict.nav.lessons}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[var(--on-surface)]">
              {dict.workshops[lesson.track]}
            </li>
          </ol>
        </nav>

        <header className="ws-chamfer border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-6 shadow-[var(--sh-2)]">
          <div className="flex flex-wrap items-center gap-3 text-[13.5px] font-bold text-[var(--info-ink)]">
            <span>{dict.workshops[lesson.track]}</span>
            <span>·</span>
            <span>{lesson.readingMinutes} daqiqa oʻqish</span>
            <span>·</span>
            <span>Yangilangan: {lesson.updatedAt}</span>
            <span>·</span>
            <span>
              Holat: {lesson.reviewStatus === 'reviewed' ? 'Oʻqituvchi tekshirgan' : 'Qoralama'}
            </span>
          </div>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold sm:text-4xl">
            {lesson.title}
          </h1>
          <p className="mt-3 text-[18px] leading-relaxed text-[var(--on-surface)]">
            {lesson.heroSummary}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {lesson.keyTermSlugs.map((slug) => {
              const term = glossaryMap.get(slug);
              if (!term) return null;
              return (
                <TermChip
                  key={term.slug}
                  term={term.term}
                  definition={term.shortDef}
                  example={term.example}
                  glossaryHref={`/${loc}/glossary/${term.slug}`}
                  readMoreLabel={dict.ui.termReadGlossary}
                />
              );
            })}
          </div>
        </header>

        <article className="space-y-8 text-[18px] leading-[1.7]">
          {lesson.sections.map((sec) => (
            <section
              key={sec.heading}
              className="rounded-[var(--r-panel)] border-2 border-[var(--line)] bg-[var(--surface-raised)] p-5 sm:p-6"
            >
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
                {sec.heading}
              </h2>
              <div className="mt-3 space-y-3">
                {sec.paragraphs.map((p, i) => (
                  <p key={i} className="text-[var(--on-surface)]">
                    {p}
                  </p>
                ))}
              </div>
              {sec.codeSnippet ? (
                <pre className="mt-4 overflow-x-auto rounded-[12px] border border-[var(--line-strong)] bg-[#07264B] p-4 font-[family-name:var(--font-mono)] text-[14.5px] text-[#EAF2FF]">
                  <code>{sec.codeSnippet}</code>
                </pre>
              ) : null}
            </section>
          ))}

          {/* Static SSR Worked Example Summary (works without JavaScript) */}
          <section className="rounded-[var(--r-panel)] border-2 border-[var(--line)] bg-[var(--surface-raised)] p-5 sm:p-6">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
              {lesson.demoProgram.title}
            </h2>
            <p className="mt-2 text-[16px] text-[var(--on-surface-muted)]">
              Quyidagi jadvalda Mirzo mashinasining har bir taktdagi holatini JS siz ham koʻrishingiz mumkin:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-[15px]">
                <thead>
                  <tr className="border-b-2 border-[var(--line-strong)]">
                    <th className="py-2 pr-3 font-bold">Takt</th>
                    <th className="py-2 pr-3 font-bold">Buyruq</th>
                    <th className="py-2 pr-3 font-bold">Qutilar</th>
                    <th className="py-2 font-bold">Izoh</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson.demoProgram.instructions.map((st, idx) => (
                    <tr key={idx} className="border-b border-[var(--line)]">
                      <td className="ws-tabular py-2 pr-3 font-bold">{idx + 1}</td>
                      <td className="py-2 pr-3 font-[family-name:var(--font-mono)] text-[14px]">
                        {st.label}
                      </td>
                      <td className="ws-tabular py-2 pr-3 font-[family-name:var(--font-mono)] text-[14px]">
                        {Object.entries(st.vars)
                          .map(([k, v]) => `${k}=${v}`)
                          .join(', ')}
                      </td>
                      <td className="py-2 text-[var(--on-surface-muted)]">{st.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Lazy interactive demo & self-check island */}
          <section aria-label="Jonli sinov">
            <LazyLessonDemo
              demoProgram={lesson.demoProgram}
              selfCheck={lesson.selfCheck}
            />
          </section>

          <section className="rounded-[var(--r-panel)] border-2 border-[var(--warn)]/45 bg-[var(--surface-raised)] p-5 sm:p-6">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
              Koʻp uchraydigan xatolar
            </h2>
            <ul className="mt-4 space-y-3">
              {lesson.commonMistakes.map((m, idx) => (
                <li
                  key={idx}
                  className="rounded-[12px] border border-[var(--line)] bg-[var(--surface)] p-4 text-[16px]"
                >
                  <p className="font-bold text-[var(--danger-ink)]">
                    Xato fikr: {m.wrongIdea}
                  </p>
                  <p className="mt-1 text-[var(--on-surface)]">
                    Toʻgʻrisi: {m.truth}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <section className="ws-chamfer flex flex-wrap items-center justify-between gap-4 border-2 border-[var(--accent)] bg-[var(--surface-raised)] p-6 shadow-[var(--sh-3)]">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
              Endi amalda sinab koʻramizmi?
            </h2>
            <p className="mt-1 text-[15.5px] text-[var(--on-surface-muted)]">
              Mirzo ustaxonasiga oʻtib, buyurtmani oʻzing yigʻ va tekshir.
            </p>
          </div>
          <Link
            href={`/${loc}/play/${lesson.track}/${lesson.playLevelId}`}
            className="ws-key-btn ws-key-btn--primary min-h-[52px] px-6 no-underline"
          >
            Oʻyinda sinab koʻr
          </Link>
        </section>

        <nav
          aria-label="Bogʻlangan darslar"
          className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[var(--line)] pt-6 text-[15.5px]"
        >
          <div>
            {prereqLessons[0] ? (
              <Link
                href={`/${loc}/learn/${prereqLessons[0].track}/${prereqLessons[0].concept}`}
                className="inline-flex min-h-[48px] items-center font-bold text-[var(--info-ink)] underline underline-offset-4"
              >
                Oldingi mavzu: {prereqLessons[0].title}
              </Link>
            ) : (
              <Link
                href={`/${loc}/learn`}
                className="inline-flex min-h-[48px] items-center font-bold text-[var(--info-ink)] underline underline-offset-4"
              >
                Barcha darslar
              </Link>
            )}
          </div>
          <div>
            {nextLesson ? (
              <Link
                href={`/${loc}/learn/${nextLesson.track}/${nextLesson.concept}`}
                className="inline-flex min-h-[48px] items-center font-bold text-[var(--info-ink)] underline underline-offset-4"
              >
                Keyingi mavzu: {nextLesson.title}
              </Link>
            ) : null}
          </div>
        </nav>
      </main>
    </div>
  );
}
