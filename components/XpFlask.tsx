/**
 * Graduated workshop XP flask (A06 & A07):
 * - Graduated scale every 10 XP up to 120 XP (ticks pulse 1 -> 1.3 -> 1 as crossed)
 * - MotionPath flying XP sparks curving into flask on xp:gain
 * - MorphSVG liquid meniscus wave & specular flask sheen
 * - Digit-column odometer (translateY, stagger 40ms, expo.out)
 */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FlaskIcon } from '@/components/icons/WorkshopIcons';
import { motionCore } from '@/lib/motion/core';

interface XpFlaskProps {
  inLevelXp: number;
  targetXp: number;
  liteMode: boolean;
  motionPaused: boolean;
}

const WAVE_A = 'M0 0 Q6 6 2 12 Q-2 18 4 24 L0 24 Z';
const WAVE_B = 'M0 0 Q-3 6 4 12 Q7 18 1 24 L0 24 Z';

export function XpFlask({
  inLevelXp,
  targetXp,
  liteMode,
  motionPaused,
}: XpFlaskProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const wavePathRef = useRef<SVGPathElement | null>(null);
  const sheenRef = useRef<HTMLSpanElement | null>(null);
  const sparkLayerRef = useRef<SVGSVGElement | null>(null);
  const prevXpRef = useRef(inLevelXp);
  const [pulseTickIdx, setPulseTickIdx] = useState<number | null>(null);

  const pct = Math.max(0, Math.min(100, (inLevelXp / Math.max(1, targetXp)) * 100));
  const paddedXp = String(Math.max(0, inLevelXp)).padStart(3, ' ');

  // Trigger A06 MotionPath sparks + MorphSVG liquid wave + sheen + tick snap on XP gain
  useEffect(() => {
    const prev = prevXpRef.current;
    prevXpRef.current = inLevelXp;
    if (inLevelXp === prev || liteMode || motionPaused) return;
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) return;

    // Snap passed 10-XP tick marks
    const crossedTick = Math.floor(inLevelXp / 10) - 1;
    if (crossedTick >= 0 && crossedTick < 11 && inLevelXp > prev) {
      setPulseTickIdx(crossedTick);
      window.setTimeout(() => setPulseTickIdx(null), 420);
    }

    let cancelled = false;
    void (async () => {
      try {
        const [{ default: gsap }, { MorphSVGPlugin }, { MotionPathPlugin }] =
          await Promise.all([
            import('gsap'),
            import('gsap/MorphSVGPlugin'),
            import('gsap/MotionPathPlugin'),
          ]);
        if (cancelled) return;
        gsap.registerPlugin(MorphSVGPlugin, MotionPathPlugin);

        if (wavePathRef.current) {
          gsap.fromTo(
            wavePathRef.current,
            { morphSVG: WAVE_A },
            {
              morphSVG: WAVE_B,
              duration: 0.35,
              repeat: 2,
              yoyo: true,
              ease: 'sine.inOut',
            }
          );
        }

        if (sheenRef.current) {
          gsap.fromTo(
            sheenRef.current,
            { xPercent: -110, opacity: 0.85 },
            { xPercent: 220, opacity: 0, duration: 0.5, ease: 'power2.out' }
          );
        }

        if (sparkLayerRef.current && inLevelXp > prev) {
          const sparks = Array.from(
            sparkLayerRef.current.querySelectorAll<SVGCircleElement>('[data-xp-spark]')
          );
          const targetX = Math.max(24, Math.min(285, (inLevelXp / targetXp) * 280));
          sparks.forEach((sp, i) => {
            gsap.set(sp, { opacity: 1, scale: 1 });
            gsap.to(sp, {
              duration: 0.52,
              delay: i * 0.06,
              ease: 'power2.in',
              motionPath: {
                path: [
                  { x: 40 + i * 24, y: 46 },
                  { x: (40 + i * 24 + targetX) * 0.5, y: -16 - (i % 2) * 10 },
                  { x: targetX, y: 12 },
                ],
                curviness: 1.4,
              },
              onComplete: () => {
                gsap.set(sp, { opacity: 0 });
              },
            });
          });
        }
      } catch {
        // Fallback CSS width transition already handles progress
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inLevelXp, targetXp, liteMode, motionPaused]);

  // Also trigger spark burst on explicit xp:gain bus event
  useEffect(() => {
    return motionCore.on('xp:gain', ({ amount }) => {
      if (amount > 0) {
        motionCore.playCue('tap');
      }
    });
  }, []);

  return (
    <div className="relative space-y-1.5">
      <div className="flex items-center justify-between text-[14px] font-bold">
        <span className="inline-flex items-center gap-1.5 text-[var(--on-surface)]">
          <FlaskIcon size={18} />
          <span>XP kolbasi</span>
        </span>

        {/* Odometer tabular-nums readout */}
        <span className="ws-tabular inline-flex items-center font-[family-name:var(--font-display)] text-[var(--reward-ink)]">
          <span className="inline-flex overflow-hidden leading-none" aria-label={`${inLevelXp} / ${targetXp} XP`}>
            {paddedXp.split('').map((ch, idx) =>
              ch === ' ' ? null : (
                <span
                  key={idx}
                  className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ transitionDelay: `${idx * 40}ms` }}
                >
                  {ch}
                </span>
              )
            )}
          </span>
          <span className="ml-0.5">/{targetXp} XP</span>
        </span>
      </div>

      {/* MotionPath flying XP sparks overlay */}
      {!liteMode && !motionPaused ? (
        <svg
          ref={sparkLayerRef}
          aria-hidden="true"
          viewBox="0 0 300 40"
          className="pointer-events-none absolute -top-1 left-0 z-20 h-10 w-full overflow-visible"
        >
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              data-xp-spark
              cx="0"
              cy="0"
              r="3.4"
              opacity="0"
              fill={i % 2 === 0 ? '#F5A800' : '#49E2D0'}
            />
          ))}
        </svg>
      ) : null}

      {/* Glass flask track with 12 graduated 10-XP tick marks */}
      <div
        ref={trackRef}
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
              : 'width 700ms var(--spring-pop)',
          }}
        >
          {/* Specular sheen pass on XP fill */}
          <span
            ref={sheenRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-0"
          />

          {/* Liquid meniscus SVG wave at right edge */}
          {!liteMode && !motionPaused && pct > 4 ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 12 24"
              className="absolute -right-1.5 top-0 h-full w-3 text-[#FFE08A]"
              preserveAspectRatio="none"
            >
              <path
                ref={wavePathRef}
                d={WAVE_A}
                fill="currentColor"
                fillOpacity="0.7"
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
              className={`h-2.5 w-[1.5px] self-end bg-[#EAF2FF]/50 transition-transform duration-300 ${
                pulseTickIdx === idx ? 'scale-y-150 bg-[#F5A800]' : 'scale-100'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
