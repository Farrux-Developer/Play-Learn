/**
 * Oʻyinlar ("Play" / Blueprint surface) — 3 Interactive Ustaxona:
 * - Distinct enamel accent per workshop (#19B7A6, #F5A800, #E4572E)
 * - Explicit locked/empty state with CTA back to Darslar
 * - Line-numbered code with soft coral error underline ("Oʻzing tuzat")
 * - +25 XP + glaze pulse + confetti on first solve + <=1.8s skippable reward banner
 */
'use client';

import React, { useEffect, useState } from 'react';
import {
  MechLockIcon,
  PhCheck,
  PhPlay,
  PhWorkshop,
  WorkshopTokenIcon,
} from '@/components/icons/WorkshopIcons';
import { ChoiceTile } from '@/components/ui/ChoiceTile';
import { WORKSHOPS, type WorkshopTask } from '@/lib/data/workshop';
import { WORKSHOP_STRINGS } from '@/lib/engine/i18n';
import type { WorkshopId } from '@/lib/engine/store';

interface GamesSectionProps {
  xp: number;
  activeWorkshopId: WorkshopId;
  unlockedWorkshops: WorkshopId[];
  solvedTasks: string[];
  onSelectWorkshop: (id: WorkshopId) => void;
  onSolveTask: (task: WorkshopTask, workshopId: WorkshopId) => void;
  onWrongTask: (task: WorkshopTask) => void;
  onBackToLessons: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function GamesSection({
  xp,
  activeWorkshopId,
  unlockedWorkshops,
  solvedTasks,
  onSelectWorkshop,
  onSolveTask,
  onWrongTask,
  onBackToLessons,
}: GamesSectionProps) {
  const [taskIdx, setTaskIdx] = useState(0);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [rewardBanner, setRewardBanner] = useState(false);

  const activeWorkshop =
    WORKSHOPS.find((w) => w.id === activeWorkshopId) ?? WORKSHOPS[0];
  const isUnlocked =
    unlockedWorkshops.includes(activeWorkshop.id) || xp >= activeWorkshop.unlockXp;
  const tasks = activeWorkshop.tasks;
  const activeTask = tasks[taskIdx % tasks.length];
  const t = WORKSHOP_STRINGS.reviewStrings;

  const allSolvedInWorkshop = tasks.every((tk) => solvedTasks.includes(tk.id));

  useEffect(() => {
    if (!rewardBanner) return;
    const timer = window.setTimeout(() => setRewardBanner(false), 1800);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRewardBanner(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [rewardBanner]);

  const switchWorkshop = (id: WorkshopId) => {
    onSelectWorkshop(id);
    setTaskIdx(0);
    setPickedIndex(null);
    setFeedbackState('idle');
    setRewardBanner(false);
  };

  const handleSelectOption = (idx: number) => {
    setPickedIndex(idx);
    if (idx === activeTask.correctIndex) {
      setFeedbackState('correct');
      onSolveTask(activeTask, activeWorkshop.id);
      if (taskIdx === tasks.length - 1) {
        setRewardBanner(true);
      }
    } else {
      setFeedbackState('wrong');
      onWrongTask(activeTask);
    }
  };

  const handleNextTask = () => {
    setTaskIdx((i) => (i + 1) % tasks.length);
    setPickedIndex(null);
    setFeedbackState('idle');
  };

  const codeLines = activeTask.codeSnippet.split('\n');

  return (
    <section
      id="oyinlar"
      data-surface="blueprint"
      className="ws-surface ws-blueprint-grid ws-girih-bg scroll-mt-20 border-t-2 border-[var(--line-strong)] py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 text-[14px] font-bold text-[#19B7A6]">
            <PhWorkshop size={18} weight="bold" />
            <span>{t.surfaceBlueprint}</span>
          </div>
          <h2 className="ws-h2 font-extrabold tracking-tight text-[#EAF2FF]">
            {t.gamesTitle}
          </h2>
          <p className="ws-body text-[#B6CCE8]">{t.gamesSubtitle}</p>
        </div>

        {/* 3 Workshop selector tabs */}
        <div
          role="tablist"
          aria-label={WORKSHOP_STRINGS.hud.workshopsLabel}
          className="mb-6 grid gap-3 sm:grid-cols-3"
        >
          {WORKSHOPS.map((ws) => {
            const wsUnlocked = unlockedWorkshops.includes(ws.id) || xp >= ws.unlockXp;
            const active = ws.id === activeWorkshop.id;
            const wsSolvedCount = ws.tasks.filter((tk) =>
              solvedTasks.includes(tk.id)
            ).length;

            return (
              <button
                key={ws.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchWorkshop(ws.id)}
                className={`flex min-h-[64px] items-center justify-between gap-3 rounded-[16px] border-2 px-4 py-3 text-left transition-[transform,border-color,background-color] ${
                  active
                    ? 'bg-[#11437D] shadow-[var(--sh-3)]'
                    : 'bg-[#07264B]/90 hover:-translate-y-0.5'
                }`}
                style={{
                  borderColor: active ? ws.accentHex : 'rgba(234,242,255,0.28)',
                }}
              >
                <div>
                  <p className="text-[13px] font-extrabold uppercase tracking-wide" style={{ color: ws.accentHex }}>
                    {ws.badgeText}
                  </p>
                  <p className="font-[family-name:var(--font-display)] text-[17px] font-bold text-[#EAF2FF]">
                    {ws.title}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="ws-tabular text-[13px] font-bold text-[#B6CCE8]">
                    {wsSolvedCount}/{ws.tasks.length}
                  </span>
                  {wsUnlocked ? (
                    <WorkshopTokenIcon unlocked size={20} />
                  ) : (
                    <MechLockIcon unlocked={false} size={18} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Locked Empty State vs Active Coding Task */}
        {!isUnlocked ? (
          <div className="ws-blueprint-panel flex flex-col items-start gap-4 bg-[#07264B] p-6 text-[#EAF2FF]">
            <div className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--line-strong)] bg-[#0B3566] px-3 py-1.5 text-[14px] font-bold text-[#F5A800]">
              <MechLockIcon unlocked={false} size={18} />
              <span>{activeWorkshop.unlockXp} XP kerak</span>
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
              {t.lockedEmptyTitle}
            </h3>
            <p className="text-[16px] text-[#B6CCE8]">
              {t.lockedEmptyBody} (Hozir: <strong className="ws-tabular text-[#F5A800]">{xp} XP</strong>)
            </p>
            <button
              type="button"
              onClick={onBackToLessons}
              className="ws-key-btn ws-key-btn--primary min-h-[46px]"
            >
              <span>{t.backToLessonsBtn}</span>
              <PhPlay size={14} weight="fill" />
            </button>
          </div>
        ) : (
          <div
            className={`ws-blueprint-panel bg-[#11437D] p-5 text-[#EAF2FF] sm:p-6 ${
              feedbackState === 'wrong' ? 'ws-soft-nudge' : ''
            }`}
            style={{ borderColor: activeWorkshop.accentHex }}
          >
            {rewardBanner ? (
              <button
                type="button"
                onClick={() => setRewardBanner(false)}
                className="mb-4 flex w-full items-center justify-between gap-3 rounded-[14px] border-2 border-[#19B7A6] bg-[#19B7A6]/20 px-4 py-3 text-left text-[#EAF2FF]"
              >
                <span className="flex items-center gap-2 font-bold">
                  <PhCheck size={20} weight="fill" className="text-[#19B7A6]" />
                  <span>{t.workshopSolvedBadge} {t.workshopRewardNote}</span>
                </span>
                <span className="text-[13px] font-bold text-[#B6CCE8]">{t.closeModal}</span>
              </button>
            ) : null}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[14px] font-bold" style={{ color: activeWorkshop.accentHex }}>
                  {activeWorkshop.title} — Vazifa {taskIdx + 1}/{tasks.length}
                </p>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold sm:text-2xl">
                  {activeTask.prompt}
                </h3>
              </div>

              {allSolvedInWorkshop ? (
                <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#19B7A6] bg-[#19B7A6]/20 px-3 py-1 text-[14px] font-bold text-[#EAF2FF]">
                  <PhCheck size={16} weight="fill" className="text-[#19B7A6]" />
                  <span>{t.workshopSolvedBadge}</span>
                </span>
              ) : null}
            </div>

            <div className="grid items-start gap-5 lg:grid-cols-[1fr_1fr]">
              {/* Code trace viewer with soft coral underline on error line */}
              <div className="self-start rounded-[14px] border-2 border-[var(--line-strong)] bg-[#07264B] p-4">
                <pre className="overflow-x-auto text-[15px] leading-relaxed text-[#EAF2FF]">
                  {codeLines.map((line, i) => {
                    const isErrorLine =
                      feedbackState === 'wrong' && activeTask.errorLineIndex === i;
                    return (
                      <div
                        key={i}
                        className={`rounded px-1.5 py-0.5 ${
                          isErrorLine
                            ? 'bg-[#E4572E]/20 underline decoration-[#E4572E] decoration-wavy underline-offset-4'
                            : ''
                        }`}
                      >
                        <span className="ws-tabular mr-3 select-none text-[#B6CCE8]/60">
                          {i + 1}
                        </span>
                        <code>{line}</code>
                      </div>
                    );
                  })}
                </pre>
              </div>

              <div className="space-y-3">
                {activeTask.options.map((opt, idx) => {
                  const tileState =
                    pickedIndex === null
                      ? 'idle'
                      : idx === pickedIndex
                      ? idx === activeTask.correctIndex
                        ? 'correct'
                        : 'wrong'
                      : 'idle';
                  return (
                    <ChoiceTile
                      key={opt}
                      indexLabel={String(idx + 1)}
                      label={opt}
                      state={tileState}
                      onClick={() => handleSelectOption(idx)}
                    />
                  );
                })}

                {feedbackState === 'correct' ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border-2 border-[#19B7A6] bg-[#19B7A6]/18 p-3.5 text-[15px] font-semibold">
                    <span>{activeTask.successNote}</span>
                    {tasks.length > 1 ? (
                      <button
                        type="button"
                        onClick={handleNextTask}
                        className="rounded-[10px] border-2 border-[#0E7C70] bg-[#19B7A6] px-3 py-1.5 text-[14px] font-bold text-[#0F1E3A]"
                      >
                        {t.diagNextBtn}
                      </button>
                    ) : null}
                  </div>
                ) : feedbackState === 'wrong' ? (
                  <div className="rounded-[12px] border-2 border-[#E4572E] bg-[#E4572E]/16 p-3.5 text-[15px] font-semibold">
                    <strong className="mr-1.5 text-[#F5A800]">{t.fixYourselfHint}</strong>
                    {activeTask.hint}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
