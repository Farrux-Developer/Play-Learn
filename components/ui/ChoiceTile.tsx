/**
 * A18 Tactile Choice Tile (>= 48px tap target):
 * - Correct: scale 1.04 (--spring-pop), expanding glaze ring 1 -> 1.25 fade (420ms),
 *   DrawSVG checkmark stroke (260ms)
 * - Wrong: soft horizontal nudge (280ms sine), coral 18% tint,
 *   Rough.js hand-drawn errorUnderline stroked via DrawSVG (320ms)
 * - WCAG-safe semantic ink tokens across both Paper and Blueprint surfaces
 */
'use client';

import React, { useEffect, useRef } from 'react';
import { PhWarn } from '@/components/icons/WorkshopIcons';
import { ROUGH_PATHS } from '@/lib/motion/roughPaths';

export type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong';

interface ChoiceTileProps {
  label: string;
  indexLabel?: string;
  state?: ChoiceState;
  disabled?: boolean;
  liteMode?: boolean;
  motionPaused?: boolean;
  onClick: () => void;
}

export function ChoiceTile({
  label,
  indexLabel,
  state = 'idle',
  disabled = false,
  liteMode = false,
  motionPaused = false,
  onClick,
}: ChoiceTileProps) {
  const checkPathRef = useRef<SVGPathElement | null>(null);
  const wrongLineRef = useRef<SVGPathElement | null>(null);
  const ringRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (liteMode || motionPaused) return;
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) return;

    let cancelled = false;
    void (async () => {
      try {
        const [{ default: gsap }, { DrawSVGPlugin }] = await Promise.all([
          import('gsap'),
          import('gsap/DrawSVGPlugin'),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(DrawSVGPlugin);

        if (state === 'correct') {
          if (checkPathRef.current) {
            gsap.fromTo(
              checkPathRef.current,
              { drawSVG: '0%' },
              { drawSVG: '100%', duration: 0.26, ease: 'power2.out' }
            );
          }
          if (ringRef.current) {
            gsap.fromTo(
              ringRef.current,
              { scale: 1, opacity: 0.55 },
              { scale: 1.25, opacity: 0, duration: 0.42, ease: 'power2.out' }
            );
          }
        } else if (state === 'wrong' && wrongLineRef.current) {
          gsap.fromTo(
            wrongLineRef.current,
            { drawSVG: '0%' },
            { drawSVG: '100%', duration: 0.32, ease: 'power2.out' }
          );
        }
      } catch {
        // Static SVG path renders cleanly without GSAP
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state, liteMode, motionPaused]);

  const styles: Record<ChoiceState, string> = {
    idle: 'border-[var(--line-strong)] bg-[var(--surface-raised)] text-[var(--on-surface)] shadow-[var(--sh-1)] hover:-translate-y-0.5 hover:border-[var(--accent)]',
    selected:
      'border-[var(--accent)] bg-[var(--accent)]/12 text-[var(--on-surface)] shadow-[var(--sh-2)]',
    correct:
      'border-[var(--ok)] bg-[#19B7A6]/18 text-[var(--on-surface)] shadow-[0_3px_0_var(--c-glaze-depth)] scale-[1.02]',
    wrong:
      'border-[var(--warn)] bg-[#E4572E]/18 text-[var(--on-surface)] ws-soft-nudge',
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={state === 'selected' || state === 'correct'}
      className={`relative flex min-h-[48px] w-full items-center justify-between gap-3 rounded-[14px] border-2 px-4 py-3 text-left text-[15px] font-semibold ${
        styles[state]
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:translate-y-0.5'}`}
      style={{
        transition:
          state === 'correct' && !liteMode && !motionPaused
            ? 'transform 420ms var(--spring-pop), border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease'
            : 'transform 150ms ease, border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease',
      }}
    >
      {/* Expanding glaze ring on correct answer (A18) */}
      {state === 'correct' ? (
        <span
          ref={ringRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[14px] border-2 border-[var(--ok)] opacity-0"
        />
      ) : null}

      <span className="relative flex min-w-0 flex-1 items-center gap-3">
        {indexLabel ? (
          <span className="ws-tabular inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface-inset)] text-[13px] font-extrabold text-[var(--on-surface)]">
            {indexLabel}
          </span>
        ) : null}
        <span className="relative inline-block">
          <span>{label}</span>
          {state === 'wrong' ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 240 14"
              preserveAspectRatio="none"
              className="pointer-events-none mt-0.5 block h-2 w-full overflow-visible text-[var(--warn-ink)]"
            >
              <path
                ref={wrongLineRef}
                d={ROUGH_PATHS.errorUnderline}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          ) : null}
        </span>
      </span>

      {state === 'correct' ? (
        <svg
          width="22"
          height="22"
          viewBox="0 0 28 24"
          fill="none"
          aria-hidden="true"
          className="shrink-0 text-[var(--ok-ink)]"
        >
          <path
            ref={checkPathRef}
            d={ROUGH_PATHS.checkMark}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : state === 'wrong' ? (
        <PhWarn size={20} weight="fill" className="shrink-0 text-[var(--warn-ink)]" />
      ) : null}
    </button>
  );
}
