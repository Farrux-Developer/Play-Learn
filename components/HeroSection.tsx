/**
 * Hero section ("paper" surface left, "blueprint" Workshop HUD right)
 * with single-run <= 1.2s GSAP choreography (lazy-loaded after document.fonts.ready),
 * 3-step sequence marker, physical key buttons, promise chips with icons,
 * and mobile sticky CTA bar when hero scrolls out of viewport.
 */
'use client';

import React, { useEffect, useRef } from 'react';
import {
  PhCheck,
  PhChecklist,
  PhLightning,
  PhPlay,
  PhWorkshop,
} from '@/components/icons/WorkshopIcons';
import { WorkshopHud } from '@/components/WorkshopHud';
import { WORKSHOP_STRINGS } from '@/lib/engine/i18n';
import type { MirzoController, MirzoMood } from '@/lib/engine/mirzo';
import type { WorkshopId } from '@/lib/engine/store';

interface HeroSectionProps {
  level: number;
  inLevelXp: number;
  targetXp: number;
  streak: number;
  soundEnabled: boolean;
  subtitlesEnabled: boolean;
  liteMode: boolean;
  motionPaused: boolean;
  unlockedWorkshops: WorkshopId[];
  machineTick: number;
  mood: MirzoMood;
  speechText: string;
  nudgeError: boolean;
  lookOffset: { x: number; y: number };
  mirzoRef: React.RefObject<MirzoController | null>;
  onStart: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDiagnostic: () => void;
  onToggleSound: () => void;
  onToggleSubtitles: () => void;
  onStepMachine: () => void;
  onOpenWorkshop: (id: WorkshopId, e: React.MouseEvent<HTMLButtonElement>) => void;
  onHeroVisibleChange?: (visible: boolean) => void;
}

export function HeroSection(props: HeroSectionProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subBlockRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const hudWrapRef = useRef<HTMLDivElement | null>(null);

  const { onHeroVisibleChange } = props;

  useEffect(() => {
    const el = heroRef.current;
    if (!el || !onHeroVisibleChange) return;
    const obs = new IntersectionObserver(
      (entries) => onHeroVisibleChange(entries[0]?.isIntersecting ?? true),
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onHeroVisibleChange]);

  // Single-run hero entrance choreography (<= 1.2s, waits for fonts, skips repeat visits)
  useEffect(() => {
    if (props.liteMode || props.motionPaused) return;
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) return;

    let played = false;
    try {
      played = sessionStorage.getItem('oyna_hero_played') === '1';
      sessionStorage.setItem('oyna_hero_played', '1');
    } catch {
      played = false;
    }
    if (played) return;

    let cancelled = false;
    const run = async () => {
      if (document.fonts?.ready) await document.fonts.ready;
      if (cancelled) return;
      const [{ default: gsap }, { SplitText }] = await Promise.all([
        import('gsap'),
        import('gsap/SplitText'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(SplitText);

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (headlineRef.current) {
        const split = new SplitText(headlineRef.current, { type: 'lines', mask: 'lines' });
        tl.from(split.lines, { yPercent: 100, duration: 0.65, stagger: 0.07 }, 0.1);
      }
      if (subBlockRef.current) {
        tl.from(subBlockRef.current, { opacity: 0, y: 8, duration: 0.5 }, 0.3);
      }
      if (hudWrapRef.current) {
        tl.from(hudWrapRef.current, { opacity: 0, scale: 0.97, duration: 0.65 }, 0.35);
      }
      if (actionsRef.current) {
        const btns = Array.from(actionsRef.current.children);
        tl.from(btns.reverse(), { opacity: 0, y: 10, duration: 0.4, stagger: 0.09 }, 0.7);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [props.liteMode, props.motionPaused]);

  const t = WORKSHOP_STRINGS.hero;
  const promiseIcons = [PhCheck, PhWorkshop, PhLightning];

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6 sm:pt-10 sm:pb-14"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        {/* Left column: Paper reading & typography */}
        <div className="space-y-5">
          {/* Audience sticker tag */}
          <div className="inline-flex items-center gap-2 rounded-[8px] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] px-3.5 py-1.5 text-[14px] font-bold shadow-[var(--sh-1)]">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--ok)]" aria-hidden="true" />
            <span>{t.audienceTag}</span>
          </div>

          {/* Fluid Hero Headline + 3-step sequence marker */}
          <div>
            <h1
              ref={headlineRef}
              className="ws-hero-title font-extrabold leading-[1.03] tracking-[-0.025em]"
            >
              {t.headline}
            </h1>
            <div
              aria-hidden="true"
              className="mt-3 flex flex-wrap items-center gap-2 text-[14px] font-bold text-[var(--on-surface-muted)]"
            >
              <span className="rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-2.5 py-0.5">
                1. Tushun
              </span>
              <span className="h-[2px] w-4 bg-[var(--line-strong)]" />
              <span className="rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-2.5 py-0.5">
                2. Oʻyna
              </span>
              <span className="h-[2px] w-4 bg-[var(--line-strong)]" />
              <span className="rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-2.5 py-0.5">
                3. Boshqar
              </span>
            </div>
          </div>

          {/* Subtitle + Promise chips */}
          <div ref={subBlockRef} className="space-y-5">
            <p className="ws-body text-[var(--on-surface-muted)]">
              {t.subtitle}
            </p>

            {/* Primary & Secondary physical keys (full-width >= 52px on mobile) */}
            <div ref={actionsRef} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={props.onStart}
                className="ws-key-btn ws-key-btn--primary min-h-[54px] w-full px-6 text-[17px] sm:w-auto"
              >
                <span>{t.primaryCta}</span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--on-accent)]/18">
                  <PhPlay size={14} weight="fill" />
                </span>
              </button>

              <button
                type="button"
                onClick={props.onDiagnostic}
                className="ws-key-btn ws-key-btn--secondary min-h-[54px] w-full px-5 text-[16px] sm:w-auto"
              >
                <PhChecklist size={20} weight="bold" />
                <span>{t.secondaryCta}</span>
              </button>
            </div>

            {/* 3 Product Promise Chips with own icons (no dot separators) */}
            <ul className="flex flex-wrap gap-2.5 pt-1">
              {t.promises.map((item, idx) => {
                const Icon = promiseIcons[idx] || PhCheck;
                return (
                  <li
                    key={item.id}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-3 py-1.5 text-[14px] font-semibold text-[var(--on-surface)] shadow-[var(--sh-1)]"
                  >
                    <Icon size={16} weight="bold" className="text-[var(--accent)]" />
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Right column: Blueprint Workshop HUD */}
        <div ref={hudWrapRef}>
          <WorkshopHud
            level={props.level}
            inLevelXp={props.inLevelXp}
            targetXp={props.targetXp}
            streak={props.streak}
            soundEnabled={props.soundEnabled}
            subtitlesEnabled={props.subtitlesEnabled}
            liteMode={props.liteMode}
            motionPaused={props.motionPaused}
            unlockedWorkshops={props.unlockedWorkshops}
            machineTick={props.machineTick}
            mood={props.mood}
            speechText={props.speechText}
            nudgeError={props.nudgeError}
            lookOffset={props.lookOffset}
            mirzoRef={props.mirzoRef}
            onToggleSound={props.onToggleSound}
            onToggleSubtitles={props.onToggleSubtitles}
            onStepMachine={props.onStepMachine}
            onOpenWorkshop={props.onOpenWorkshop}
          />
        </div>
      </div>
    </section>
  );
}
