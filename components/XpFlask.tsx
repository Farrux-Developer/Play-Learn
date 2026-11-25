/**
 * Graduated workshop XP flask (ticks every 10 XP up to 120 XP),
 * animated liquid wave edge, shimmer pass, and odometer tabular-nums readout.
 */
'use client';

import React, { useEffect, useState } from 'react';
import { FlaskIcon } from '@/components/icons/WorkshopIcons';

interface XpFlaskProps {
  inLevelXp: number;
  targetXp: number;
  liteMode: boolean;
  motionPaused: boolean;
}

export function XpFlask({
  inLevelXp,
  targetXp,
  liteMode,
  motionPaused,
}: XpFlaskProps) {
  const [displayXp, setDisplayXp] = useState(inLevelXp);
  const pct = Math.max(0, Math.min(100, (inLevelXp / Math.max(1, targetXp)) * 100));

  useEffect(() => {
    if (liteMode || motionPaused) {
      queueMicrotask(() => setDisplayXp(inLevelXp));
      return;
    }
    const start = displayXp;
    const diff = inLevelXp - start;
    if (diff === 0) return;
    const t0 = performance.now();
    const dur = 420;
    let raf = 0;

    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayXp(Math.round(start + diff * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inLevelXp, liteMode, motionPaused, displayXp]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[14px] font-bold">
        <span className="inline-flex items-center gap-1.5 text-[var(--on-surface)]">
          <FlaskIcon size={18} />
          <span>XP kolbasi</span>
        </span>
        <span className="ws-tabular font-[family-name:var(--font-display)] text-[var(--reward)]">
          {displayXp}/{targetXp} XP
        </span>
      </div>

      {/* Glass flask track with 12 graduated 10-XP tick marks and inset shadow */}
      <div
        role="progressbar"
        aria-label="Daraja XP darajasi"
        aria-valuemin={0}
        aria-valuemax={targetXp}
        aria-valuenow={inLevelXp}
        className="relative h-6 w-full overflow-hidden rounded-[10px] border-2 border-[var(--line-strong)] bg-[var(--surface-inset)] shadow-[var(--sh-inset)]"
      >
        <div
          className="relative h-full bg-gradient-to-r from-[#D98200] to-[#F5A800]"
          style={{
            width: `${pct}%`,
            transition: motionPaused
              ? 'width 150ms linear'
              : 'width 520ms var(--spring-bouncy)',
          }}
        >
          {/* Liquid meniscus SVG wave at right edge */}
          {!liteMode && !motionPaused && pct > 4 ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 12 24"
              className="absolute -right-1.5 top-0 h-full w-3 text-[#FFE08A]"
              preserveAspectRatio="none"
            >
              <path
                d="M0 0 Q6 6 2 12 Q-2 18 4 24 L0 24 Z"
                fill="currentColor"
                fillOpacity="0.65"
              />
            </svg>
          ) : null}
        </div>

        {/* Graduated 10-XP scale ticks */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex justify-between px-[8%]"
        >
          {Array.from({ length: 11 }).map((_, idx) => (
            <span
              key={idx}
              className="h-2.5 w-[1.5px] self-end bg-[#EAF2FF]/45"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
