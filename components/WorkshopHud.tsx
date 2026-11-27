/**
 * Blueprint "Workshop HUD" (right column):
 * - Rough.js build-time chalk border drawn by GSAP DrawSVG (A01/A15)
 * - 3D clearcoat or SVG 24/36/18 GearTrain behind Mirzo (A05)
 * - 8-point girih level pin with 360° Y-flip, shockwave ring & 1.5px jolt on level:up (A07)
 * - Graduated XP flask with MotionPath sparks & MorphSVG meniscus (A06)
 * - MorphSVG Seriya ember <-> flame with rising sparks (A08)
 * - Base UI Switch primitives with LED & spring thumb (A09)
 * - Desktop fine-pointer panel tilt <= 5 deg on tier: high (A10)
 */
'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';
import {
  EmberIcon,
  MechLockIcon,
  PhMachine,
  PhSoundOff,
  PhSoundOn,
  PhSubtitles,
  PinStarIcon,
  ToggleLedIcon,
  WorkshopTokenIcon,
} from '@/components/icons/WorkshopIcons';
import { MirzoRig } from '@/components/MirzoRig';
import { XpFlask } from '@/components/XpFlask';
import { MACHINE_TICKS, WORKSHOP_META } from '@/lib/data/heroMeta';
import { HERO_STRINGS } from '@/lib/engine/heroStrings';
import type { MirzoController, MirzoMood } from '@/lib/engine/mirzo';
import type { WorkshopId } from '@/lib/engine/store';
import { motionCore, type QualityTier } from '@/lib/motion/core';

const GearTrain = dynamic(
  () => import('@/components/GearTrain').then((m) => m.GearTrain),
  { ssr: true }
);

const HUD_FRAME_PATH =
  'M23.3 7.5 C110.7 8.2, 196.4 9.1, 456.2 7.5 M455.7 8.2 C460.0 11.7, 466.3 16.6, 472.8 24.8 M471.6 24.1 C471.5 216.1, 471.8 407.6, 472.1 596.4 M471.3 595.2 C466.5 601.6, 463.5 604.9, 456.1 611.7 M455.4 612.4 C344.9 613.4, 232.6 612.4, 23.7 612.4 M23.2 613.3 C16.9 605.9, 12.2 600.5, 8.6 597.0 M7.9 595.5 C8.4 455.8, 8.2 315.0, 7.7 23.8 M8.2 25.3 C12.9 18.8, 16.4 13.9, 23.3 8.7';

