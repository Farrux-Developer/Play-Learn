'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { MascotState } from '@/lib/engine/mascot-fsm';
import { MOTION_TOKENS } from '@/lib/motion/tokens';

interface MascotMirzoProps {
  state: MascotState;
  subtitle?: string;
  showSubtitle?: boolean;
  onTap?: () => void;
  reducedMotion?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const STATE_LABELS: Record<MascotState, string> = {
  idle: 'Tayyor',
  speaking: 'Gapirmoqda',
  thinking: 'Oʻylamoqda',
  happy: 'Xursand',
  encouraging: 'Qoʻllab-quvvatlamoqda',
  celebrating: 'Bayram qilmoqda',
  sleeping: 'Dam olmoqda',
  streak: 'Ajoyib seriya!',
};

export function MascotMirzo({
  state,
  subtitle,
  showSubtitle = true,
  onTap,
  reducedMotion = false,
  size = 'md',
}: MascotMirzoProps) {
  const dimensions =
    size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-40 h-40' : 'w-28 h-28';

  const bodyAnimate = reducedMotion
    ? {}
    : state === 'celebrating'
    ? { y: [0, -14, 0, -8, 0], scale: [1, 1.05, 1] }
    : state === 'happy' || state === 'streak'
    ? { y: [0, -7, 0], rotate: [0, -2, 2, 0] }
    : state === 'thinking'
    ? { rotate: [-2, 2, -2] }
    : state === 'encouraging'
    ? { x: [0, -3, 3, 0] }
    : state === 'sleeping'
    ? { y: [0, 2, 0], opacity: 0.88 }
    : { y: [0, -4, 0] };

  const bodyTransition =
    state === 'celebrating'
      ? { duration: 0.7, ease: MOTION_TOKENS.ease.elastic }
      : {
          duration: state === 'idle' || state === 'sleeping' ? 3.2 : 0.9,
          repeat: state === 'idle' || state === 'sleeping' || state === 'thinking' ? Infinity : 0,
          ease: MOTION_TOKENS.ease.smooth,
        };

  const isSmiling =
    state === 'happy' || state === 'celebrating' || state === 'streak' || state === 'speaking';

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        type="button"
        onClick={onTap}
        aria-label={`Mirzo — ${STATE_LABELS[state]}. Bosish orqali maslahat olish`}
        className={`relative flex items-center justify-center rounded-2xl bg-[#EAE5DA]/80 border border-[#D5CEC0] px-2 pt-2 pb-0 overflow-hidden cursor-pointer transition-colors hover:border-[#0F4C81] focus-visible:outline-none ${dimensions}`}
        whileTap={reducedMotion ? undefined : { scale: 0.94 }}
      >
        <motion.svg
          viewBox="0 0 140 136"
          className="w-full h-full overflow-visible"
          animate={bodyAnimate}
          transition={bodyTransition}
          aria-hidden="true"
        >
          {/* Subtle brass astrolabe halo behind Mirzo on streak or celebration */}
          {(state === 'celebrating' || state === 'streak') && (
            <circle
              cx="70"
              cy="70"
              r="58"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeDasharray="6 6"
            />
          )}

          {/* Robe / Kamzol in Samarkand Cobalt */}
          <path
            d="M32 138 C32 102, 108 102, 108 138 Z"
            fill="#0F4C81"
          />
          {/* Collar */}
          <path d="M55 104 L70 120 L85 104 Z" fill="#FFFFFF" />
          {/* Brass compass pin on chest */}
          <circle cx="88" cy="116" r="5" fill="#F59E0B" stroke="#0E1A2B" strokeWidth="1.5" />

          {/* Head */}
          <circle cx="70" cy="68" r="34" fill="#FCD9B6" stroke="#122033" strokeWidth="2.5" />

          {/* Hair */}
          <path
            d="M36 62 C36 38, 104 38, 104 62 C94 50, 46 50, 36 62 Z"
            fill="#1E293B"
          />

          {/* Traditional Uzbek Do'ppi (Tubeteika) */}
          <path
            d="M42 46 L48 24 Q70 18 92 24 L98 46 Z"
            fill="#0E1A2B"
            stroke="#0F4C81"
            strokeWidth="2"
          />
          {/* Ceramic white geometric embroidery on do'ppi */}
          <path
            d="M54 37 L60 31 L66 37 M74 37 L80 31 L86 37"
            fill="none"
            stroke="#F4F6FA"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Eyes */}
          {state === 'sleeping' ? (
            <>
              <path d="M52 67 Q57 71 62 67" stroke="#122033" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M78 67 Q83 71 88 67" stroke="#122033" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="57" cy="66" r="4.2" fill="#122033" />
              <circle cx="83" cy="66" r="4.2" fill="#122033" />
              <circle cx="58.5" cy="64.5" r="1.4" fill="#FFFFFF" />
              <circle cx="84.5" cy="64.5" r="1.4" fill="#FFFFFF" />
            </>
          )}

          {/* Eyebrows reflecting thinking/encouraging */}
          {state === 'thinking' && (
            <>
              <line x1="51" y1="57" x2="62" y2="55" stroke="#122033" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="78" y1="53" x2="89" y2="56" stroke="#122033" strokeWidth="2.2" strokeLinecap="round" />
            </>
          )}

          {/* Mouth */}
          {isSmiling ? (
            <path
              d="M58 80 Q70 91 82 80"
              fill="none"
              stroke="#122033"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          ) : state === 'thinking' ? (
            <line
              x1="64"
              y1="82"
              x2="76"
              y2="82"
              stroke="#122033"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M61 81 Q70 86 79 81"
              fill="none"
              stroke="#122033"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          )}

          {/* Spark stars on celebration */}
          {state === 'celebrating' && (
            <>
              <path d="M20 34 L23 26 L26 34 L34 37 L26 40 L23 48 L20 40 L12 37 Z" fill="#F59E0B" />
              <path d="M116 26 L118 20 L120 26 L126 28 L120 30 L118 36 L116 30 L110 28 Z" fill="#0F4C81" />
            </>
          )}
        </motion.svg>
      </motion.button>

      {showSubtitle && subtitle && (
        <div
          role="status"
          aria-live="polite"
          className="max-w-sm rounded-xl bg-white border border-[#D5CEC0] px-4 py-2.5 text-sm text-[#122033] text-center shadow-sm"
        >
          <span className="font-semibold text-[#0F4C81]">Mirzo: </span>
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
