/**
 * 0..3 Star Rating indicator (works / no hints / efficient vs par).
 * Accessible aria-label and crisp custom SVG stars.
 */
'use client';

import React from 'react';
import type { StarCount } from '@/lib/game/core/types';

export interface StarsProps {
  earned: StarCount;
  max?: number;
  size?: number;
  label?: string;
  showNumeric?: boolean;
  className?: string;
}

export function Stars({
  earned,
  max = 3,
  size = 22,
  label,
  showNumeric = false,
  className = '',
}: StarsProps) {
  const safeEarned = Math.max(0, Math.min(max, earned));
  const ariaLabel = label ?? `${safeEarned} ta yulduz (${max} tadan)`;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      {Array.from({ length: max }).map((_, idx) => {
        const filled = idx < safeEarned;
        return (
          <svg
            key={idx}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <polygon
              points="12,2 15.1,8.3 22,9.3 17,14.2 18.2,21 12,17.8 5.8,21 7,14.2 2,9.3 8.9,8.3"
              fill={filled ? 'var(--c-saffron)' : 'transparent'}
              stroke={filled ? 'var(--c-saffron-depth)' : 'var(--line-strong)'}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
      {showNumeric ? (
        <span className="ws-tabular ml-1 text-[13.5px] font-bold text-[var(--on-surface-muted)]">
          {safeEarned}/{max}
        </span>
      ) : null}
    </div>
  );
}