interface WorkshopHudProps {
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
  nudgeError?: boolean;
  lookOffset: { x: number; y: number };
  idleNudgeCta?: boolean;
  mirzoRef: React.RefObject<MirzoController | null>;
  onToggleSound: () => void;
  onToggleSubtitles: () => void;
  onStepMachine: () => void;
  onOpenWorkshop: (id: WorkshopId, e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function WorkshopHud({
  level,
  inLevelXp,
  targetXp,
  streak,
  soundEnabled,
  subtitlesEnabled,
  tier,
  motionPaused,
  unlockedWorkshops,
  machineTick,
  mood,
  speechText,
  nudgeError = false,
  lookOffset,
  idleNudgeCta = false,
  mirzoRef,
  onToggleSound,
  onToggleSubtitles,
  onStepMachine,
  onOpenWorkshop,
}: WorkshopHudProps) {
  const hudPanelRef = useRef<HTMLDivElement | null>(null);
  const chalkFrameRef = useRef<SVGPathElement | null>(null);
  const pinFlipRef = useRef<HTMLSpanElement | null>(null);
  const shockwaveRef = useRef<HTMLSpanElement | null>(null);
  const prevLevelRef = useRef(level);

  const [typedLen, setTypedLen] = useState(speechText.length);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [ledSoundLit, setLedSoundLit] = useState(soundEnabled);
  const [ledSubLit, setLedSubLit] = useState(subtitlesEnabled);

  const liteMode = tier === 'lite';

  // A09 Delayed LED ignition (120ms after toggle)
  useEffect(() => {
    const id = window.setTimeout(() => setLedSoundLit(soundEnabled), motionPaused ? 0 : 120);
    return () => clearTimeout(id);
  }, [soundEnabled, motionPaused]);

  useEffect(() => {
    const id = window.setTimeout(() => setLedSubLit(subtitlesEnabled), motionPaused ? 0 : 120);
    return () => clearTimeout(id);
  }, [subtitlesEnabled, motionPaused]);

  // A01 / A15 DrawSVG chalk border trace on mount & mode switches
  useEffect(() => {
    const pathEl = chalkFrameRef.current;
    if (!pathEl || liteMode || motionPaused) return;
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) return;

    const runDraw = async () => {
      try {
        const [{ default: gsap }, { DrawSVGPlugin }] = await Promise.all([
          import('gsap'),
          import('gsap/DrawSVGPlugin'),
        ]);
        gsap.registerPlugin(DrawSVGPlugin);
        gsap.fromTo(
          pathEl,
          { drawSVG: '0%' },
          { drawSVG: '100%', duration: 0.7, ease: 'power3.inOut' }
        );
      } catch {
        // Path stays visible cleanly
      }
    };

    void runDraw();
    const offMode = motionCore.on('ui:mode', () => {
      void runDraw();
    });
    return () => offMode();
  }, [liteMode, motionPaused]);

  // A07 Level-up pin 360° Y-spin + shockwave ring + 1.5px jolt + 45° girih turn
  useEffect(() => {
    if (level <= prevLevelRef.current) {
      prevLevelRef.current = level;
      return;
    }
    prevLevelRef.current = level;
    if (liteMode || motionPaused) return;
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) return;

    void (async () => {
      try {
        const { default: gsap } = await import('gsap');
        if (hudPanelRef.current) {
          gsap.fromTo(
            hudPanelRef.current,
            { x: -1.5, y: 1.5 },
            { x: 0, y: 0, duration: 0.16, ease: 'power2.out', clearProps: 'x,y' }
          );
        }
        if (pinFlipRef.current) {
          gsap.fromTo(
            pinFlipRef.current,
            { rotateY: 0, scale: 1 },
            {
              rotateY: 360,
              scale: 1.35,
              duration: 0.45,
              ease: 'back.out(1.7)',
              onComplete: () => {
                gsap.to(pinFlipRef.current, { scale: 1, duration: 0.25, ease: 'power2.out' });
              },
            }
          );
        }
        if (shockwaveRef.current) {
          gsap.fromTo(
            shockwaveRef.current,
            { scale: 0.6, opacity: 0.65 },
            { scale: 2.2, opacity: 0, duration: 0.6, ease: 'power2.out' }
          );
        }
      } catch {
        // Static pin state remains visible
      }
    })();
  }, [level, liteMode, motionPaused]);

  // A04 Speech typing (28ms/char + 120ms punctuation pause)
  useEffect(() => {
    if (liteMode || motionPaused || !subtitlesEnabled) {
      queueMicrotask(() => setTypedLen(speechText.length));
      return;
    }
    queueMicrotask(() => setTypedLen(0));
    let idx = 0;
    let timer = 0;
    let cancelled = false;

    const step = () => {
      if (cancelled) return;
      idx += 1;
      setTypedLen(idx);
      if (idx >= speechText.length) return;
      const ch = speechText[idx - 1];
      const delay = ch === '.' || ch === '!' || ch === '?' || ch === ',' ? 120 : 28;
      timer = window.setTimeout(step, delay);
    };
    timer = window.setTimeout(step, 28);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [speechText, liteMode, motionPaused, subtitlesEnabled]);

  // A10 Desktop HUD tilt <= 5 deg (high tier + fine pointer only)
  const handleHudPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (tier !== 'high' || motionPaused || e.pointerType === 'touch') return;
    const rect = hudPanelRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    setTilt({
      rx: Math.max(-4.5, Math.min(4.5, -ny * 4.5)),
      ry: Math.max(-4.5, Math.min(4.5, nx * 4.5)),
    });
  };

  const handleHudPointerLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  const isTyping = typedLen < speechText.length && subtitlesEnabled;
  const currentTick = MACHINE_TICKS[machineTick % MACHINE_TICKS.length];
  const t = HERO_STRINGS;

