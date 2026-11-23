'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOTION_TOKENS } from '@/lib/motion/tokens';

interface PreloaderIntroProps {
  visible: boolean;
  title: string;
  subtitle: string;
  skipLabel: string;
  onSkip: () => void;
  reducedMotion: boolean;
}

export function PreloaderIntro({
  visible,
  title,
  subtitle,
  skipLabel,
  onSkip,
  reducedMotion,
}: PreloaderIntroProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(onSkip, reducedMotion ? 400 : 2200);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        onSkip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [visible, onSkip, reducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: MOTION_TOKENS.duration.medium, ease: MOTION_TOKENS.ease.smooth }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0E1A2B] text-[#F4F6FA] px-6"
        >
          <div className="max-w-md w-full flex flex-col items-center text-center gap-6">
            {/* Animated geometric Samarkand astrolabe emblem */}
            <svg viewBox="0 0 120 120" className="w-24 h-24" aria-hidden="true">
              <motion.circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                initial={reducedMotion ? undefined : { pathLength: 0, opacity: 0.3 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, ease: MOTION_TOKENS.ease.snap }}
              />
              <motion.polygon
                points="60,16 104,60 60,104 16,60"
                fill="none"
                stroke="#60A5FA"
                strokeWidth="2"
                initial={reducedMotion ? undefined : { pathLength: 0, rotate: -20 }}
                animate={{ pathLength: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: MOTION_TOKENS.ease.snap }}
              />
              <circle cx="60" cy="60" r="8" fill="#F59E0B" />
            </svg>

            <div className="space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {title}
              </h2>
              <p className="text-sm sm:text-base text-[#B8C4D6]">{subtitle}</p>
            </div>

            <button
              type="button"
              onClick={onSkip}
              className="mt-2 px-5 py-2.5 min-h-[44px] rounded-xl border border-[#243957] bg-[#17273E] text-sm font-medium text-[#F4F6FA] hover:bg-[#223859] transition-colors cursor-pointer"
            >
              {skipLabel}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
