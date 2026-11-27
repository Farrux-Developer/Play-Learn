/**
 * Hero section ("paper" left, "blueprint" Workshop HUD right):
 * - Anti-slop cleanup: removed decorative green dot & excessive boxed pill clutter
 * - Fluid Onest headline with 1-2-3 sequential typographic cadence
 * - A01 GSAP master-timeline (<= 1.2s, SplitText lines, HUD clip-path unfold, primary CTA last)
 * - A03 hover CTA gaze nudge toward Boshlash
 */
'use client';

import React, { useEffect, useRef } from 'react';
import {
  PhChecklist,
  PhPlay,
} from '@/components/icons/WorkshopIcons';
import { WorkshopHud } from '@/components/WorkshopHud';
import { HERO_STRINGS } from '@/lib/engine/heroStrings';
import type { MirzoController, MirzoMood } from '@/lib/engine/mirzo';
import type { WorkshopId } from '@/lib/engine/store';
import type { QualityTier } from '@/lib/motion/core';

interface HeroSectionProps {
  level: number;
  inLevelXp: number;
  targetXp: number;
  streak: number;
  soundEnabled: boolean;
  subtitlesEnabled: boolean;
  tier: QualityTier;
  motionPaused: boolean;
  unlockedWorkshops: WorkshopId[];
  machineTick: number;
  mood: MirzoMood;
  speechText: string;
  nudgeError: boolean;
  lookOffset: { x: number; y: number };
  idleNudgeCta: boolean;
  mirzoRef: React.RefObject<MirzoController | null>;
  onStart: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDiagnostic: () => void;
  onToggleSound: () => void;
  onToggleSubtitles: () => void;
  onStepMachine: () => void;
  onOpenWorkshop: (id: WorkshopId, e: React.MouseEvent<HTMLButtonElement>) => void;
  onHeroVisibleChange?: (visible: boolean) => void;
  headlineSlot?: React.ReactNode;
  promisesSlot?: React.ReactNode;
}

export function HeroSection(props: HeroSectionProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLDivElement | null>(null);
  const subBlockRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const hudWrapRef = useRef<HTMLDivElement | null>(null);

  const { onHeroVisibleChange } = props;
  const liteMode = props.tier === 'lite';

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

  // A01 Master-timeline (<= 1.2s; waits for document.fonts.ready; fast repeat visit)
  useEffect(() => {
    if (liteMode || props.motionPaused) return;
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

    let cancelled = false;
    let ctx: { revert: () => void } | null = null;

    const run = async () => {
      if (document.fonts?.ready) await document.fonts.ready;
      if (cancelled) return;
      const [{ default: gsap }, { SplitText }] = await Promise.all([
        import('gsap'),
        import('gsap/SplitText'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(SplitText);

      const headingEl = headlineRef.current?.querySelector('h1') ?? headlineRef.current;
      ctx = gsap.context(() => {
        if (played) {
          // Repeat visit <= 360ms without SplitText
          gsap.from([headingEl, subBlockRef.current, hudWrapRef.current], {
            opacity: 0,
            y: 8,
            duration: 0.32,
            stagger: 0.04,
            ease: 'power2.out',
          });
          return;
        }

        const tl = gsap.timeline();
        if (headingEl) {
          const split = new SplitText(headingEl, { type: 'lines', mask: 'lines' });
          tl.from(
            split.lines,
            {
              yPercent: 105,
              rotate: 2,
              duration: 0.64,
              stagger: 0.07,
              ease: 'expo.out',
            },
            0.12
          );
        }
        if (subBlockRef.current) {
          tl.from(
            subBlockRef.current,
            { opacity: 0, y: 10, duration: 0.5, ease: 'power3.out' },
            0.28
          );
        }
        if (hudWrapRef.current) {
          tl.fromTo(
            hudWrapRef.current,
            { clipPath: 'inset(0 0 100% 0)', opacity: 0.6 },
            { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 0.44, ease: 'power3.out' },
            0.42
          );
        }
        if (actionsRef.current) {
          const btns = Array.from(actionsRef.current.children);
          // Secondary first, primary CTA last with vertical squash pop
          tl.from(
            btns.reverse(),
            {
              opacity: 0,
              scaleY: 0.88,
              y: 8,
              duration: 0.36,
              stagger: 0.1,
              ease: 'back.out(1.6)',
            },
            0.7
          );
        }
      }, heroRef);
    };

    void run();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [liteMode, props.motionPaused]);

  const t = HERO_STRINGS.hero;

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6 sm:pt-10 sm:pb-14"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.03fr_0.97fr] lg:gap-10">
        {/* Left column: Paper archival reading & crisp typography */}
        <div className="space-y-5">
          <div ref={headlineRef} className="space-y-5">
            {props.headlineSlot}
          </div>

          {/* Subtitle + Physical Keys + Clean Promises Strip */}
          <div ref={subBlockRef} className="space-y-5">
            <p className="ws-body text-[var(--on-surface-muted)]">{t.subtitle}</p>

            {/* Primary & Secondary physical keys (full-width >= 52px on mobile) */}
            <div ref={actionsRef} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={props.onStart}
                onMouseEnter={() => props.mirzoRef.current?.lookAt(-0.85, 0.55)}
                onFocus={() => props.mirzoRef.current?.lookAt(-0.85, 0.55)}
                className="ws-key-btn ws-key-btn--primary min-h-[54px] w-full px-6 text-[17px] sm:w-auto"
              >
                <span>{t.primaryCta}</span>
                <span className="ws-key-icon inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--on-accent)]/18">
                  <PhPlay size={14} weight="fill" />
                </span>
              </button>

              <button
                type="button"
                onClick={props.onDiagnostic}
                onMouseEnter={() => props.mirzoRef.current?.lookAt(-0.55, 0.65)}
                onFocus={() => props.mirzoRef.current?.lookAt(-0.55, 0.65)}
                className="ws-key-btn ws-key-btn--secondary min-h-[54px] w-full px-5 text-[16px] sm:w-auto"
              >
                <PhChecklist size={20} weight="bold" className="ws-key-icon" />
                <span>{t.secondaryCta}</span>
              </button>
            </div>

            {props.promisesSlot}
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
            tier={props.tier}
            motionPaused={props.motionPaused}
            unlockedWorkshops={props.unlockedWorkshops}
            machineTick={props.machineTick}
            mood={props.mood}
            speechText={props.speechText}
            nudgeError={props.nudgeError}
            lookOffset={props.lookOffset}
            idleNudgeCta={props.idleNudgeCta}
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
