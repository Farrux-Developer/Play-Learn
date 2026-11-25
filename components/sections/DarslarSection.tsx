/**
 * Darslar ("Understand" / Paper surface) section:
 * - Progress ring showing completed lessons (X / 4)
 * - 4 micro-lessons with custom SVG mechanism previews on hover
 * - Predict-before-Run interactive workbench (+20 XP on first correct prediction)
 */
'use client';

import React, { useState } from 'react';
import {
  DuppiChevronIcon,
  PhCheck,
  PhLessons,
  PhPlay,
} from '@/components/icons/WorkshopIcons';
import { ChoiceTile } from '@/components/ui/ChoiceTile';
import { WorkshopCard } from '@/components/ui/WorkshopCard';
import { LESSONS, type LessonItem } from '@/lib/data/workshop';
import { WORKSHOP_STRINGS } from '@/lib/engine/i18n';

interface DarslarSectionProps {
  completedLessons: string[];
  liteMode: boolean;
  motionPaused: boolean;
  onCompleteLesson: (lesson: LessonItem) => void;
  onWrongPrediction: (lesson: LessonItem) => void;
  onGoGames: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function LessonPreviewSvg({
  lessonId,
  hovered,
  staticMode,
}: {
  lessonId: string;
  hovered: boolean;
  staticMode: boolean;
}) {
  const active = hovered && !staticMode;
  if (lessonId === 'L1') {
    return (
      <svg viewBox="0 0 120 40" className="h-9 w-28" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={8 + i * 38}
            y={10}
            width={28}
            height={20}
            rx={5}
            fill={active && i === 1 ? '#19B7A6' : i === 0 ? '#0F4C81' : '#EAE3D2'}
            stroke="#0F1E3A"
            strokeWidth="1.8"
            style={{
              transform: active ? `translateY(${i % 2 === 0 ? -2 : 2}px)` : 'none',
              transition: 'transform 240ms ease-out, fill 240ms ease-out',
            }}
          />
        ))}
      </svg>
    );
  }
  if (lessonId === 'L2') {
    return (
      <svg viewBox="0 0 120 40" className="h-9 w-28" aria-hidden="true">
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
          {active ? '15' : '10'}
        </text>
        <rect
          x="68"
          y="7"
          width="38"
          height="26"
          rx="6"
          fill={active ? '#F5A800' : '#FFFDF7'}
          stroke="#0F1E3A"
          strokeWidth="1.8"
          style={{ transition: 'fill 220ms ease-out' }}
        />
        <text x="87" y="25" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0F1E3A">
          ball
        </text>
      </svg>
    );
  }
  if (lessonId === 'L3') {
    return (
      <svg viewBox="0 0 120 40" className="h-9 w-28" aria-hidden="true">
        <polygon
          points="36,6 56,20 36,34 16,20"
          fill={active ? '#F5A800' : '#EAE3D2'}
          stroke="#0F1E3A"
          strokeWidth="1.8"
        />
        <path d="M56 20H78M78 20L94 11M78 20L94 29" stroke="#0F1E3A" strokeWidth="2" strokeLinecap="round" />
        <circle cx="99" cy="11" r="5" fill="#19B7A6" stroke="#0F1E3A" strokeWidth="1.5" />
        <circle cx="99" cy="29" r="5" fill="#EAE3D2" stroke="#0F1E3A" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 40" className="h-9 w-28" aria-hidden="true">
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
          transform: active ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 360ms ease-out',
        }}
      />
      <circle cx="60" cy="20" r="4.5" fill="#19B7A6" stroke="#0F1E3A" strokeWidth="1.6" />
    </svg>
  );
}

export function DarslarSection({
  completedLessons,
  liteMode,
  motionPaused,
  onCompleteLesson,
  onWrongPrediction,
  onGoGames,
}: DarslarSectionProps) {
  const [selectedId, setSelectedId] = useState<string>(LESSONS[0].id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const activeLesson = LESSONS.find((l) => l.id === selectedId) ?? LESSONS[0];
  const completedCount = completedLessons.length;
  const pct = completedCount / LESSONS.length;
  const ringR = 20;
  const ringC = 2 * Math.PI * ringR;
  const t = WORKSHOP_STRINGS.reviewStrings;

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
              <circle
                cx="25"
                cy="25"
                r={ringR}
                fill="none"
                stroke="#EAE3D2"
                strokeWidth="5"
              />
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
                style={{ transition: 'stroke-dashoffset 320ms ease-out' }}
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

        {/* 4 Lesson selector cards + Predict-before-Run bench */}
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
                  onMouseEnter={() => setHoveredId(lesson.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`flex min-h-[76px] w-full items-center justify-between gap-3 rounded-[16px] border-2 p-4 text-left transition-[transform,border-color,box-shadow] duration-150 ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--surface-raised)] shadow-[var(--sh-3)]'
                      : 'border-[var(--line-strong)] bg-[var(--surface-raised)] shadow-[var(--sh-1)] hover:-translate-y-0.5'
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="ws-tabular rounded-[6px] border border-[var(--line-strong)] bg-[var(--surface-inset)] px-2 py-0.5 text-[13px] font-extrabold">
                        {lesson.id}
                      </span>
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#19B7A6]/20 px-2 py-0.5 text-[13px] font-bold text-[#0E7C70]">
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
                    hovered={hoveredId === lesson.id}
                    staticMode={liteMode || motionPaused}
                  />
                </button>
              );
            })}
          </div>

          <WorkshopCard
            surface="paper"
            state={answerState === 'correct' ? 'success' : answerState === 'wrong' ? 'error' : 'default'}
            className="flex flex-col justify-between gap-4"
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
                        onClick={() => handlePick(idx)}
                      />
                    );
                  })}
                </div>
              </div>

              {answerState === 'correct' ? (
                <div className="rounded-[12px] border-2 border-[#19B7A6] bg-[#19B7A6]/12 p-3.5 text-[15px] font-semibold text-[#0F1E3A]">
                  <p>{t.lessonCheckSuccess}</p>
                  <p className="mt-1 text-[14px] font-medium text-[#42526E]">
                    {activeLesson.explanation}
                  </p>
                </div>
              ) : answerState === 'wrong' ? (
                <div className="rounded-[12px] border-2 border-[#E4572E] bg-[#E4572E]/10 p-3.5 text-[15px] font-semibold text-[#0F1E3A]">
                  {t.lessonRetryHint}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
              <span className="text-[14px] font-medium text-[var(--on-surface-muted)]">
                {completedCount >= LESSONS.length
                  ? 'Barcha darslar tayyor!'
                  : 'Taxmin qilib koʻrgach ustaxonaga oʻt.'}
              </span>
              <button
                type="button"
                onClick={onGoGames}
                className="ws-key-btn ws-key-btn--primary min-h-[44px] px-4 py-2 text-[15px]"
              >
                <span>{WORKSHOP_STRINGS.nav.games}</span>
                <PhPlay size={14} weight="fill" />
              </button>
            </div>
          </WorkshopCard>
        </div>
      </div>
    </section>
  );
}
