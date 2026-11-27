/**
 * Accessible Dialog modal primitive (Escape close, >= 48px close target, backdrop click).
 */
'use client';

import React, { useEffect, useId } from 'react';
import type { SurfaceMode } from '@/lib/engine/store';

export interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  closeLabel?: string;
  surface?: SurfaceMode;
  onClose: () => void;
  children: React.ReactNode;
}

export function Dialog({
  open,
  title,
  description,
  closeLabel = 'Yopish',
  surface = 'blueprint',
  onClose,
  children,
}: DialogProps) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-surface={surface}
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 bg-[#051226]/75"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="relative z-10 w-full max-w-lg rounded-[var(--r-panel)] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-5 text-[var(--on-surface)] shadow-[var(--sh-5)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id={titleId}
              className="font-[family-name:var(--font-display)] text-xl font-extrabold"
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descId}
                className="mt-1 text-[14.5px] text-[var(--on-surface-muted)]"
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="inline-flex h-[48px] w-[48px] shrink-0 cursor-pointer items-center justify-center rounded-[var(--r-card)] border-2 border-[var(--line-strong)] bg-[var(--surface-inset)] text-lg font-extrabold text-[var(--on-surface)] hover:border-[var(--accent)]"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
