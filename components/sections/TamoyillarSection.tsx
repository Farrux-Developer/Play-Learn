/**
 * Tamoyillar ("Understand" / Paper surface) section + Workshop Footer:
 * - 3 pedagogical principle cards WITHOUT 01/02/03 sequential numbering
 * - A17 Pure CSS scroll-driven interlocking 24/16/12 gears (opposite directions by tooth ratio)
 * - IntersectionObserver highlights the center-viewport principle card & matching gear
 * - Safe inline two-step reset confirmation (no window.confirm)
 */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GearIcon } from '@/components/icons/WorkshopIcons';
import { WorkshopCard } from '@/components/ui/WorkshopCard';
import { PRINCIPLES } from '@/lib/data/workshop';
import { WORKSHOP_STRINGS } from '@/lib/engine/i18n';
import type { QualityTier } from '@/lib/motion/core';

interface TamoyillarSectionProps {
  tier: QualityTier;
  motionPaused: boolean;
  onResetProgress: () => void;
}

export function TamoyillarSection({
  tier,
  motionPaused,
  onResetProgress,
}: TamoyillarSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const liteMode = tier === 'lite';
  const scrollAnimate = !liteMode && !motionPaused;

  // Highlight active principle closest to viewport center
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setActiveIdx(idx);
          }
        },
        { rootMargin: '-32% 0px -32% 0px', threshold: 0.2 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const t = WORKSHOP_STRINGS.reviewStrings;

  return (
    <section
      id="tamoyillar"
      data-surface="paper"
      className="ws-surface scroll-mt-20 border-t-2 border-[var(--line)] py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="ws-h2 font-extrabold tracking-tight">
              {t.principlesTitle}
            </h2>
            <p className="ws-body text-[var(--on-surface-muted)]">
              {t.principlesSubtitle}
            </p>
          </div>

          {/* A17: 3 CSS Scroll-Driven Interlocking Gears (24 : 16 : 12 ratio) */}
          <div
            aria-hidden="true"
            className="flex items-center rounded-[14px] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] px-3.5 py-2 shadow-[var(--sh-1)]"
          >
            <div
              className={`${scrollAnimate ? 'ws-scroll-gear-a' : ''} transition-colors duration-300 ${
                activeIdx === 0 ? 'text-[var(--accent)]' : 'text-[var(--on-surface-muted)]'
              }`}
            >
              <GearIcon size={34} />
            </div>
            <div
              className={`-ml-2 mt-3 ${scrollAnimate ? 'ws-scroll-gear-b' : ''} transition-colors duration-300 ${
                activeIdx === 1 ? 'text-[var(--ok-ink)]' : 'text-[var(--on-surface-muted)]'
              }`}
            >
              <GearIcon size={24} />
            </div>
            <div
              className={`-ml-1.5 -mt-2 ${scrollAnimate ? 'ws-scroll-gear-c' : ''} transition-colors duration-300 ${
                activeIdx === 2 ? 'text-[var(--reward-ink)]' : 'text-[var(--on-surface-muted)]'
              }`}
            >
              <GearIcon size={19} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PRINCIPLES.map((item, idx) => (
            <div
              key={item.id}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
            >
              <WorkshopCard
                surface="paper"
                state={activeIdx === idx ? 'active' : 'default'}
                className="h-full space-y-2.5"
              >
                <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
                  {item.title}
                </h3>
                <p className="text-[15px] text-[var(--on-surface-muted)]">
                  {item.description}
                </p>
              </WorkshopCard>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t-2 border-[var(--line)] pt-6 text-[14px] text-[var(--on-surface-muted)]">
          <p className="font-semibold text-[var(--on-surface)]">
            {WORKSHOP_STRINGS.brandName} — 5–6-sinf oʻquvchilari uchun oflayn dasturlash ustaxonasi
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="min-h-[44px] cursor-pointer rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-3.5 py-1.5 font-bold text-[var(--on-surface)] hover:border-[var(--warn)]"
              >
                {t.resetProgress}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                  }}
                  className="min-h-[44px] cursor-pointer rounded-[10px] border-2 border-[#A81700] bg-[#E4572E] px-3.5 py-1.5 font-bold text-white"
                >
                  {t.resetConfirm}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[44px] cursor-pointer rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-3.5 py-1.5 font-bold text-[var(--on-surface)]"
                >
                  {t.resetCancel}
                </button>
              </div>
            )}
          </div>
        </footer>
      </div>
    </section>
  );
}
