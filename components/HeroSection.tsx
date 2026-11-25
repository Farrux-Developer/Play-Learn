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
}

export function HeroSection(props: HeroSectionProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
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

      ctx = gsap.context(() => {
        if (played) {
          // Repeat visit <= 360ms without SplitText
          gsap.from([headlineRef.current, subBlockRef.current, hudWrapRef.current], {
            opacity: 0,
            y: 8,
            duration: 0.32,
            stagger: 0.04,
            ease: 'power2.out',
          });
          return;
        }

        const tl = gsap.timeline();
        if (headlineRef.current) {
          const split = new SplitText(headlineRef.current, { type: 'lines', mask: 'lines' });
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

  const t = WORKSHOP_STRINGS.hero;
  const promiseIcons = [PhCheck, PhWorkshop, PhLightning];

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6 sm:pt-10 sm:pb-14"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.03fr_0.97fr] lg:gap-10">
        {/* Left column: Paper archival reading & crisp typography */}
        <div className="space-y-5">
          {/* Clean workshop label sticker (no decorative colored status dots) */}
          <p className="inline-block rounded-[8px] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] px-3.5 py-1 text-[14px] font-bold text-[var(--on-surface)] shadow-[var(--sh-1)]">
            {t.audienceTag}
          </p>

          {/* Fluid Hero Headline + uncluttered typographic 1-2-3 cadence */}
          <div>
            <h1
              ref={headlineRef}
              className="ws-hero-title font-extrabold leading-[0.98] tracking-[-0.025em]"
            >
              {t.headline}
            </h1>
            <p
              aria-hidden="true"
              className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14.5px] font-bold text-[var(--accent)]"
            >
              <span>
                <span className="ws-tabular mr-1 text-[var(--on-surface-muted)]">1.</span>
                Tushun
              </span>
              <span className="h-[2px] w-3 bg-[var(--line-strong)]" />
              <span>
                <span className="ws-tabular mr-1 text-[var(--on-surface-muted)]">2.</span>
                Oʻyna
              </span>
              <span className="h-[2px] w-3 bg-[var(--line-strong)]" />
              <span>
                <span className="ws-tabular mr-1 text-[var(--on-surface-muted)]">3.</span>
                Boshqar
              </span>
            </p>
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

            {/* 3 Product Promises with icons (clean typographic row, no extra boxed pill noise) */}
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--line)] pt-3.5 text-[14.5px] font-semibold text-[var(--on-surface)]">
              {t.promises.map((item, idx) => {
                const Icon = promiseIcons[idx] || PhCheck;
                return (
                  <li key={item.id} className="inline-flex items-center gap-2">
                    <Icon size={17} weight="bold" className="shrink-0 text-[var(--ok-ink)]" />
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
