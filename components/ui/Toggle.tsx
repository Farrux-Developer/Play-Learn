/**
 * Accessible hardware-inspired Toggle switch (>= 48px hit height, role="switch").
 */
'use client';

import React from 'react';

export interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  className?: string;
}

export function Toggle({
  label,
  description,
  checked,
  disabled = false,
  onChange,
  className = '',
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex min-h-[48px] w-full items-center justify-between gap-3 rounded-[var(--r-card)] border-2 px-3.5 py-2.5 text-left transition-[border-color,background-color] duration-150 ${
        checked
          ? 'border-[var(--ok)] bg-[var(--surface-raised)]'
          : 'border-[var(--line-strong)] bg-[var(--surface-inset)]'
      } ${
        disabled
          ? 'cursor-not-allowed opacity-55'
          : 'cursor-pointer hover:border-[var(--accent)]'
      } ${className}`}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-[family-name:var(--font-display)] text-[15px] font-bold text-[var(--on-surface)]">
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-[13px] text-[var(--on-surface-muted)]">
            {description}
          </span>
        ) : null}
      </span>

      <span className="inline-flex shrink-0 items-center gap-2" aria-hidden="true">
        <span
          className={`h-2.5 w-2.5 rounded-full border border-[var(--on-surface)]/40 ${
            checked ? 'bg-[var(--ok)]' : 'bg-transparent'
          }`}
        />
        <span className="relative inline-flex h-6 w-11 items-center rounded-full border-2 border-[var(--line-strong)] bg-[var(--surface)] p-0.5">
          <span
            className={`block h-4 w-4 rounded-full transition-transform duration-150 ${
              checked
                ? 'translate-x-5 bg-[var(--ok)]'
                : 'translate-x-0 bg-[var(--on-surface-muted)]'
            }`}
          />
        </span>
      </span>
    </button>
  );
}
