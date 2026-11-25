/**
 * A12 Sticky Workshop Navigation Header:
 * - CSS scroll-driven compression & shadow (.ws-scroll-header, zero scroll JS)
 * - Motion layoutId sliding active pill (--spring-soft physics)
 * - Thin lesson progress hairline under the header (progressbar ARIA)
 * - WCAG 2.2.2 motion pause toggle
 * - Mobile bottom sheet menu (translateY 100% -> 0, --spring-soft) with backdrop
 */
'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  PhClose,
  PhMenu,
  PhPause,
  PhPlay,
  PinStarIcon,
} from '@/components/icons/WorkshopIcons';
import { WORKSHOP_STRINGS } from '@/lib/engine/i18n';
import type { SurfaceMode } from '@/lib/engine/store';

export type NavSectionId = 'darslar' | 'xarita' | 'oyinlar' | 'tamoyillar';

interface WorkshopHeaderProps {
  activeSection: NavSectionId;
  surfaceMode: SurfaceMode;
  motionPaused: boolean;
  lessonProgressPct?: number;
  completedCount?: number;
  totalLessons?: number;
  onNavigate: (
    section: NavSectionId,
    triggerBlueprint?: boolean,
    e?: React.MouseEvent<HTMLElement>
  ) => void;
  onStart: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onTogglePause: () => void;
}

const NAV_ITEMS: { id: NavSectionId; label: string; isBlueprint: boolean }[] = [
  { id: 'darslar', label: WORKSHOP_STRINGS.nav.lessons, isBlueprint: false },
  { id: 'xarita', label: WORKSHOP_STRINGS.nav.map, isBlueprint: true },
  { id: 'oyinlar', label: WORKSHOP_STRINGS.nav.games, isBlueprint: true },
  { id: 'tamoyillar', label: WORKSHOP_STRINGS.nav.principles, isBlueprint: false },
];

