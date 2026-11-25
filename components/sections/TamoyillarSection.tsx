/**
 * Tamoyillar ("Understand" / Paper surface) section + Workshop Footer:
 * - 3 pedagogical principle cards WITHOUT 01/02/03 numeric badges
 * - Interlocking scroll-driven rotating gears (frozen when reduced/paused/lite)
 * - Safe inline two-step reset confirmation (no window.confirm)
 */
'use client';

import React, { useEffect, useState } from 'react';
import { GearIcon } from '@/components/icons/WorkshopIcons';
import { WorkshopCard } from '@/components/ui/WorkshopCard';
import { PRINCIPLES } from '@/lib/data/workshop';
import { WORKSHOP_STRINGS } from '@/lib/engine/i18n';

interface TamoyillarSectionProps {
  liteMode: boolean;
  motionPaused: boolean;
  onResetProgress: () => void;
}

export function TamoyillarSection({
  liteMode,
  motionPaused,
  onResetProgress,
}: TamoyillarSectionProps) {
  const [gearDeg, setGearDeg] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (liteMode || motionPaused) return;
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setGearDeg(Math.round((window.scrollY * 0.14) % 360));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [liteMode, motionPaused]);

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

          {/* Interlocking mechanical gears driven by scroll */}
          <div
            aria-hidden="true"
            className="flex items-center gap-0.5 rounded-[14px] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] px-3.5 py-2 text-[var(--accent)] shadow-[var(--sh-1)]"
          >
            <div style={{ transform: `rotate(${gearDeg}deg)` }}>
              <GearIcon size={34} />
            </div>
            <div
              className="-ml-2 mt-3 text-[#19B7A6]"
              style={{ transform: `rotate(${-gearDeg * 1.25}deg)` }}
            >
              <GearIcon size={24} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PRINCIPLES.map((item) => (
            <WorkshopCard key={item.id} surface="paper" className="space-y-2.5">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
                {item.title}
              </h3>
              <p className="text-[15px] text-[var(--on-surface-muted)]">
                {item.description}
              </p>
            </WorkshopCard>
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
                className="min-h-[44px] rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-3.5 py-1.5 font-bold text-[var(--on-surface)] hover:border-[var(--warn)]"
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
                  className="min-h-[44px] rounded-[10px] border-2 border-[#A63616] bg-[#E4572E] px-3.5 py-1.5 font-bold text-white"
                >
                  {t.resetConfirm}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[44px] rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-3.5 py-1.5 font-bold text-[var(--on-surface)]"
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
