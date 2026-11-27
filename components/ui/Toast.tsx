/**
 * Non-intrusive Toast notification primitive with explicit semantic labels,
 * >= 48px action/dismiss buttons, and polite aria-live announcement.
 */
'use client';

import React from 'react';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface ToastProps {
  message: string;
  tone?: ToastTone;
  actionLabel?: string;
  onAction?: () => void;
  dismissLabel?: string;
  onDismiss?: () => void;
  className?: string;
}

const TONE_LABEL: Record<ToastTone, string> = {
  info: 'Maʼlumot',
  success: 'Tayyor',
  warning: 'Diqqat',
  danger: 'Xato',
};

const TONE_BORDER: Record<ToastTone, string> = {
  info: 'border-[var(--info)]',
  success: 'border-[var(--ok)]',
  warning: 'border-[var(--warning)]',
  danger: 'border-[var(--danger)]',
};

const TONE_INK: Record<ToastTone, string> = {
  info: 'text-[var(--info-ink)]',
  success: 'text-[var(--ok-ink)]',
  warning: 'text-[var(--warning-ink)]',
  danger: 'text-[var(--danger-ink)]',
};

export function Toast({
  message,
  tone = 'info',
  actionLabel,
  onAction,
  dismissLabel = 'Yopish',
  onDismiss,
  className = '',
}: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-wrap items-center justify-between gap-3 rounded-[var(--r-card)] border-2 bg-[var(--surface-raised)] px-4 py-3 text-[15px] text-[var(--on-surface)] shadow-[var(--sh-4)] ${TONE_BORDER[tone]} ${className}`}
    >
      <div className="min-w-0 flex-1">
        <span className={`block text-[12px] font-extrabold ${TONE_INK[tone]}`}>
          {TONE_LABEL[tone]}
        </span>
        <span className="block font-semibold">{message}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="min-h-[48px] cursor-pointer rounded-[var(--r-chip)] border-2 border-[var(--accent-depth)] bg-[var(--accent)] px-3.5 py-2 font-[family-name:var(--font-display)] text-[14px] font-bold text-[var(--on-accent)] whitespace-nowrap"
          >
            {actionLabel}
          </button>
        ) : null}
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={dismissLabel}
            className="inline-flex min-h-[48px] min-w-[48px] cursor-pointer items-center justify-center rounded-[var(--r-chip)] border-2 border-[var(--line-strong)] bg-[var(--surface-inset)] px-3 text-[14px] font-bold text-[var(--on-surface)]"
          >
            {dismissLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