export function WorkshopHeader({
  activeSection,
  motionPaused,
  lessonProgressPct = 0,
  completedCount = 0,
  totalLessons = 4,
  onNavigate,
  onStart,
  onTogglePause,
}: WorkshopHeaderProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const t = WORKSHOP_STRINGS.reviewStrings;
  const clampedPct = Math.max(0, Math.min(100, Math.round(lessonProgressPct)));

  useEffect(() => {
    if (!sheetOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sheetOpen]);

  return (
    <>
      <header className="ws-scroll-header sticky top-0 z-40 border-b-2 border-[var(--line)] bg-[var(--surface)] py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a
            href="#top"
            className="group inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-[14px] px-1"
          >
            <PinStarIcon
              size={30}
              className="shrink-0 transition-transform duration-200 group-hover:rotate-[22.5deg]"
            />
            <span className="whitespace-nowrap font-[family-name:var(--font-display)] text-[16px] font-extrabold tracking-tight sm:text-lg">
              {WORKSHOP_STRINGS.brandName}
            </span>
          </a>

          <nav
            aria-label="Asosiy boʻlimlar"
            className="hidden items-center gap-1 rounded-[14px] border border-[var(--line)] bg-[var(--surface-inset)] p-1 lg:flex"
          >
            {NAV_ITEMS.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => onNavigate(item.id, item.isBlueprint, e)}
                  aria-current={active ? 'location' : undefined}
                  className="relative min-h-[44px] cursor-pointer rounded-[10px] px-4 py-1.5 text-[15px] font-bold transition-colors"
                >
                  {active ? (
                    <motion.span
                      layoutId="ws-nav-pill"
                      transition={
                        motionPaused
                          ? { duration: 0.12 }
                          : { type: 'spring', stiffness: 380, damping: 30 }
                      }
                      className="absolute inset-0 rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface-raised)] shadow-[var(--sh-1)]"
                    />
                  ) : null}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePause}
              aria-pressed={motionPaused}
              title={motionPaused ? t.resumeMotion : t.pauseMotion}
              aria-label={motionPaused ? t.resumeMotion : t.pauseMotion}
              className="inline-flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-[14px] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] text-[var(--on-surface)] shadow-[var(--sh-1)] transition-transform duration-150 hover:border-[var(--accent)] active:scale-95"
            >
              {motionPaused ? (
                <PhPlay size={18} weight="bold" />
              ) : (
                <PhPause size={18} weight="bold" />
              )}
            </button>

            <button
              type="button"
              onClick={onStart}
              className="ws-key-btn ws-key-btn--primary hidden min-h-[44px] px-4 py-2 text-[15px] sm:inline-flex"
            >
              <span>{WORKSHOP_STRINGS.nav.start}</span>
              <span className="ws-key-icon inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--on-accent)]/15">
                <PhPlay size={13} weight="fill" />
              </span>
            </button>

            {/* Mobile bottom-sheet menu trigger (< 1024px) */}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-expanded={sheetOpen}
              aria-controls="mobile-workshop-sheet"
              aria-label={t.openMenu}
              className="inline-flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-[14px] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] text-[var(--on-surface)] shadow-[var(--sh-1)] transition-transform duration-150 hover:border-[var(--accent)] active:scale-95 lg:hidden"
            >
              <PhMenu size={20} weight="bold" />
            </button>
          </div>
        </div>

        {/* Thin lesson completion hairline under header */}
        <div
          role="progressbar"
          aria-label="Darslar jarayoni"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clampedPct}
          aria-valuetext={`${completedCount} / ${totalLessons}`}
          className="absolute inset-x-0 bottom-0 h-[3px] bg-[var(--line)]"
        >
          <div
            className="h-full bg-[var(--ok)]"
            style={{
              width: `${clampedPct}%`,
              transition: motionPaused
                ? 'width 150ms linear'
                : 'width 570ms var(--spring-soft)',
            }}
          />
        </div>
      </header>

      {/* A12 Mobile Bottom Sheet Navigation (< 1024px) */}
      <AnimatePresence>
        {sheetOpen ? (
          <div className="fixed inset-0 z-50 flex items-end lg:hidden">
            <motion.button
              type="button"
              aria-label={t.closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: motionPaused ? 0.1 : 0.2 }}
              onClick={() => setSheetOpen(false)}
              className="absolute inset-0 bg-[#071529]/72"
            />
            <motion.div
              id="mobile-workshop-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Mobil boʻlimlar"
              initial={motionPaused ? { opacity: 0 } : { y: '100%' }}
              animate={motionPaused ? { opacity: 1 } : { y: 0 }}
              exit={motionPaused ? { opacity: 0 } : { y: '100%' }}
              transition={
                motionPaused
                  ? { duration: 0.14 }
                  : { duration: 0.48, ease: [0.16, 1, 0.3, 1] }
              }
              className="relative z-10 w-full rounded-t-[28px] border-t-2 border-[var(--line-strong)] bg-[var(--surface-raised)] px-5 pt-4 pb-7 text-[var(--on-surface)] shadow-[var(--sh-5)]"
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--line-strong)]" aria-hidden="true" />
              <div className="mb-4 flex items-center justify-between">
                <span className="font-[family-name:var(--font-display)] text-lg font-extrabold">
                  {WORKSHOP_STRINGS.brandName}
                </span>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label={t.closeMenu}
                  className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border border-[var(--line-strong)] bg-[var(--surface)]"
                >
                  <PhClose size={18} weight="bold" />
                </button>
              </div>

              <nav aria-label="Mobil boʻlimlar" className="grid gap-2">
                {NAV_ITEMS.map((item) => {
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={(e) => {
                        setSheetOpen(false);
                        onNavigate(item.id, item.isBlueprint, e);
                      }}
                      aria-current={active ? 'location' : undefined}
                      className={`flex min-h-[48px] w-full items-center justify-between rounded-[14px] border-2 px-4 text-left text-[16px] font-bold transition-colors ${
                        active
                          ? 'border-[var(--accent)] bg-[var(--surface)] text-[var(--on-surface)] shadow-[var(--sh-2)]'
                          : 'border-[var(--line)] bg-[var(--surface-inset)] text-[var(--on-surface)]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[13px] font-semibold text-[var(--on-surface-muted)]">
                        {item.isBlueprint ? t.surfaceBlueprint : t.surfacePaper}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <button
                type="button"
                onClick={(e) => {
                  setSheetOpen(false);
                  onStart(e);
                }}
                className="ws-key-btn ws-key-btn--primary mt-4 min-h-[52px] w-full"
              >
                <span>{WORKSHOP_STRINGS.nav.start}</span>
                <span className="ws-key-icon inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--on-accent)]/18">
                  <PhPlay size={13} weight="fill" />
                </span>
              </button>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
