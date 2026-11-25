/**
 * Blueprint "Workshop HUD" right column:
 * - Hierarchy: Mirzo arched niche (~60%) -> Level pin + XP flask + Ember streak -> Machine & Toggles
 * - Speech bubble sticker with 28ms/char typing (click skips, aria-live reads immediately)
 * - Live miniature "Mirzo mashinasi" step button + 3 workshop tokens
 * - Tactile LED switches for Ovoz & Subtitrlar
 */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
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
import { MACHINE_TICKS, WORKSHOPS } from '@/lib/data/workshop';
import { WORKSHOP_STRINGS } from '@/lib/engine/i18n';
import type { MirzoController, MirzoMood } from '@/lib/engine/mirzo';
import type { WorkshopId } from '@/lib/engine/store';

interface WorkshopHudProps {
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
  nudgeError?: boolean;
  lookOffset: { x: number; y: number };
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
  liteMode,
  motionPaused,
  unlockedWorkshops,
  machineTick,
  mood,
  speechText,
  nudgeError = false,
  lookOffset,
  mirzoRef,
  onToggleSound,
  onToggleSubtitles,
  onStepMachine,
  onOpenWorkshop,
}: WorkshopHudProps) {
  const [typedLen, setTypedLen] = useState(speechText.length);
  const [pinRing, setPinRing] = useState(false);
  const [girihTurn, setGirihTurn] = useState(0);
  const prevLevelRef = useRef(level);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setPinRing(true);
      setGirihTurn((t) => t + 45);
      const id = window.setTimeout(() => setPinRing(false), 500);
      prevLevelRef.current = level;
      return () => clearTimeout(id);
    }
    prevLevelRef.current = level;
  }, [level]);

  useEffect(() => {
    if (liteMode || motionPaused || !subtitlesEnabled) {
      queueMicrotask(() => setTypedLen(speechText.length));
      return;
    }
    queueMicrotask(() => setTypedLen(0));
    let idx = 0;
    const id = window.setInterval(() => {
      idx += 1;
      setTypedLen(idx);
      if (idx >= speechText.length) {
        clearInterval(id);
      }
    }, 28);
    return () => clearInterval(id);
  }, [speechText, liteMode, motionPaused, subtitlesEnabled]);

  const isTyping = typedLen < speechText.length && subtitlesEnabled;
  const currentTick = MACHINE_TICKS[machineTick % MACHINE_TICKS.length];
  const t = WORKSHOP_STRINGS;

  return (
    <div
      data-surface="blueprint"
      className={`ws-surface ws-blueprint-grid ws-girih-bg ws-blueprint-panel relative p-4 sm:p-5 ${
        nudgeError ? 'ws-soft-nudge' : ''
      }`}
    >
      {/* Top strip: Level pin + XP flask + Ember streak */}
      <div className="mb-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2.5 rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface-inset)] px-3 py-1.5">
            <span
              className={`relative inline-flex h-8 w-8 items-center justify-center transition-transform duration-300 ${
                pinRing ? 'scale-[1.18]' : 'scale-100'
              }`}
            >
              <PinStarIcon size={32} />
              <span className="ws-tabular absolute inset-0 flex items-center justify-center text-[13px] font-extrabold leading-none text-[#0F1E3A]">
                {level}
              </span>
            </span>
            <span className="font-[family-name:var(--font-display)] text-[15px] font-bold">
              {t.hud.levelLabel}
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-[10px] border px-3 py-1.5 text-[15px] font-bold transition-transform duration-300 ${
              streak > 0
                ? 'border-[#E4572E] bg-[#E4572E]/20 text-[#FFFDF7]'
                : 'border-[var(--line)] bg-[var(--surface-inset)] text-[var(--on-surface-muted)]'
            }`}
          >
            <EmberIcon active={streak > 0} size={20} />
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

      {/* Center (~60%): Arched Mirzo niche with 3 parallax depth layers & girih medallion */}
      <div className="relative flex flex-col items-center overflow-hidden rounded-t-[96px] rounded-b-[20px] border-2 border-[var(--line-strong)] bg-[#07264B] px-4 pt-4 pb-3 shadow-[var(--sh-inset)]">
        {/* Layer 1: Girih medallion behind Mirzo (turns 1/8 on events) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 180 180"
          className="pointer-events-none absolute top-3 h-44 w-44 text-[#EAF2FF]/12"
          style={{
            transform: `translate(${(lookOffset.x * -4).toFixed(1)}px, ${(lookOffset.y * -4).toFixed(1)}px) rotate(${girihTurn}deg)`,
            transition: 'transform 450ms var(--spring-soft)',
          }}
        >
          <polygon
            points="90,8 112,56 164,56 124,90 142,142 90,114 38,142 56,90 16,56 68,56"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="90" cy="84" r="56" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        {/* Layer 2: Mirzo SVG Rig (>= 160px on mobile) */}
        <div
          className="relative z-10"
          style={{
            transform:
              liteMode || motionPaused
                ? undefined
                : `translate(${(lookOffset.x * 5).toFixed(1)}px, ${(lookOffset.y * 4).toFixed(1)}px)`,
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
            size={174}
          />
        </div>

        {/* Speech bubble sticker (click completes typing; aria-live exposes full text immediately) */}
        <button
          type="button"
          onClick={() => setTypedLen(speechText.length)}
          title={isTyping ? t.reviewStrings.skipTyping : undefined}
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
      <div className="mt-3 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--surface-inset)] px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[14px] font-bold text-[#EAF2FF]">
              <PhMachine size={16} />
              <span>{t.hud.machineTitle}</span>
            </p>
            <code className="mt-0.5 block text-[13.5px] font-medium text-[#F5A800]">
              {currentTick.code} <span className="text-[#B6CCE8]">|</span> ball: {currentTick.boxX}
            </code>
          </div>
          <button
            type="button"
            onClick={onStepMachine}
            className="min-h-[44px] shrink-0 rounded-[10px] border-2 border-[#0E7C70] bg-[#19B7A6] px-3 py-1.5 text-[14px] font-bold text-[#0F1E3A] shadow-[0_2px_0_#0E7C70] active:translate-y-0.5"
          >
            {t.hud.machineStepBtn}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--surface-inset)] p-2 min-[420px]:grid-cols-3">
          {WORKSHOPS.map((ws) => {
            const unlocked = unlockedWorkshops.includes(ws.id);
            return (
              <button
                key={ws.id}
                type="button"
                onClick={(e) => onOpenWorkshop(ws.id, e)}
                title={ws.title}
                className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border px-2 text-[14px] font-bold transition-colors ${
                  unlocked
                    ? 'border-[#19B7A6] bg-[#19B7A6]/15 text-[#EAF2FF] hover:bg-[#19B7A6]/25'
                    : 'border-[var(--line)] bg-[#07264B] text-[#B6CCE8]/80 shadow-[var(--sh-inset)] hover:border-[var(--line-strong)]'
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

      {/* Bottom toggles: hardware LED indicators + spring slider */}
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          role="switch"
          aria-checked={soundEnabled}
          onClick={onToggleSound}
          className="flex min-h-[46px] items-center justify-between gap-2 rounded-[14px] border-2 border-[var(--line)] bg-[var(--surface-inset)] px-3 py-2 text-left text-[14px] font-bold"
        >
          <span className="inline-flex items-center gap-1.5 leading-snug">
            {soundEnabled ? <PhSoundOn size={17} /> : <PhSoundOff size={17} />}
            <span>{soundEnabled ? t.hud.soundOn : t.hud.soundOff}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <ToggleLedIcon lit={soundEnabled} size={11} />
            <span className="relative inline-flex h-5 w-8 items-center rounded-full border border-[var(--line-strong)] bg-[#07264B] p-0.5">
              <motion.span
                layout
                transition={
                  motionPaused
                    ? { duration: 0.1 }
                    : { type: 'spring', stiffness: 460, damping: 28 }
                }
                className={`h-3.5 w-3.5 rounded-full ${
                  soundEnabled ? 'ml-auto bg-[#19B7A6]' : 'bg-[#B6CCE8]'
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
          className="flex min-h-[46px] items-center justify-between gap-2 rounded-[14px] border-2 border-[var(--line)] bg-[var(--surface-inset)] px-3 py-2 text-left text-[14px] font-bold"
        >
          <span className="inline-flex items-center gap-1.5 leading-snug">
            <PhSubtitles size={17} />
            <span>{subtitlesEnabled ? t.hud.subtitlesOn : t.hud.subtitlesOff}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <ToggleLedIcon lit={subtitlesEnabled} size={11} />
            <span className="relative inline-flex h-5 w-8 items-center rounded-full border border-[var(--line-strong)] bg-[#07264B] p-0.5">
              <motion.span
                layout
                transition={
                  motionPaused
                    ? { duration: 0.1 }
                    : { type: 'spring', stiffness: 460, damping: 28 }
                }
                className={`h-3.5 w-3.5 rounded-full ${
                  subtitlesEnabled ? 'ml-auto bg-[#19B7A6]' : 'bg-[#B6CCE8]'
                }`}
              />
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
