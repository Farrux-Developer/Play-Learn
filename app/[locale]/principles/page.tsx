import Link from 'next/link';
import { LocaleShellHeader } from '@/components/LocaleShellHeader';
import { BackupPanel } from '@/components/storage/BackupPanel';
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
    subpath: '/principles',
    title: `${dict.nav.principles} — ${dict.nav.brand}`,
    description: dict.privacy.summary,
    reviewStatus: 'draft',
  });
}

export default async function PrinciplesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : 'uz';
  const dict = getDictionary(loc);

  return (
    <div data-surface="paper" className="ws-surface min-h-screen">
      <LocaleShellHeader
        locale={loc}
        active="principles"
        surface="paper"
        subpath="/principles"
      />

      <main id="main-content" className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
        <section className="ws-chamfer border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-6 shadow-[var(--sh-3)]">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
            {dict.nav.principles} va {dict.privacy.title}
          </h1>
          <p className="mt-3 text-[17px] text-[var(--on-surface-muted)]">
            {dict.privacy.summary}
          </p>
          <p className="mt-2 text-[14px] font-bold text-[var(--info-ink)]">
            Oxirgi yangilanish: 2026-11-27 · Kontent holati: Oʻqituvchi tekshiruvi kutilmoqda (draft)
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[var(--r-panel)] border-2 border-[var(--line)] bg-[var(--surface-raised)] p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
              1. Oʻqitish uslubi
            </h2>
            <p className="mt-2 text-[15.5px] text-[var(--on-surface-muted)]">
              Har bir tushuncha «Kuzat → Taxmin qil → Qur → Ishga tushir → Tekshir → Xulosa qil» zanjiri orqali oʻrgatiladi. Vaqt bosimi, reyting yoki chalgʻituvchi reklama yoʻq.
            </p>
          </article>

          <article className="rounded-[var(--r-panel)] border-2 border-[var(--line)] bg-[var(--surface-raised)] p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
              2. Bolalar xavfsizligi
            </h2>
            <p className="mt-2 text-[15.5px] text-[var(--on-surface-muted)]">
              Hisob ochish, email yoki telefon raqami soʻralmaydi. Tashqi kuzatuvchi skriptlar va uchinchi tomon cookie fayllari umuman ishlatilmaydi.
            </p>
          </article>
        </section>

        <BackupPanel />

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${loc}/play`}
            className="ws-key-btn ws-key-btn--primary min-h-[48px] px-5 no-underline"
          >
            Ustaxonaga qaytish
          </Link>
        </div>
      </main>
    </div>
  );
}
