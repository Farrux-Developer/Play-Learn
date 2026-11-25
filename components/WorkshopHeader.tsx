/**
 * Sticky workshop navigation header with sliding active indicator,
 * scroll-triggered shadow/compression, mode surface indicator,
 * WCAG 2.2.2 animation pause switch, and physical Start button.
 */
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
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
  onNavigate: (section: NavSectionId, triggerBlueprint?: boolean, e?: React.MouseEvent<HTMLElement>) => void;
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
  onNavigate,
  onStart,
  onTogglePause,
}: WorkshopHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b-2 border-[var(--line)] bg-[var(--surface)] transition-[padding,box-shadow] duration-200 ${
        scrolled ? 'py-2 shadow-[var(--sh-2)]' : 'py-3.5'
      }`}
    >
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
                className="relative min-h-[44px] rounded-[10px] px-4 py-1.5 text-[15px] font-bold transition-colors"
              >
                {active ? (
                  <motion.span
                    layoutId="ws-nav-pill"
                    transition={
                      motionPaused
                        ? { duration: 0.12 }
                        : { type: 'spring', stiffness: 420, damping: 30 }
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
            title={
              motionPaused
                ? WORKSHOP_STRINGS.reviewStrings.resumeMotion
                : WORKSHOP_STRINGS.reviewStrings.pauseMotion
            }
            aria-label={
              motionPaused
                ? WORKSHOP_STRINGS.reviewStrings.resumeMotion
                : WORKSHOP_STRINGS.reviewStrings.pauseMotion
            }
            className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[14px] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] text-[var(--on-surface)] shadow-[var(--sh-1)] hover:border-[var(--accent)]"
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
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--on-accent)]/15">
              <PhPlay size={13} weight="fill" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile & tablet navigation strip (<1024px) */}
      <nav
        aria-label="Mobil boʻlimlar"
        className="mx-auto mt-2 flex max-w-6xl items-center gap-1 overflow-x-auto px-4 pb-1 lg:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={(e) => onNavigate(item.id, item.isBlueprint, e)}
              aria-current={active ? 'location' : undefined}
              className={`min-h-[44px] shrink-0 rounded-[10px] border px-3 text-[14px] font-bold transition-colors ${
                active
                  ? 'border-[var(--line-strong)] bg-[var(--surface-raised)] text-[var(--on-surface)] shadow-[var(--sh-1)]'
                  : 'border-transparent bg-[var(--surface-inset)]/70 text-[var(--on-surface-muted)]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
