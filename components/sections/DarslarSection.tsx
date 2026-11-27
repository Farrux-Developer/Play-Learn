/**
 * Darslar ("Understand" / Paper surface) section:
 * - Architectural blueprint-sheet lesson cards with 2.4s SVG preview loops on hover/focus
 * - Motion layout expansion into Predict-before-Run workbench (+20 XP on first solve)
 * - A18 DrawSVG feedback via ChoiceTile & A20 empty-state Mirzo think pose
 */
'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  DuppiChevronIcon,
  PhCheck,
  PhLessons,
} from '@/components/icons/SectionIcons';
import { PhPlay } from '@/components/icons/WorkshopIcons';
import { MirzoRig } from '@/components/MirzoRig';
import { ChoiceTile } from '@/components/ui/ChoiceTile';
import { WorkshopCard } from '@/components/ui/WorkshopCard';
import { LESSONS, type LessonItem } from '@/lib/data/workshop';
import { WORKSHOP_STRINGS } from '@/lib/engine/i18n';
import type { QualityTier } from '@/lib/motion/core';

interface DarslarSectionProps {
  completedLessons: string[];
  tier: QualityTier;
  motionPaused: boolean;
  onCompleteLesson: (lesson: LessonItem) => void;
  onWrongPrediction: (lesson: LessonItem) => void;
  onGoGames: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function LessonPreviewSvg({
  lessonId,
  activeLoop,
  staticMode,
}: {
  lessonId: string;
  activeLoop: boolean;
  staticMode: boolean;
}) {
  const animate = activeLoop && !staticMode;
  if (lessonId === 'L1') {
    return (
      <svg viewBox="0 0 120 40" className="h-9 w-28 shrink-0" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={8 + i * 38}
            y={10}
            width={28}
            height={20}
            rx={5}
            fill={animate && i === 1 ? '#19B7A6' : i === 0 ? '#0F4C81' : '#EAE3D2'}
            stroke="#0F1E3A"
            strokeWidth="1.8"
            style={{
              animation: animate
                ? `ws-l1-step 2.4s ease-in-out ${i * 0.35}s infinite`
                : undefined,
            }}
          />
        ))}
        <style>{`
          @keyframes ws-l1-step {
            0%, 100% { transform: translateY(0); }
            45% { transform: translateY(-3px); }
          }
        `}</style>
      </svg>
    );
  }
  if (lessonId === 'L2') {
    return (
      <svg viewBox="0 0 120 40" className="h-9 w-28 shrink-0" aria-hidden="true">
        <rect
          x="14"
          y="7"
          width="42"
          height="26"
          rx="6"
          fill="#EAE3D2"
          stroke="#0F1E3A"
          strokeWidth="1.8"
        />
        <text x="35" y="25" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F1E3A">
          {animate ? '15' : '10'}
        </text>
        <rect
          x="68"
          y="7"
          width="38"
          height="26"
          rx="6"
          fill={animate ? '#F5A800' : '#FFFDF7'}
          stroke="#0F1E3A"
          strokeWidth="1.8"
          style={{
            transition: 'fill 260ms ease-out',
            animation: animate ? 'ws-l2-box 2.4s ease-in-out infinite' : undefined,
          }}
        />
        <text x="87" y="25" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0F1E3A">
          ball
        </text>
        <style>{`
          @keyframes ws-l2-box {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.04); }
          }
        `}</style>
      </svg>
    );
  }
  if (lessonId === 'L3') {
    return (
      <svg viewBox="0 0 120 40" className="h-9 w-28 shrink-0" aria-hidden="true">
        <polygon
          points="36,6 56,20 36,34 16,20"
          fill={animate ? '#F5A800' : '#EAE3D2'}
          stroke="#0F1E3A"
          strokeWidth="1.8"
        />
        <path
          d="M56 20H78M78 20L94 11M78 20L94 29"
          stroke="#0F1E3A"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle
          cx="99"
          cy="11"
          r={animate ? 6 : 5}
          fill="#19B7A6"
          stroke="#0F1E3A"
          strokeWidth="1.5"
          style={{ transition: 'r 240ms ease' }}
        />
        <circle cx="99" cy="29" r="5" fill="#EAE3D2" stroke="#0F1E3A" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 40" className="h-9 w-28 shrink-0" aria-hidden="true">
      <circle
        cx="60"
        cy="20"
        r="13"
        fill="none"
        stroke="#0F4C81"
        strokeWidth="3"
        strokeDasharray="58 18"
        style={{
          transformOrigin: '60px 20px',
          animation: animate ? 'ws-l4-loop 2.4s ease-in-out infinite' : undefined,
        }}
      />
      <circle cx="60" cy="20" r="4.5" fill="#19B7A6" stroke="#0F1E3A" strokeWidth="1.6" />
      <style>{`
        @keyframes ws-l4-loop {
          0% { transform: rotate(0deg); }
          70%, 100% { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}

export function DarslarSection({
  completedLessons,
  tier,
  motionPaused,
  onCompleteLesson,
  onWrongPrediction,
  onGoGames,
}: DarslarSectionProps) {
  const [selectedId, setSelectedId] = useState<string>(LESSONS[0]?.id ?? 'L1');
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const liteMode = tier === 'lite';
  const t = WORKSHOP_STRINGS.reviewStrings;

  if (LESSONS.length === 0) {
    return (
      <section
        id="darslar"
        data-surface="paper"
        className="ws-surface scroll-mt-20 border-t-2 border-[var(--line)] py-12"
      >
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 text-center">
          <MirzoRig mood="think" liteMode={liteMode} motionPaused={motionPaused} size={150} />
          <p className="text-[16px] font-semibold text-[var(--on-surface-muted)]">
            {t.emptyTasksText}
          </p>
        </div>
      </section>
    );
  }

  const activeLesson = LESSONS.find((l) => l.id === selectedId) ?? LESSONS[0];
  if (!activeLesson) return null;
  const completedCount = completedLessons.length;
  const pct = completedCount / LESSONS.length;
  const ringR = 20;
  const ringC = 2 * Math.PI * ringR;

  const selectLesson = (lessonId: string) => {
    setSelectedId(lessonId);
    setPickedIndex(null);
    setAnswerState('idle');
  };

  const handlePick = (idx: number) => {
    setPickedIndex(idx);
    if (idx === activeLesson.correctIndex) {
      setAnswerState('correct');
      onCompleteLesson(activeLesson);
    } else {
      setAnswerState('wrong');
      onWrongPrediction(activeLesson);
    }
  };

  return (
    <section
      id="darslar"
      data-surface="paper"
      className="ws-surface scroll-mt-20 border-t-2 border-[var(--line)] py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header + Progress ring */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[14px] font-bold text-[var(--accent)]">
              <PhLessons size={18} weight="bold" />
              <span>{t.surfacePaper}</span>
            </div>
            <h2 className="ws-h2 font-extrabold tracking-tight">{t.lessonsTitle}</h2>
            <p className="ws-body text-[var(--on-surface-muted)]">{t.lessonsSubtitle}</p>
          </div>

          <div className="flex items-center gap-3 rounded-[16px] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] px-4 py-2.5 shadow-[var(--sh-1)]">
            <svg width="50" height="50" viewBox="0 0 50 50" aria-hidden="true">
              <circle cx="25" cy="25" r={ringR} fill="none" stroke="#EAE3D2" strokeWidth="5" />
              <circle
                cx="25"
                cy="25"
                r={ringR}
                fill="none"
                stroke="#19B7A6"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={ringC}
                strokeDashoffset={ringC * (1 - pct)}
                transform="rotate(-90 25 25)"
                style={{ transition: 'stroke-dashoffset 420ms var(--spring-soft)' }}
              />
            </svg>
            <div>
              <p className="ws-tabular text-[18px] font-extrabold leading-tight">
                {completedCount} / {LESSONS.length}
              </p>
              <p className="text-[14px] font-semibold text-[var(--on-surface-muted)]">
                {t.lessonCompletedBadge}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Blueprint-sheet lesson cards + Predict-before-Run bench */}
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {LESSONS.map((lesson) => {
              const isDone = completedLessons.includes(lesson.id);
              const isSelected = lesson.id === activeLesson.id;
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => selectLesson(lesson.id)}
                  onMouseEnter={() => setActivePreviewId(lesson.id)}
                  onMouseLeave={() => setActivePreviewId(null)}
                  onFocus={() => setActivePreviewId(lesson.id)}
                  onBlur={() => setActivePreviewId(null)}
                  aria-pressed={isSelected}
                  className={`relative flex min-h-[80px] w-full cursor-pointer items-center justify-between gap-3 rounded-[16px] border-2 p-4 text-left transition-[transform,border-color,box-shadow] duration-200 ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--surface-raised)] shadow-[var(--sh-3)]'
                      : 'border-[var(--line-strong)] bg-[var(--surface-raised)] shadow-[var(--sh-1)] hover:-translate-y-1 hover:shadow-[var(--sh-2)]'
                  }`}
                >
                  {isSelected ? (
                    <motion.span
                      layoutId="ws-active-lesson-edge"
                      aria-hidden="true"
                      transition={
                        liteMode || motionPaused
                          ? { duration: 0.12 }
                          : { type: 'spring', stiffness: 380, damping: 30 }
                      }
                      className="absolute inset-y-2 left-1 w-1 rounded-full bg-[var(--accent)]"
                    />
                  ) : null}

                  <div className="min-w-0 space-y-1 pl-1.5">
                    <div className="flex items-center gap-2">
                      <span className="ws-tabular rounded-[6px] border border-[var(--line-strong)] bg-[var(--surface-inset)] px-2 py-0.5 text-[13px] font-extrabold">
                        {lesson.id}
                      </span>
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#19B7A6]/16 px-2 py-0.5 text-[13px] font-bold text-[var(--ok-ink)]">
                          <PhCheck size={14} weight="fill" />
                          <span>{t.lessonCompletedBadge}</span>
                        </span>
                      ) : null}
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] text-[17px] font-bold leading-snug">
                      {lesson.title}
                    </h3>
                  </div>

                  <LessonPreviewSvg
                    lessonId={lesson.id}
                    activeLoop={activePreviewId === lesson.id}
                    staticMode={liteMode || motionPaused}
                  />
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeLesson.id}
              initial={liteMode || motionPaused ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={liteMode || motionPaused ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: liteMode || motionPaused ? 0.15 : 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <WorkshopCard
                surface="paper"
                state={
                  answerState === 'correct'
                    ? 'success'
                    : answerState === 'wrong'
                      ? 'error'
                      : 'default'
                }
                className="flex h-full flex-col justify-between gap-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-[14px] font-bold text-[var(--accent)]">
                      <DuppiChevronIcon size={18} />
                      <span>{activeLesson.id}</span>
                    </span>
                    <span className="ws-tabular rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface-inset)] px-2.5 py-0.5 text-[13px] font-bold">
                      +20 XP
                    </span>
                  </div>

                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
                      {activeLesson.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] text-[var(--on-surface-muted)]">
                      {activeLesson.summary}
                    </p>
                  </div>

                  <div className="rounded-[14px] border-2 border-[#0F1E3A] bg-[#07264B] p-4 text-[#EAF2FF]">
                    <pre className="overflow-x-auto text-[15px] leading-relaxed text-[#EAF2FF]">
                      <code>{activeLesson.code}</code>
                    </pre>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-[15px] font-extrabold text-[var(--on-surface)]">
                      <span className="mr-1.5 text-[var(--accent)]">{t.predictPromptLabel}</span>
                      {activeLesson.predictQuestion}
                    </p>

                    <div className="space-y-2">
                      {activeLesson.options.map((option, idx) => {
                        const tileState =
                          pickedIndex === null
                            ? 'idle'
                            : idx === pickedIndex
                              ? idx === activeLesson.correctIndex
                                ? 'correct'
                                : 'wrong'
                              : 'idle';
                        return (
                          <ChoiceTile
                            key={option}
                            indexLabel={String(idx + 1)}
                            label={option}
                            state={tileState}
                            liteMode={liteMode}
                            motionPaused={motionPaused}
                            onClick={() => handlePick(idx)}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {answerState === 'correct' ? (
                    <div className="rounded-[12px] border-2 border-[var(--ok)] bg-[#19B7A6]/12 p-3.5 text-[15px] font-semibold text-[var(--on-surface)]">
                      <p className="text-[var(--ok-ink)]">{t.lessonCheckSuccess}</p>
                      <p className="mt-1 text-[14px] font-medium text-[var(--on-surface-muted)]">
                        {activeLesson.explanation}
                      </p>
                    </div>
                  ) : answerState === 'wrong' ? (
                    <div className="rounded-[12px] border-2 border-[var(--warn)] bg-[#E4572E]/10 p-3.5 text-[15px] font-semibold text-[var(--on-surface)]">
                      <span className="text-[var(--warn-ink)]">{t.lessonRetryHint}</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
                  <span className="text-[14px] font-medium text-[var(--on-surface-muted)]">
                    {completedCount >= LESSONS.length
                      ? 'Barcha darslar tayyor!'
                      : 'Taxmin qilib koʻrgach ustaxonaga oʻt.'}
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a
                      href="/uz/learn"
                      className="ws-key-btn ws-key-btn--secondary min-h-[48px] px-4 py-2 text-[15px] no-underline"
                    >
                      Toʻliq darslar
                    </a>
                    <button
                      type="button"
                      onClick={onGoGames}
                      className="ws-key-btn ws-key-btn--primary min-h-[48px] px-4 py-2 text-[15px]"
                    >
                      <span>{WORKSHOP_STRINGS.nav.games}</span>
                      <PhPlay size={14} weight="fill" className="ws-key-icon" />
                    </button>
                  </div>
                </div>
              </WorkshopCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
