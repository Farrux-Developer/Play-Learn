/**
 * Mastery ProgressRing primitive displaying 0..100% completion and SkillState text/color pairing.
 */
'use client';

import React from 'react';
import type { SkillState } from '@/lib/game/core/types';

export interface ProgressRingProps {
  value: number;
  state?: SkillState;
  size?: number;
  strokeWidth?: number;
  label: string;
  showPercent?: boolean;
  className?: string;
}

const STATE_STROKE: Record<SkillState, string> = {
  new: 'var(--line-strong)',
  introduced: 'var(--info)',
  practicing: 'var(--warning)',
  mastered: 'var(--ok)',
  retained: 'var(--c-saffron)',
};

export function ProgressRing({
  value,
  state = 'practicing',
  size = 56,
  strokeWidth = 6,
  label,
  showPercent = true,
  className = '',
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (clamped / 100) * circ;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={STATE_STROKE[state]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 260ms var(--ease-out)' }}
        />
      </svg>
      {showPercent ? (
        <span className="ws-tabular absolute text-[12px] font-extrabold text-[var(--on-surface)]">
          {clamped}%
        </span>
      ) : null}
    </div>
  );
}
