/**
 * Development-only verification panel (tree-shaken out in production builds).
 * Exposes event triggers (+XP, level-up, streak ignite/break, correct/wrong,
 * quiz complete, workshop unlock), tier & surface switches, slow-mo x0.25,
 * and live FPS / active animation telemetry from MotionCore.
 */
'use client';

import React, { useEffect, useState } from 'react';
import { motionCore, type MotionTelemetry, type TierOverride } from '@/lib/motion/core';
import type { SurfaceMode } from '@/lib/engine/store';

interface DevWorkshopPanelProps {
  xp: number;
  streak: number;
  surfaceMode: SurfaceMode;
  onAddXp: (delta: number) => void;
  onLevelUp: () => void;
  onStreakPlus: () => void;
  onStreakBreak: () => void;
  onCorrect: () => void;
  onWrong: () => void;
  onQuizComplete: () => void;
  onUnlockNext: () => void;
  onToggleSurface: () => void;
  onReset: () => void;
}

export function DevWorkshopPanel({
  xp,
  streak,
  surfaceMode,
  onAddXp,
  onLevelUp,
  onStreakPlus,
  onStreakBreak,
  onCorrect,
  onWrong,
  onQuizComplete,
  onUnlockNext,
  onToggleSurface,
  onReset,
}: DevWorkshopPanelProps) {
  const [open, setOpen] = useState(false);
  const [telemetry, setTelemetry] = useState<MotionTelemetry>(() => motionCore.getTelemetry());

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const sync = () => setTelemetry(motionCore.getTelemetry());
    const offSub = motionCore.subscribeTelemetry(sync);
    const id = window.setInterval(sync, 500);
    return () => {
      offSub();
      window.clearInterval(id);
    };
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const cycleTier = () => {
    const order: TierOverride[] = ['auto', 'high', 'mid', 'lite'];
    const next = order[(order.indexOf(telemetry.tierOverride) + 1) % order.length];
    motionCore.setTierOverride(next);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open dev animation harness"
        className="fixed bottom-16 right-3 z-50 min-h-[40px] rounded-[10px] border-2 border-[#0F1E3A] bg-[#FFFDF7] px-2.5 py-1 text-[12px] font-extrabold text-[#0F1E3A] shadow-[0_6px_14px_-4px_rgba(15,30,58,0.22)] md:bottom-3"
      >
        DEV · {telemetry.tier} · {telemetry.fps}fps
      </button>
    );
  }

  return (
    <aside
      aria-label="Dev animation harness"
      className="fixed bottom-3 right-3 z-50 max-w-sm rounded-[14px] border-2 border-[#0F1E3A] bg-[#FFFDF7] p-3 text-[#0F1E3A] shadow-[0_12px_24px_-8px_rgba(15,30,58,0.26)]"
    >
      <div className="mb-2 flex items-center justify-between gap-2 text-[13px] font-bold">
        <span>DEV · {telemetry.tier.toUpperCase()}</span>
        <span className="ws-tabular text-[#0F4C81]">
          {telemetry.fps} fps · {telemetry.activeAnimations} anim · {xp} XP · {streak}s
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close dev panel"
          className="rounded-[6px] border border-[#0F1E3A]/30 px-2 py-0.5 text-[12px]"
        >
          Yopish
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 text-[12.5px] font-semibold">
        <button
          type="button"
          onClick={() => onAddXp(10)}
          className="rounded-[8px] border border-[#0F1E3A]/30 bg-[#F6F3EA] px-2 py-1 hover:bg-[#EAE3D2]"
        >
          +10 XP
        </button>
        <button
          type="button"
          onClick={onLevelUp}
          className="rounded-[8px] border border-[#B87900] bg-[#F5A800] px-2 py-1 text-[#0F1E3A]"
        >
          Level up
        </button>
        <button
          type="button"
          onClick={onStreakPlus}
          className="rounded-[8px] border border-[#0F1E3A]/30 bg-[#F6F3EA] px-2 py-1 hover:bg-[#EAE3D2]"
        >
          Seriya +1
        </button>
        <button
          type="button"
          onClick={onStreakBreak}
          className="rounded-[8px] border border-[#0F1E3A]/30 bg-[#F6F3EA] px-2 py-1 hover:bg-[#EAE3D2]"
        >
          Seriya 0
        </button>
        <button
          type="button"
          onClick={onCorrect}
          className="rounded-[8px] border border-[#0E7C70] bg-[#19B7A6]/20 px-2 py-1 text-[#0F1E3A]"
        >
          Toʻgʻri
        </button>
        <button
          type="button"
          onClick={onWrong}
          className="rounded-[8px] border border-[#A63616] bg-[#E4572E]/20 px-2 py-1 text-[#0F1E3A]"
        >
          Xato
        </button>
        <button
          type="button"
          onClick={onQuizComplete}
          className="rounded-[8px] border border-[#0F4C81]/40 bg-[#EAF2FF] px-2 py-1 text-[#0F1E3A]"
        >
          Quiz done
        </button>
        <button
          type="button"
          onClick={onUnlockNext}
          className="rounded-[8px] border border-[#0F4C81]/40 bg-[#EAF2FF] px-2 py-1 text-[#0F1E3A]"
        >
          Unlock
        </button>
        <button
          type="button"
          onClick={cycleTier}
          className="rounded-[8px] border border-[#0F1E3A]/30 bg-[#F6F3EA] px-2 py-1"
        >
          Tier: {telemetry.tierOverride} ({telemetry.tier})
        </button>
        <button
          type="button"
          onClick={onToggleSurface}
          className="rounded-[8px] border border-[#0F1E3A]/30 bg-[#F6F3EA] px-2 py-1"
        >
          Mode: {surfaceMode}
        </button>
        <button
          type="button"
          onClick={() => motionCore.setSlowMo(!telemetry.slowMo)}
          className={`rounded-[8px] border px-2 py-1 ${
            telemetry.slowMo
              ? 'border-[#0F4C81] bg-[#0F4C81] text-white'
              : 'border-[#0F1E3A]/30 bg-[#F6F3EA]'
          }`}
        >
          Slow-mo ×0.25: {telemetry.slowMo ? 'ON' : 'OFF'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-[8px] border border-[#0F1E3A]/30 bg-[#EAE3D2] px-2 py-1"
        >
          Reset
        </button>
      </div>
    </aside>
  );
}
