import Link from 'next/link';
import { getDictionary } from '@/lib/i18n/messages';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/types';

interface LocaleShellHeaderProps {
  locale: Locale;
  active?: 'home' | 'learn' | 'glossary' | 'play' | 'map' | 'principles';
  surface?: 'paper' | 'blueprint';
  /** Current path after /{locale}, e.g. '/learn' or '/play' for locale switching */
  subpath?: string;
}

export function LocaleShellHeader({
  locale,
  active = 'home',
  surface = 'paper',
  subpath = '',
}: LocaleShellHeaderProps) {
  const dict = getDictionary(locale);
  const navItems: {
    id: NonNullable<LocaleShellHeaderProps['active']>;
    href: string;
    label: string;
  }[] = [
    { id: 'learn', href: `/${locale}/learn`, label: dict.nav.lessons },
    { id: 'map', href: `/${locale}/map`, label: dict.nav.map },
    { id: 'play', href: `/${locale}/play`, label: dict.nav.games },
    { id: 'principles', href: `/${locale}/principles`, label: dict.nav.principles },
  ];

  return (
    <header
      data-surface={surface}
      className="sticky top-0 z-40 border-b-2 border-[var(--line)] bg-[var(--surface)] text-[var(--on-surface)]"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-[10px] focus:border-2 focus:border-[var(--accent)] focus:bg-[var(--surface-raised)] focus:px-4 focus:py-2 focus:font-bold"
      >
        Asosiy mazmunga oʻtish
      </a>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-[12px] px-1 font-[family-name:var(--font-display)] text-[17px] font-extrabold tracking-tight no-underline text-[var(--on-surface)]"
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <polygon
                points="16,2 19.8,12.2 30,16 19.8,19.8 16,30 12.2,19.8 2,16 12.2,12.2"
                fill="#F5A800"
                stroke="#0F1E3A"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="16" r="3.5" fill="#0F1E3A" />
            </svg>
            <span>{dict.nav.brand}</span>
          </Link>
        </div>

        <nav
          aria-label="Asosiy sahifalar"
          className="flex flex-wrap items-center gap-1.5"
        >
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex min-h-[48px] items-center rounded-[12px] border-2 px-3.5 text-[15px] font-bold no-underline transition-colors ${
                  isActive
                    ? 'border-[var(--accent)] bg-[var(--surface-raised)] text-[var(--on-surface)] shadow-[var(--sh-1)]'
                    : 'border-transparent text-[var(--on-surface-muted)] hover:border-[var(--line)] hover:bg-[var(--surface-inset)] hover:text-[var(--on-surface)]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5" role="group" aria-label="Til tanlash">
          {SUPPORTED_LOCALES.map((loc) => {
            const selected = loc === locale;
            return (
              <Link
                key={loc}
                href={`/${loc}${subpath}`}
                hrefLang={loc}
                aria-current={selected ? 'true' : undefined}
                className={`inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-[10px] border-2 px-2.5 text-[13.5px] font-extrabold uppercase no-underline ${
                  selected
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]'
                    : 'border-[var(--line)] bg-[var(--surface-raised)] text-[var(--on-surface)] hover:border-[var(--line-strong)]'
                }`}
              >
                {loc}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
