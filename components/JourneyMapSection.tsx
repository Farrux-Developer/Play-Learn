'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Lock, CheckCircle2, Play, Clock } from 'lucide-react';
import { SKILL_NODES, type SkillId } from '@/lib/data/curriculum';
import {
  getSkillStages,
  isSkillUnlocked,
  MASTERY_THRESHOLD,
  type ProgressState,
} from '@/lib/engine/mastery';
import { pickText, type UiDictionary } from '@/lib/engine/i18n';

interface JourneyMapSectionProps {
  t: UiDictionary;
  progress: ProgressState;
  activeSkill: SkillId;
  enable3DTilt: boolean;
  reducedMotion: boolean;
  onSelectSkill: (skillId: SkillId) => void;
}

export function JourneyMapSection({
  t,
  progress,
  activeSkill,
  enable3DTilt,
  reducedMotion,
  onSelectSkill,
}: JourneyMapSectionProps) {
  const script = progress.preferences.script;
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.8', 'end 0.4'],
  });
  const pathLength = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [1, 1] : [0.15, 1]
  );

  const handleCardMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!enable3DTilt || reducedMotion || e.pointerType !== 'mouse') return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 7;
    const rotateX = (0.5 - y) * 7;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    card.style.setProperty('--mx', `${Math.round(x * 100)}%`);
    card.style.setProperty('--my', `${Math.round(y * 100)}%`);
  };

  const handleCardLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = '';
  };

  const totalMastered = SKILL_NODES.filter(
    (s) =>
      progress.skills[s.id].mastery >= MASTERY_THRESHOLD &&
      getSkillStages(progress, s.id).explained
  ).length;

  const labels =
    script === 'uz-Cyrl'
      ? {
          summary: 'Эгалланган босқичлар:',
          mastered: 'Эгалланди',
          locked: 'Ёпиқ',
          open: 'Очиқ',
          masteryPct: 'Амалий ўзлаштириш',
          seen: 'Кўрилди',
          applied: 'Қўллай оламан',
          explained: 'Тушунтира оламан',
          unlockHint: 'Очиш учун аввалги босқичдан камида 3 та топшириқ еч.',
          reviewDue: 'SM-2 такрорлаш вақти келди',
        }
      : {
          summary: 'Egallangan bosqichlar:',
          mastered: 'Egallandi',
          locked: 'Yopiq',
          open: 'Ochiq',
          masteryPct: 'Amaliy oʻzlashtirish',
          seen: 'Koʻrildi',
          applied: 'Qoʻllay olaman',
          explained: 'Tushuntira olaman',
          unlockHint: 'Ochish uchun avvalgi bosqichdan kamida 3 ta topshiriq yech.',
          reviewDue: 'SM-2 takrorlash vaqti keldi',
        };

  return (
    <section
      id="xarita"
      ref={sectionRef}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#122033]">
            {t.mapTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#43536B]">{t.mapSubtitle}</p>
        </div>
        <p className="text-sm font-semibold text-[#0F4C81] tabular-nums">
          {labels.summary} {totalMastered} / {SKILL_NODES.length}
        </p>
      </div>

      <div className="hidden md:block relative h-20 w-full overflow-visible" aria-hidden="true">
        <svg viewBox="0 0 1000 80" className="w-full h-full">
          <path
            d="M 90 48 Q 300 10, 500 45 T 910 38"
            fill="none"
            stroke="#D5CEC0"
            strokeWidth="4"
            strokeDasharray="8 8"
          />
          <motion.path
            d="M 90 48 Q 300 10, 500 45 T 910 38"
            fill="none"
            stroke="#0F4C81"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ pathLength }}
          />
          <circle cx="90" cy="48" r="8" fill="#0F4C81" />
          <circle cx="500" cy="45" r="8" fill="#9A5B00" />
          <circle cx="910" cy="38" r="8" fill="#047857" />
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SKILL_NODES.map((node) => {
          const unlocked = isSkillUnlocked(progress, node.id);
          const sp = progress.skills[node.id];
          const stages = getSkillStages(progress, node.id);
          const pct = Math.round(sp.mastery * 100);
          const mastered = sp.mastery >= MASTERY_THRESHOLD && stages.explained;
          const isActive = activeSkill === node.id;
          const reviewDue =
            sp.nextReviewAt !== null && progress.sessionStartedAt >= sp.nextReviewAt;

          return (
            <button
              key={node.id}
              type="button"
              onClick={() => unlocked && onSelectSkill(node.id)}
              onPointerMove={handleCardMove}
              onPointerLeave={handleCardLeave}
              disabled={!unlocked}
              aria-current={isActive ? 'step' : undefined}
              className={`group relative text-left rounded-2xl p-6 border transition-all duration-150 ${
                unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
              } ${
                isActive
                  ? 'bg-white border-[#0F4C81] shadow-[var(--shadow-elevated)]'
                  : 'bg-white border-[#D5CEC0] hover:border-[#0F4C81] shadow-[var(--shadow-card)]'
              }`}
              style={{
                backgroundImage:
                  enable3DTilt && unlocked
                    ? 'radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(15, 76, 129, 0.06), transparent 60%)'
                    : undefined,
              }}
            >
              <div className="flex items-center justify-between gap-2 text-xs text-[#5C6B80]">
                <span>
                  0{node.order}. {pickText(node.cityTag, script)} ·{' '}
                  {pickText(node.bloomLevel, script)}
                </span>
                {mastered ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-[#065F46]">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    {labels.mastered}
                  </span>
                ) : !unlocked ? (
                  <span className="inline-flex items-center gap-1 font-medium text-[#5C6B80]">
                    <Lock className="w-4 h-4" aria-hidden="true" />
                    {labels.locked}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-[#0F4C81]">
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    {labels.open}
                  </span>
                )}
              </div>

              <h3 className="mt-2 font-display text-xl font-bold text-[#122033]">
                {pickText(node.gameTitle, script)}
              </h3>

              <p className="mt-1.5 text-sm text-[#43536B] leading-relaxed">
                {pickText(node.learningObjective, script)}
              </p>

              <p className="mt-3 text-xs text-[#5C6B80]">
                {pickText(node.topicTag, script)}
              </p>

              {/* 3-stage mastery tracker: Koʻrildi -> Qoʻllay olaman -> Tushuntira olaman */}
              <div className="mt-4 grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                <div
                  className={`rounded-lg px-2 py-1.5 text-center border ${
                    stages.seen
                      ? 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0F4C81]'
                      : 'bg-[#F6F4EE] border-[#D5CEC0] text-[#5C6B80]'
                  }`}
                >
                  {labels.seen} {stages.seen ? '✓' : ''}
                </div>
                <div
                  className={`rounded-lg px-2 py-1.5 text-center border ${
                    stages.applied
                      ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                      : 'bg-[#F6F4EE] border-[#D5CEC0] text-[#5C6B80]'
                  }`}
                >
                  {labels.applied} {stages.applied ? '✓' : ''}
                </div>
                <div
                  className={`rounded-lg px-2 py-1.5 text-center border ${
                    stages.explained
                      ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#78350F]'
                      : 'bg-[#F6F4EE] border-[#D5CEC0] text-[#5C6B80]'
                  }`}
                >
                  {labels.explained} {stages.explained ? '✓' : ''}
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-[#122033] tabular-nums">
                  <span>{labels.masteryPct}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#EAE5DA] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      mastered ? 'bg-[#047857]' : 'bg-[#0F4C81]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {!unlocked && node.prerequisite && (
                <p className="mt-3 text-xs text-[#9A5B00] font-medium">
                  {labels.unlockHint}
                </p>
              )}

              {reviewDue && unlocked && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A5B00]">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {labels.reviewDue}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
