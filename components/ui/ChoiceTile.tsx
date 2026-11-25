/**
 * Tactile multiple-choice / code option tile (>= 44px tap target).
 * Supports default, selected, correct (glaze pulse), wrong (soft coral underline + nudge),
 * and disabled visual states across both Paper and Blueprint surfaces.
 */
'use client';

import React from 'react';
import { PhCheck, PhWarn } from '@/components/icons/WorkshopIcons';

export type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong';

interface ChoiceTileProps {
  label: string;
  indexLabel?: string;
  state?: ChoiceState;
  disabled?: boolean;
  onClick: () => void;
}

export function ChoiceTile({
  label,
  indexLabel,
  state = 'idle',
  disabled = false,
  onClick,
}: ChoiceTileProps) {
  const styles: Record<ChoiceState, string> = {
    idle: 'border-[var(--line-strong)] bg-[var(--surface-raised)] text-[var(--on-surface)] shadow-[var(--sh-1)] hover:-translate-y-0.5 hover:border-[var(--accent)]',
    selected:
      'border-[var(--accent)] bg-[var(--accent)]/12 text-[var(--on-surface)] shadow-[var(--sh-2)]',
    correct:
      'border-[#19B7A6] bg-[#19B7A6]/18 text-[var(--on-surface)] shadow-[0_3px_0_#0E7C70]',
    wrong:
      'border-[#E4572E] bg-[#E4572E]/14 text-[var(--on-surface)] underline decoration-[#E4572E] decoration-2 underline-offset-4 ws-soft-nudge',
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={state === 'selected' || state === 'correct'}
      className={`flex min-h-[48px] w-full items-center justify-between gap-3 rounded-[14px] border-2 px-4 py-3 text-left text-[15px] font-semibold transition-[transform,border-color,background-color,box-shadow] duration-150 ${
        styles[state]
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:translate-y-0.5'}`}
    >
      <span className="flex items-center gap-3">
        {indexLabel ? (
          <span className="ws-tabular inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface-inset)] text-[13px] font-extrabold">
            {indexLabel}
          </span>
        ) : null}
        <span>{label}</span>
      </span>
      {state === 'correct' ? (
        <PhCheck size={20} weight="fill" className="shrink-0 text-[#19B7A6]" />
      ) : state === 'wrong' ? (
        <PhWarn size={20} weight="fill" className="shrink-0 text-[#E4572E]" />
      ) : null}
    </button>
  );
}
