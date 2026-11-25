/**
 * Xarita ("Play" / Blueprint surface) section:
 * - Route Samarqand (0 XP) -> Buxoro (60 XP) -> Toshkent (120 XP)
 * - SVG trail with stroke-dashoffset progress and Mirzo miniature marker
 * - Engraved locked cards vs glowing turquoise unlocked milestone cards
 */
'use client';

import React from 'react';
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

interface XaritaSectionProps {
  xp: number;
  unlockedWorkshops: WorkshopId[];
  onOpenWorkshop: (id: WorkshopId, e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function XaritaSection({
  xp,
  unlockedWorkshops,
  onOpenWorkshop,
}: XaritaSectionProps) {
  const t = WORKSHOP_STRINGS.reviewStrings;
  const clampedRatio = Math.min(1, Math.max(0, xp / 120));
  const pathLength = 520;

  return (
    <section
      id="xarita"
      data-surface="blueprint"
      className="ws-surface ws-blueprint-grid ws-girih-bg scroll-mt-20 border-t-2 border-[var(--line-strong)] py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[14px] font-bold text-[#F5A800]">
              <PhMap size={18} weight="bold" />
              <span>{t.surfaceBlueprint}</span>
            </div>
            <h2 className="ws-h2 font-extrabold tracking-tight text-[#EAF2FF]">
              {t.mapTitle}
            </h2>
            <p className="ws-body text-[#B6CCE8]">{t.mapSubtitle}</p>
          </div>

          <div className="inline-flex items-center gap-2.5 rounded-[14px] border-2 border-[var(--line-strong)] bg-[#07264B] px-4 py-2.5 text-[#EAF2FF] shadow-[var(--sh-inset)]">
            <PinStarIcon size={26} />
            <span className="ws-tabular text-[16px] font-extrabold">{xp} XP</span>
          </div>
        </div>

        {/* SVG Trail connecting Samarqand -> Buxoro -> Toshkent */}
        <div className="mb-6 hidden md:block">
          <svg
            viewBox="0 0 800 92"
            className="h-24 w-full overflow-visible"
            aria-hidden="true"
          >
            <path
              d="M 90 52 C 230 16, 310 82, 400 48 C 490 14, 580 76, 710 42"
              fill="none"
              stroke="rgba(234,242,255,0.22)"
              strokeWidth="6"
              strokeDasharray="10 8"
              strokeLinecap="round"
            />
            <path
              d="M 90 52 C 230 16, 310 82, 400 48 C 490 14, 580 76, 710 42"
              fill="none"
              stroke="#19B7A6"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength * (1 - clampedRatio)}
              style={{ transition: 'stroke-dashoffset 450ms ease-out' }}
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
                {pt.unlocked ? (
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#F5A800" />
                ) : null}
              </g>
            ))}
          </svg>
        </div>

        {/* 3 Milestone city nodes */}
        <div className="grid gap-4 md:grid-cols-3">
          {MAP_NODES.map((node) => {
            const unlocked =
              xp >= node.xpUnlock || unlockedWorkshops.includes(node.workshopId);
            const remaining = Math.max(0, node.xpUnlock - xp);
            return (
              <article
                key={node.id}
                className={`ws-blueprint-panel flex flex-col justify-between gap-4 p-5 transition-colors ${
                  unlocked
                    ? 'border-[#19B7A6] bg-[#11437D] shadow-[var(--sh-3)]'
                    : 'border-[var(--line)] bg-[#07264B]/90 shadow-[var(--sh-inset)]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1 text-[13px] font-bold ${
                        unlocked
                          ? 'border-[#19B7A6] bg-[#19B7A6]/20 text-[#EAF2FF]'
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
                    <span className="ws-tabular text-[14px] font-extrabold text-[#F5A800]">
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
                    <PhPlay size={14} weight="fill" />
                  </button>
                ) : (
                  <div className="rounded-[12px] border border-[var(--line)] bg-[#0B3566]/80 px-3.5 py-2.5 text-[14px] font-semibold text-[#B6CCE8]">
                    Yana <strong className="ws-tabular text-[#F5A800]">{remaining} XP</strong> toʻplangach ochiladi
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
