/**
 * Interactive Filter/Selection Chip (>= 48px tap target, never used as static metadata pill).
 */
'use client';

import React from 'react';

export interface ChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  count?: number;
  onClick?: () => void;
  className?: string;
}

export function Chip({
  label,
  selected = false,
  disabled = false,
  count,
  onClick,
  className = '',
}: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--r-card)] border-2 px-4 py-2 font-[family-name:var(--font-display)] text-[14.5px] font-bold transition-[transform,background-color,border-color] duration-[var(--dur-fast)] ${
        selected
          ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)] shadow-[var(--sh-1)]'
          : 'border-[var(--line-strong)] bg-[var(--surface-raised)] text-[var(--on-surface)] hover:border-[var(--accent)]'
      } ${
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer active:translate-y-0.5'
      } ${className}`}
    >
      <span>{label}</span>
      {typeof count === 'number' ? (
        <span
          className={`ws-tabular text-[13px] ${
            selected ? 'opacity-90' : 'text-[var(--on-surface-muted)]'
          }`}
        >
          ({count})
        </span>
      ) : null}
    </button>
  );
}