  return (
    <div
      ref={hudPanelRef}
      data-surface="blueprint"
      onPointerMove={handleHudPointerMove}
      onPointerLeave={handleHudPointerLeave}
      className={`ws-surface ws-blueprint-grid ws-girih-bg ws-blueprint-panel relative p-4 sm:p-5 ${
        nudgeError ? 'ws-soft-nudge' : ''
      }`}
      style={{
        backgroundColor: '#0B3566',
        transform:
          tier === 'high' && !motionPaused && (tilt.rx !== 0 || tilt.ry !== 0)
            ? `perspective(900px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg)`
            : undefined,
        transition:
          tilt.rx === 0 && tilt.ry === 0
            ? 'transform 570ms var(--spring-soft)'
            : 'transform 90ms linear',
      }}
    >
      {/* Rough.js hand-drawn chalk frame overlay (A01/A15 DrawSVG) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 480 620"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      >
        <path
          ref={chalkFrameRef}
          d={HUD_FRAME_PATH}
          fill="none"
          stroke="#EAF2FF"
          strokeOpacity="0.45"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

      {/* Top strip: Level pin + XP flask + Ember streak */}
      <div className="relative z-10 mb-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2.5 rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface-inset)] px-3 py-1.5">
            <span className="relative inline-flex h-8 w-8 items-center justify-center">
              <span
                ref={shockwaveRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#F5A800] opacity-0"
              />
              <span
                ref={pinFlipRef}
                className="relative inline-flex h-8 w-8 items-center justify-center"
              >
                <PinStarIcon size={32} />
                <span className="ws-tabular absolute inset-0 flex items-center justify-center text-[13px] font-extrabold leading-none text-[#0F1E3A]">
                  {level}
                </span>
              </span>
            </span>
            <span className="font-[family-name:var(--font-display)] text-[15px] font-bold">
              {t.hud.levelLabel}
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-[10px] border px-3 py-1.5 text-[15px] font-bold transition-colors duration-300 ${
              streak > 0
                ? 'border-[#E4572E] bg-[#E4572E]/22 text-[#FFFDF7]'
                : 'border-[var(--line)] bg-[var(--surface-inset)] text-[var(--on-surface-muted)]'
            }`}
          >
            <EmberIcon
              active={streak > 0}
              size={20}
              className={streak === 0 && !liteMode && !motionPaused ? 'animate-pulse' : ''}
            />
            <span className="ws-tabular">
              {streak} {t.hud.streakUnit}
            </span>
          </div>
        </div>

        <XpFlask
          inLevelXp={inLevelXp}
          targetXp={targetXp}
          liteMode={liteMode}
          motionPaused={motionPaused}
        />
      </div>

      {/* Center (~60%): Arched Mirzo niche with GearTrain + Girih medallion + Mirzo */}
      <div className="relative z-10 flex flex-col items-center overflow-hidden rounded-t-[96px] rounded-b-[20px] border-2 border-[var(--line-strong)] bg-[#07264B] px-4 pt-4 pb-3 shadow-[var(--sh-inset)]">
        {/* A05 Three.js (high) or SVG (mid/lite) 24/36/18 gear train */}
        <GearTrain tier={tier} motionPaused={motionPaused} lookOffset={lookOffset} />

        {/* Mirzo SVG Rig (>= 160px on mobile) */}
        <div
          className="relative z-10"
          style={{
            transform:
              liteMode || motionPaused
                ? undefined
                : `translate(${(lookOffset.x * 4).toFixed(1)}px, ${(lookOffset.y * 3).toFixed(1)}px)`,
            transition: 'transform 160ms ease-out',
          }}
        >
          <MirzoRig
            ref={mirzoRef}
            mood={mood}
            speaking={isTyping}
            liteMode={liteMode}
            motionPaused={motionPaused}
            lookOffset={lookOffset}
            idleNudgeCta={idleNudgeCta}
            size={174}
          />
        </div>

        {/* Speech bubble sticker (click completes typing; aria-live exposes full text) */}
        <button
          type="button"
          onClick={() => setTypedLen(speechText.length)}
          title={isTyping ? t.header.skipTyping : undefined}
          className="relative z-10 mt-1 w-full rounded-[14px] border-2 border-[var(--line-strong)] bg-[#11437D] px-3.5 py-2.5 text-left text-[15px] font-medium text-[#EAF2FF] shadow-[var(--sh-2)]"
        >
          <span
            aria-hidden="true"
            className="absolute -top-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-[var(--line-strong)] bg-[#11437D]"
          />
          <span className="sr-only" aria-live="polite">
            {speechText}
          </span>
          <span aria-hidden="true" className="block min-h-[1.5em]">
            {subtitlesEnabled ? speechText.slice(0, typedLen) : '…'}
          </span>
        </button>
      </div>

      {/* Live miniature "Mirzo mashinasi" + 3 Ustaxona tokens */}
      <div className="relative z-10 mt-3 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--surface-inset)] px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[14px] font-bold text-[#EAF2FF]">
              <PhMachine size={16} />
              <span>{t.hud.machineTitle}</span>
            </p>
            <code className="mt-0.5 block text-[13.5px] font-medium text-[#FAAD14]">
              {currentTick?.code ?? ''} <span className="text-[#B6CCE8]">|</span> ball: {currentTick?.boxX ?? 0}
            </code>
          </div>
          <button
            type="button"
            onClick={onStepMachine}
            className="min-h-[44px] shrink-0 rounded-[10px] border-2 border-[#0E7C70] bg-[#19B7A6] px-3 py-1.5 text-[14px] font-bold text-[#0F1E3A] shadow-[0_3px_0_#0E7C70] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0.5"
          >
            {t.hud.machineStepBtn}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--surface-inset)] p-2 min-[420px]:grid-cols-3">
          {WORKSHOP_META.map((ws) => {
            const unlocked = unlockedWorkshops.includes(ws.id);
            return (
              <button
                key={ws.id}
                type="button"
                onClick={(e) => onOpenWorkshop(ws.id, e)}
                title={ws.title}
                className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border px-2 text-[14px] font-bold transition-all duration-150 ${
                  unlocked
                    ? 'border-[#19B7A6] bg-[#19B7A6]/18 text-[#EAF2FF] shadow-[var(--sh-1)] hover:-translate-y-0.5 hover:bg-[#19B7A6]/28 active:translate-y-0.5'
                    : 'border-[var(--line)] bg-[#07264B] text-[#B6CCE8] shadow-[var(--sh-inset)] hover:border-[var(--line-strong)]'
                }`}
              >
                {unlocked ? (
                  <WorkshopTokenIcon unlocked size={18} />
                ) : (
                  <MechLockIcon unlocked={false} size={16} />
                )}
                <span>{ws.badgeText}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessible Switch buttons with LED & CSS spring thumb */}
      <div className="relative z-10 mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          role="switch"
          aria-checked={soundEnabled}
          onClick={onToggleSound}
          aria-label={soundEnabled ? t.hud.soundOn : t.hud.soundOff}
          className="flex min-h-[46px] cursor-pointer items-center justify-between gap-2 rounded-[14px] border-2 border-[var(--line)] bg-[var(--surface-inset)] px-3 py-2 text-left text-[14px] font-bold text-[#EAF2FF] active:scale-[0.96] transition-transform duration-100"
        >
          <span className="inline-flex items-center gap-1.5 leading-snug">
            {soundEnabled ? <PhSoundOn size={17} /> : <PhSoundOff size={17} />}
            <span>{soundEnabled ? t.hud.soundOn : t.hud.soundOff}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <ToggleLedIcon lit={ledSoundLit} size={11} />
            <span className="relative inline-flex h-5 w-8 items-center rounded-full border border-[var(--line-strong)] bg-[#07264B] p-0.5">
              <span
                className={`block h-3.5 w-3.5 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  soundEnabled ? 'translate-x-3 bg-[#19B7A6]' : 'translate-x-0 bg-[#B6CCE8]'
                }`}
              />
            </span>
          </span>
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={subtitlesEnabled}
          onClick={onToggleSubtitles}
          aria-label={subtitlesEnabled ? t.hud.subtitlesOn : t.hud.subtitlesOff}
          className="flex min-h-[46px] cursor-pointer items-center justify-between gap-2 rounded-[14px] border-2 border-[var(--line)] bg-[var(--surface-inset)] px-3 py-2 text-left text-[14px] font-bold text-[#EAF2FF] active:scale-[0.96] transition-transform duration-100"
        >
          <span className="inline-flex items-center gap-1.5 leading-snug">
            <PhSubtitles size={17} />
            <span>{subtitlesEnabled ? t.hud.subtitlesOn : t.hud.subtitlesOff}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <ToggleLedIcon lit={ledSubLit} size={11} />
            <span className="relative inline-flex h-5 w-8 items-center rounded-full border border-[var(--line-strong)] bg-[#07264B] p-0.5">
              <span
                className={`block h-3.5 w-3.5 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  subtitlesEnabled ? 'translate-x-3 bg-[#19B7A6]' : 'translate-x-0 bg-[#B6CCE8]'
                }`}
              />
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
