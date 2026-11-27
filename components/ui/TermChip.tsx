/**
 * Tap-to-define inline TermChip (Master Brief Section 4.5).
 * Opens an accessible inline glossary card without leaving the lesson or level.
 */
'use client';

import React, { useId, useState } from 'react';

export interface TermChipProps {
  term: string;
  definition: string;
  example?: string;
  glossaryHref?: string;
  readMoreLabel?: string;
}

export function TermChip({
  term,
  definition,
  example,
  glossaryHref,
  readMoreLabel = 'Lugʻatda oʻqish',
}: TermChipProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <span className="inline-flex flex-col items-start align-middle">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex min-h-[48px] cursor-pointer items-center gap-1.5 rounded-[var(--r-chip)] border-2 px-3 py-1.5 font-[family-name:var(--font-display)] text-[14.5px] font-bold transition-colors ${
          open
            ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]'
            : 'border-[var(--line-strong)] bg-[var(--surface-raised)] text-[var(--info-ink)] hover:border-[var(--accent)]'
        }`}
      >
        <span className="underline decoration-dotted underline-offset-4">{term}</span>
        <span aria-hidden="true" className="text-[12px] font-extrabold">
          ?
        </span>
      </button>

      {open ? (
        <span
          id={panelId}
          role="region"
          aria-label={term}
          className="mt-2 block w-full max-w-sm rounded-[var(--r-card)] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-3.5 text-left text-[14.5px] text-[var(--on-surface)] shadow-[var(--sh-3)]"
        >
          <span className="block font-[family-name:var(--font-display)] font-extrabold text-[var(--on-surface)]">
            {term}
          </span>
          <span className="mt-1 block text-[var(--on-surface)]">{definition}</span>
          {example ? (
            <span className="mt-1.5 block text-[13.5px] text-[var(--on-surface-muted)]">
              {example}
            </span>
          ) : null}
          {glossaryHref ? (
            <a
              href={glossaryHref}
              className="mt-2 inline-flex min-h-[44px] items-center font-bold text-[var(--info-ink)] underline underline-offset-4"
            >
              {readMoreLabel}
            </a>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
