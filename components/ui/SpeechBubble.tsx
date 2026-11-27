/**
 * Reused Mirzo SpeechBubble primitive for tutorials, hints, and misconception feedback.
 * Enforces concise max-2-sentence readability with aria-live="polite".
 */
'use client';

import React from 'react';

export type SpeechTone = 'neutral' | 'hint' | 'success' | 'danger';

export interface SpeechBubbleProps {
  text: string;
  tone?: SpeechTone;
  subtitlesEnabled?: boolean;
  tailPosition?: 'top' | 'left' | 'none';
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function SpeechBubble({
  text,
  tone = 'neutral',
  subtitlesEnabled = true,
  tailPosition = 'top',
  actionLabel,
  onAction,
  className = '',
}: SpeechBubbleProps) {
  const toneClasses: Record<SpeechTone, string> = {
    neutral: 'border-[var(--line-strong)] bg-[var(--surface-raised)] text-[var(--on-surface)]',
    hint: 'border-[var(--info)] bg-[var(--surface-raised)] text-[var(--on-surface)]',
    success: 'border-[var(--ok)] bg-[var(--surface-raised)] text-[var(--on-surface)]',
    danger: 'border-[var(--danger)] bg-[var(--surface-raised)] text-[var(--on-surface)]',
  };

  const badgeLabels: Record<SpeechTone, string | null> = {
    neutral: null,
    hint: 'Maslahat',
    success: 'Toʻgʻri',
    danger: 'Tekshirib koʻr',
  };

  const badge = badgeLabels[tone];

  return (
    <div
      className={`relative rounded-[var(--r-card)] border-2 px-4 py-3 text-[15px] leading-relaxed shadow-[var(--sh-2)] ${toneClasses[tone]} ${className}`}
    >
      {tailPosition === 'top' ? (
        <span
          aria-hidden="true"
          className="absolute -top-2 left-8 h-3.5 w-3.5 rotate-45 border-l-2 border-t-2 border-inherit bg-inherit"
        />
      ) : tailPosition === 'left' ? (
        <span
          aria-hidden="true"
          className="absolute top-4 -left-2 h-3.5 w-3.5 rotate-45 border-b-2 border-l-2 border-inherit bg-inherit"
        />
      ) : null}

      {badge ? (
        <span className="mb-1 block font-[family-name:var(--font-display)] text-[12.5px] font-extrabold tracking-wide text-[var(--on-surface-muted)]">
          {badge}
        </span>
      ) : null}

      <p aria-live="polite" className="m-0 font-medium">
        {subtitlesEnabled ? text : 'Subtitrlar oʻchirilgan'}
      </p>

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 inline-flex min-h-[44px] cursor-pointer items-center font-[family-name:var(--font-display)] text-[14px] font-bold text-[var(--info-ink)] underline underline-offset-4"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
