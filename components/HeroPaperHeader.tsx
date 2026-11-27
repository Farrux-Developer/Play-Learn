/**
 * Pure Server Component for static Paper Hero typography & promise strip.
 * Zero client JS shipped for static headline/subtitle/promise copy (LCP-first).
 */
import { HERO_STRINGS } from '@/lib/engine/heroStrings';

export function HeroHeadlineBlock() {
  const t = HERO_STRINGS.hero;
  return (
    <>
      <p className="inline-block rounded-[8px] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] px-3.5 py-1 text-[14px] font-bold text-[var(--on-surface)] shadow-[var(--sh-1)]">
        {t.audienceTag}
      </p>

      <div>
        <h1 className="ws-hero-title font-extrabold leading-[0.98] tracking-[-0.025em]">
          {t.headline}
        </h1>
        <p
          aria-hidden="true"
          className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14.5px] font-bold text-[var(--accent)]"
        >
          <span>
            <span className="ws-tabular mr-1 text-[var(--on-surface-muted)]">1.</span>
            Tushun
          </span>
          <span className="h-[2px] w-3 bg-[var(--line-strong)]" />
          <span>
            <span className="ws-tabular mr-1 text-[var(--on-surface-muted)]">2.</span>
            Oʻyna
          </span>
          <span className="h-[2px] w-3 bg-[var(--line-strong)]" />
          <span>
            <span className="ws-tabular mr-1 text-[var(--on-surface-muted)]">3.</span>
            Boshqar
          </span>
        </p>
      </div>
    </>
  );
}

export function HeroPromisesStrip() {
  const t = HERO_STRINGS.hero;
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--line)] pt-3.5 text-[14.5px] font-semibold text-[var(--on-surface)]">
      {t.promises.map((item, idx) => (
        <li key={item.id} className="inline-flex items-center gap-2">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="shrink-0 text-[var(--ok-ink)]"
          >
            {idx === 0 ? (
              <>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" />
                <path d="M8 12.2L10.8 15L16.2 9.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </>
            ) : idx === 1 ? (
              <path d="M14.5 6.5A4.5 4.5 0 0 0 8.8 12.2L4.2 16.8A1.8 1.8 0 0 0 6.8 19.4L11.4 14.8A4.5 4.5 0 0 0 17.5 9.5L14.8 12.2L11.8 9.2L14.5 6.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            ) : (
              <path d="M13.5 3L5.5 13.5H12L10.5 21L18.5 10.5H12L13.5 3Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            )}
          </svg>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
