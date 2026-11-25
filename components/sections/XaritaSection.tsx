/**
 * A16 Xarita ("Play" / Blueprint surface) section:
 * - Route Samarqand (0 XP) -> Buxoro (60 XP) -> Toshkent (120 XP)
 * - Uses build-time Rough.js trail path (ROUGH_PATHS.xaritaTrail) revealed by CSS scroll-timeline / DrawSVG
 * - Miniature Mirzo token travels along trail via GSAP MotionPathPlugin to active unlocked milestone
 * - Unlocked cards pop in (--spring-pop); locked cards are engraved (inset shadow, monochrome)
 */
'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  MechLockIcon,
  PhMap,
  PhPlay,
  PinStarIcon,
  WorkshopTokenIcon,
} from '@/components/icons/WorkshopIcons';
import { MAP_NODES } from '@/lib/data/workshop';
import { WORKSHOP_STRINGS } from '@/lib/engine/i18n';
import type { WorkshopId } from '@/lib/engine/store';
import type { QualityTier } from '@/lib/motion/core';
import { ROUGH_PATHS } from '@/lib/motion/roughPaths';

interface XaritaSectionProps {
  xp: number;
  tier: QualityTier;
  motionPaused: boolean;
  unlockedWorkshops: WorkshopId[];
  onOpenWorkshop: (id: WorkshopId, e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function XaritaSection({
  xp,
  tier,
  motionPaused,
  unlockedWorkshops,
  onOpenWorkshop,
}: XaritaSectionProps) {
  const trailRef = useRef<SVGPathElement | null>(null);
  const mirzoMarkerRef = useRef<SVGGElement | null>(null);
  const t = WORKSHOP_STRINGS.reviewStrings;
  const clampedRatio = Math.min(1, Math.max(0, xp / 120));
  const liteMode = tier === 'lite';

  // Fallback marker coordinates for reduced-motion / lite mode
  const staticX = clampedRatio >= 1 ? 710 : clampedRatio >= 0.5 ? 400 : 90;
  const staticY = clampedRatio >= 1 ? 42 : clampedRatio >= 0.5 ? 48 : 52;

  // A16 Move miniature Mirzo token along Rough.js trail via GSAP MotionPathPlugin
  useEffect(() => {
    const pathEl = trailRef.current;
    const markerEl = mirzoMarkerRef.current;
    if (!pathEl || !markerEl || liteMode || motionPaused) return;
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) return;

    let cancelled = false;
    void (async () => {
      try {
        const [{ default: gsap }, { MotionPathPlugin }] = await Promise.all([
          import('gsap'),
          import('gsap/MotionPathPlugin'),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(MotionPathPlugin);
        const endPos = Math.max(0.02, clampedRatio);
        gsap.to(markerEl, {
          duration: 0.72,
          ease: 'power2.out',
          motionPath: {
            path: pathEl,
            align: pathEl,
            alignOrigin: [0.5, 0.5],
            start: 0,
            end: endPos,
          },
        });
      } catch {
        // Static marker transform remains accurate
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clampedRatio, liteMode, motionPaused]);

  return (
    <section
      id="xarita"
      data-surface="blueprint"
      className="ws-surface ws-blueprint-grid ws-girih-bg scroll-mt-20 border-t-2 border-[var(--line-strong)] py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[14px] font-bold text-[var(--reward-ink)]">
              <PhMap size={18} weight="bold" />
              <span>{t.surfaceBlueprint}</span>
            </div>
            <h2 className="ws-h2 font-extrabold tracking-tight text-[var(--on-surface)]">
              {t.mapTitle}
            </h2>
            <p className="ws-body text-[var(--on-surface-muted)]">{t.mapSubtitle}</p>
          </div>

          <div className="inline-flex items-center gap-2.5 rounded-[14px] border-2 border-[var(--line-strong)] bg-[#07264B] px-4 py-2.5 text-[#EAF2FF] shadow-[var(--sh-inset)]">
            <PinStarIcon size={26} />
            <span className="ws-tabular text-[16px] font-extrabold">{xp} XP</span>
          </div>
        </div>

        {/* A16 Rough.js trail + miniature Mirzo token */}
        <div className="mb-6 hidden md:block">
          <svg viewBox="0 0 800 96" className="h-24 w-full overflow-visible" aria-hidden="true">
            <path
              d={ROUGH_PATHS.xaritaTrail}
              fill="none"
              stroke="rgba(234,242,255,0.24)"
              strokeWidth="6"
              strokeDasharray="10 8"
              strokeLinecap="round"
            />
            <path
              ref={trailRef}
              d={ROUGH_PATHS.xaritaTrail}
              fill="none"
              stroke="#19B7A6"
              strokeWidth="5.5"
              strokeLinecap="round"
              className={!liteMode && !motionPaused ? 'ws-scroll-trail' : undefined}
              style={
                liteMode || motionPaused
                  ? undefined
                  : { opacity: Math.max(0.45, clampedRatio + 0.35) }
              }
            />

            {[
              { x: 90, y: 52, unlocked: true },
              { x: 400, y: 48, unlocked: xp >= 60 },
              { x: 710, y: 42, unlocked: xp >= 120 },
            ].map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="13"
                  fill={pt.unlocked ? '#19B7A6' : '#07264B'}
                  stroke={pt.unlocked ? '#EAF2FF' : '#B6CCE8'}
                  strokeWidth="2.5"
                />
                {pt.unlocked ? <circle cx={pt.x} cy={pt.y} r="5" fill="#F5A800" /> : null}
              </g>
            ))}

            {/* Miniature Mirzo duppi badge traveling along the Rough.js path */}
            <g
              ref={mirzoMarkerRef}
              transform={liteMode || motionPaused ? `translate(${staticX} ${staticY})` : undefined}
            >
              <circle cx="0" cy="0" r="15" fill="#F5A800" stroke="#0F1E3A" strokeWidth="2.4" />
              <path
                d="M-7 1 L-4 -6 L4 -6 L7 1 Z"
                fill="#0F1E3A"
                stroke="#EAF2FF"
                strokeWidth="1.2"
              />
              <circle cx="0" cy="4" r="3.5" fill="#FAD1A8" stroke="#0F1E3A" strokeWidth="1.2" />
            </g>
          </svg>
        </div>

        {/* 3 Milestone city nodes */}
        <div className="grid gap-4 md:grid-cols-3">
          {MAP_NODES.map((node, idx) => {
            const unlocked =
              xp >= node.xpUnlock || unlockedWorkshops.includes(node.workshopId);
            const remaining = Math.max(0, node.xpUnlock - xp);
            const isNewestUnlocked =
              unlocked &&
              (idx === MAP_NODES.length - 1 ||
                !(
                  xp >= MAP_NODES[idx + 1].xpUnlock ||
                  unlockedWorkshops.includes(MAP_NODES[idx + 1].workshopId)
                ));

            return (
              <motion.article
                key={node.id}
                initial={false}
                animate={
                  unlocked && !liteMode && !motionPaused
                    ? { scale: 1, opacity: 1 }
                    : { scale: 1, opacity: unlocked ? 1 : 0.88 }
                }
                transition={{ type: 'spring', stiffness: 460, damping: 24 }}
                className={`ws-blueprint-panel flex flex-col justify-between gap-4 p-5 transition-colors ${
                  unlocked
                    ? `border-[var(--ok)] bg-[#11437D] shadow-[var(--sh-3)] ${
                        isNewestUnlocked && !liteMode && !motionPaused ? 'ws-cta-pulse-once' : ''
                      }`
                    : 'border-[var(--line)] bg-[#07264B]/90 shadow-[var(--sh-inset)]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1 text-[13px] font-bold ${
                        unlocked
                          ? 'border-[var(--ok)] bg-[#19B7A6]/20 text-[#EAF2FF]'
                          : 'border-[var(--line)] bg-[#0B3566] text-[#B6CCE8]'
                      }`}
                    >
                      {unlocked ? (
                        <WorkshopTokenIcon unlocked size={17} />
                      ) : (
                        <MechLockIcon unlocked={false} size={16} />
                      )}
                      <span>{unlocked ? t.mapUnlockedLabel : t.mapLockedLabel}</span>
                    </span>
                    <span className="ws-tabular text-[14px] font-extrabold text-[var(--reward-ink)]">
                      {node.xpUnlock} XP
                    </span>
                  </div>

                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-[#EAF2FF]">
                      {node.city}
                    </h3>
                    <p className="mt-1 text-[15px] text-[#B6CCE8]">{node.skillLabel}</p>
                  </div>
                </div>

                {unlocked ? (
                  <button
                    type="button"
                    onClick={(e) => onOpenWorkshop(node.workshopId, e)}
                    className="ws-key-btn ws-key-btn--primary min-h-[46px] w-full"
                  >
                    <span>{WORKSHOP_STRINGS.nav.games}</span>
                    <PhPlay size={14} weight="fill" className="ws-key-icon" />
                  </button>
                ) : (
                  <div className="rounded-[12px] border border-[var(--line)] bg-[#0B3566]/80 px-3.5 py-2.5 text-[14px] font-semibold text-[#B6CCE8]">
                    Yana{' '}
                    <strong className="ws-tabular text-[var(--reward-ink)]">
                      {remaining} XP
                    </strong>{' '}
                    toʻplangach ochiladi
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
