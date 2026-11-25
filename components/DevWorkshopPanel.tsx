/**
 * Development-only verification panel (tree-shaken out in production builds).
 * Lets the developer test XP bursts, level ups, streak sparks, correct/error cues,
 * lite mode, and reset without playing through lessons.
 */
'use client';

import React, { useState } from 'react';

interface DevWorkshopPanelProps {
  xp: number;
  streak: number;
  liteMode: boolean;
  onAddXp: (delta: number) => void;
  onLevelUp: () => void;
  onStreakPlus: () => void;
  onCorrect: () => void;
  onWrong: () => void;
  onToggleLite: () => void;
  onReset: () => void;
}

export function DevWorkshopPanel({
  xp,
  streak,
  liteMode,
  onAddXp,
  onLevelUp,
  onStreakPlus,
  onCorrect,
  onWrong,
  onToggleLite,
  onReset,
}: DevWorkshopPanelProps) {
  const [open, setOpen] = useState(false);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open dev animation harness"
        className="fixed bottom-3 right-3 z-50 min-h-[44px] rounded-[12px] border-2 border-[#0F1E3A] bg-[#FFFDF7] px-3 py-1.5 text-[13px] font-extrabold text-[#0F1E3A] shadow-[0_6px_14px_-4px_rgba(15,30,58,0.22)]"
      >
        DEV ({xp} XP)
      </button>
    );
  }

  return (
    <aside
      aria-label="Dev animation harness"
      className="fixed bottom-3 right-3 z-50 max-w-xs rounded-[14px] border-2 border-[#0F1E3A] bg-[#FFFDF7] p-3 text-[#0F1E3A] shadow-[0_12px_24px_-8px_rgba(15,30,58,0.22)] sm:max-w-sm"
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-[14px] font-bold">
        <span>DEV PANEL</span>
        <span className="ws-tabular text-[#0F4C81]">
          {xp} XP / {streak} seriya
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
      <div className="flex flex-wrap gap-1.5 text-[14px] font-semibold">
        <button
          type="button"
          onClick={() => onAddXp(10)}
          className="rounded-[8px] border border-[#0F1E3A]/30 bg-[#F6F3EA] px-2.5 py-1 hover:bg-[#EAE3D2]"
        >
          +10 XP
        </button>
        <button
          type="button"
          onClick={onLevelUp}
          className="rounded-[8px] border border-[#B87900] bg-[#F5A800] px-2.5 py-1 text-[#0F1E3A]"
        >
          Level up
        </button>
        <button
          type="button"
          onClick={onStreakPlus}
          className="rounded-[8px] border border-[#0F1E3A]/30 bg-[#F6F3EA] px-2.5 py-1 hover:bg-[#EAE3D2]"
        >
          Seriya +1
        </button>
        <button
          type="button"
          onClick={onCorrect}
          className="rounded-[8px] border border-[#0E7C70] bg-[#19B7A6]/20 px-2.5 py-1 text-[#0F1E3A]"
        >
          Toʻgʻri
        </button>
        <button
          type="button"
          onClick={onWrong}
          className="rounded-[8px] border border-[#A63616] bg-[#E4572E]/20 px-2.5 py-1 text-[#0F1E3A]"
        >
          Xato
        </button>
        <button
          type="button"
          onClick={onToggleLite}
          className="rounded-[8px] border border-[#0F1E3A]/30 bg-[#F6F3EA] px-2.5 py-1"
        >
          Lite: {liteMode ? 'ON' : 'OFF'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-[8px] border border-[#0F1E3A]/30 bg-[#EAE3D2] px-2.5 py-1"
        >
          Reset
        </button>
      </div>
    </aside>
  );
}
