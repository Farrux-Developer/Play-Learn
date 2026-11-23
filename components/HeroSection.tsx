'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Captions, ArrowRight, Sparkles } from 'lucide-react';
import type { LocaleScript, UiDictionary } from '@/lib/engine/i18n';
import type { MascotFsmSnapshot } from '@/lib/engine/mascot-fsm';
import type { QualityTier } from '@/lib/engine/mastery';
import { MOTION_TOKENS, QUALITY_PRESETS } from '@/lib/motion/tokens';
import { MascotMirzo } from './MascotMirzo';

interface HeroSectionProps {
  t: UiDictionary;
  script: LocaleScript;
  xp: number;
  levelInfo: { level: number; currentLevelXp: number; nextLevelXp: number; percent: number };
  streak: number;
  hasProgress: boolean;
  mascot: MascotFsmSnapshot;
  soundEnabled: boolean;
  subtitlesEnabled: boolean;
  reducedMotion: boolean;
  qualityTier: QualityTier;
  onTapMascot: () => void;
  onStartLesson: () => void;
  onOpenDiagnostic: () => void;
  onToggleSound: () => void;
  onToggleSubtitles: () => void;
}

export function HeroSection({
  t,
  script,
  xp,
  levelInfo,
  streak,
  hasProgress,
  mascot,
  soundEnabled,
  subtitlesEnabled,
  reducedMotion,
  qualityTier,
  onTapMascot,
  onStartLesson,
  onOpenDiagnostic,
  onToggleSound,
  onToggleSubtitles,
}: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preset = QUALITY_PRESETS[qualityTier];
    if (reducedMotion || preset.canvasGridDensity === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = 0;
    let height = 0;

    const count = Math.round(18 * preset.canvasGridDensity);
    const nodes = Array.from({ length: count }, (_, idx) => ({
      x: ((idx * 197) % 100) / 100,
      y: ((idx * 313) % 100) / 100,
      vx: ((idx % 2 === 0 ? 1 : -1) * (0.00018 + (idx % 5) * 0.00004)),
      vy: ((idx % 3 === 0 ? 1 : -1) * (0.00014 + (idx % 4) * 0.00003)),
      r: 2 + (idx % 3),
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let lastTime = performance.now();
    const minInterval = 1000 / preset.targetFps;

    const draw = (now: number) => {
      if (document.hidden) {
        rafId = window.requestAnimationFrame(draw);
        return;
      }
      if (now - lastTime < minInterval) {
        rafId = window.requestAnimationFrame(draw);
        return;
      }
      lastTime = now;

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(15, 76, 129, 0.11)';
      ctx.fillStyle = 'rgba(154, 91, 0, 0.25)';

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;

        const px = n.x * width;
        const py = n.y * height;

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = px - m.x * width;
          const dy = py - m.y * height;
          if (dx * dx + dy * dy < 22000) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(m.x * width, m.y * height);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(px, py, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);
    return () => {
      ro.disconnect();
      window.cancelAnimationFrame(rafId);
    };
  }, [qualityTier, reducedMotion]);

  const headlineWords = t.heroTitle.split(' ');

  const hud =
    script === 'uz-Cyrl'
      ? {
          statusLabel: 'Устахона ҳолати',
          levelSuffix: '-даража',
          streakLabel: 'Серия',
          streakSuffix: 'та кетма-кет',
          nextLevel: 'Кейинги даражагача',
          progressAria: 'Даража прогресси',
        }
      : {
          statusLabel: 'Ustaxona holati',
          levelSuffix: '-daraja',
          streakLabel: 'Seriya',
          streakSuffix: 'ta ketma-ket',
          nextLevel: 'Keyingi darajagacha',
          progressAria: 'Daraja progressi',
        };

  return (
    <section
      id="bosh-sahifa"
      className="relative overflow-hidden registon-grid-bg border-b border-[#D5CEC0]"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <p className="text-xs sm:text-sm font-medium text-[#43536B] tracking-normal">
            {t.heroEyebrow}
          </p>

          <h1
            aria-label={t.heroTitle}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#122033] leading-[1.14]"
          >
            {headlineWords.map((word, index) => (
              <React.Fragment key={`${word}-${index}`}>
                <motion.span
                  className="inline-block mr-[0.22em]"
                  initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: MOTION_TOKENS.duration.medium,
                    delay: reducedMotion ? 0 : index * 0.04,
                    ease: MOTION_TOKENS.ease.snap,
                  }}
                >
                  {word}
                </motion.span>
                {index < headlineWords.length - 1 ? ' ' : ''}
              </React.Fragment>
            ))}
          </h1>

          <p className="text-base sm:text-lg text-[#43536B] max-w-2xl leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              type="button"
              onClick={onStartLesson}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 min-h-[48px] rounded-xl bg-[#0F4C81] hover:bg-[#0B3A63] text-white font-semibold text-base shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
            >
              <span>{hasProgress ? t.heroContinueCta : t.heroPrimaryCta}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onOpenDiagnostic}
              className="inline-flex items-center gap-2 px-5 py-3.5 min-h-[48px] rounded-xl bg-white border border-[#D5CEC0] hover:border-[#0F4C81] text-[#122033] font-semibold text-sm sm:text-base transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#9A5B00]" aria-hidden="true" />
              <span>{t.heroDiagnosticCta}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#5C6B80]">{t.heroFirstWinNote}</p>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-white border border-[#D5CEC0] p-6 shadow-[var(--shadow-card)] space-y-5">
            <div className="flex items-center justify-between gap-3 border-b border-[#EAE5DA] pb-4">
              <div>
                <p className="text-xs text-[#5C6B80]">{hud.statusLabel}</p>
                <p className="font-display text-lg font-bold text-[#122033] tabular-nums">
                  {levelInfo.level}
                  {hud.levelSuffix} · {xp} XP
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#5C6B80]">{hud.streakLabel}</p>
                <p className="font-display text-lg font-bold text-[#9A5B00] tabular-nums">
                  {streak} {hud.streakSuffix}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#5C6B80] tabular-nums">
                <span>{hud.nextLevel}</span>
                <span>
                  {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={levelInfo.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={hud.progressAria}
                className="h-2.5 w-full rounded-full bg-[#EAE5DA] overflow-hidden"
              >
                <div
                  className="h-full bg-[#0F4C81] transition-all duration-300"
                  style={{ width: `${levelInfo.percent}%` }}
                />
              </div>
            </div>

            <div className="py-2 flex justify-center">
              <MascotMirzo
                state={mascot.currentState}
                subtitle={mascot.subtitle}
                showSubtitle={subtitlesEnabled}
                onTap={onTapMascot}
                reducedMotion={reducedMotion}
                size="lg"
              />
            </div>

            <div className="flex items-center justify-center gap-3 pt-1 border-t border-[#EAE5DA]">
              <button
                type="button"
                onClick={onToggleSound}
                aria-pressed={soundEnabled}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium bg-[#F6F4EE] hover:bg-[#EAE5DA] text-[#122033] transition-colors cursor-pointer"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#0F4C81]" aria-hidden="true" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#5C6B80]" aria-hidden="true" />
                )}
                <span>{soundEnabled ? t.soundOn : t.soundOff}</span>
              </button>

              <button
                type="button"
                onClick={onToggleSubtitles}
                aria-pressed={subtitlesEnabled}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium bg-[#F6F4EE] hover:bg-[#EAE5DA] text-[#122033] transition-colors cursor-pointer"
              >
                <Captions className="w-4 h-4 text-[#0F4C81]" aria-hidden="true" />
                <span>{subtitlesEnabled ? t.subtitlesOn : t.subtitlesOff}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
