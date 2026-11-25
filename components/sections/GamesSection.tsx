/**
 * Oʻyinlar ("Play" / Blueprint surface) — 3 Interactive Ustaxona:
 * - Built on @base-ui/react/tabs for accessible keyboard tab navigation
 * - WCAG-safe semantic ink tokens (--ok-ink, --reward-ink, --warn-ink) on #11437D
 * - A14 unlock celebration listener on workshop:unlock
 * - A18 Rough.js hand-drawn errorUnderline drawn via GSAP DrawSVG under errorLineIndex
 * - A19 staggered PinStarIcon reward banner + A20 GearLoader & empty-task fallback
 */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Tabs } from '@base-ui/react/tabs';
import {
  GearLoader,
  MechLockIcon,
  PhCheck,
  PhPlay,
  PhWorkshop,
  PinStarIcon,
  WorkshopTokenIcon,
} from '@/components/icons/WorkshopIcons';
import { MirzoRig } from '@/components/MirzoRig';
import { ChoiceTile } from '@/components/ui/ChoiceTile';
import { WORKSHOPS, type WorkshopTask } from '@/lib/data/workshop';
import { WORKSHOP_STRINGS } from '@/lib/engine/i18n';
import type { WorkshopId } from '@/lib/engine/store';
import { motionCore, type QualityTier } from '@/lib/motion/core';
import { ROUGH_PATHS } from '@/lib/motion/roughPaths';

interface GamesSectionProps {
  xp: number;
  tier: QualityTier;
  motionPaused: boolean;
  activeWorkshopId: WorkshopId;
  unlockedWorkshops: WorkshopId[];
  solvedTasks: string[];
  onSelectWorkshop: (id: WorkshopId) => void;
  onSolveTask: (task: WorkshopTask, workshopId: WorkshopId) => void;
  onWrongTask: (task: WorkshopTask) => void;
  onBackToLessons: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const WORKSHOP_TOKENS: Record<
  WorkshopId,
  { border: string; textInk: string }
> = {
  algoritmlar: { border: 'var(--ok)', textInk: 'var(--ok-ink)' },
  mantiq: { border: 'var(--reward)', textInk: 'var(--reward-ink)' },
  sikllar: { border: 'var(--warn)', textInk: 'var(--warn-ink)' },
};

export function GamesSection({
  xp,
  tier,
  motionPaused,
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
  const [justUnlockedId, setJustUnlockedId] = useState<WorkshopId | null>(null);
  const [switching, setSwitching] = useState(false);
  const codeErrLineRef = useRef<SVGPathElement | null>(null);

  const liteMode = tier === 'lite';
  const activeWorkshop =
    WORKSHOPS.find((w) => w.id === activeWorkshopId) ?? WORKSHOPS[0];
  const isUnlocked =
    unlockedWorkshops.includes(activeWorkshop.id) || xp >= activeWorkshop.unlockXp;
  const tasks = activeWorkshop.tasks;
  const activeTask = tasks.length > 0 ? tasks[taskIdx % tasks.length] : null;
  const t = WORKSHOP_STRINGS.reviewStrings;
  const activeAccent = WORKSHOP_TOKENS[activeWorkshop.id];

  const allSolvedInWorkshop =
    tasks.length > 0 && tasks.every((tk) => solvedTasks.includes(tk.id));

  // A14 Listen for workshop:unlock event for token flare & lock lift
  useEffect(() => {
    return motionCore.on('workshop:unlock', ({ id }) => {
      setJustUnlockedId(id);
      window.setTimeout(() => setJustUnlockedId(null), 1200);
    });
  }, []);

  // A19 Auto-dismiss completion banner after 1.8s or Escape
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

  // A18 DrawSVG Rough.js underline on errorLineIndex
  useEffect(() => {
    if (
      feedbackState !== 'wrong' ||
      liteMode ||
      motionPaused ||
      !codeErrLineRef.current
    ) {
      return;
    }
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) return;

    let cancelled = false;
    void (async () => {
      try {
        const [{ default: gsap }, { DrawSVGPlugin }] = await Promise.all([
          import('gsap'),
          import('gsap/DrawSVGPlugin'),
        ]);
        if (cancelled || !codeErrLineRef.current) return;
        gsap.registerPlugin(DrawSVGPlugin);
        gsap.fromTo(
          codeErrLineRef.current,
          { drawSVG: '0%' },
          { drawSVG: '100%', duration: 0.32, ease: 'power2.out' }
        );
      } catch {
        // Static Rough path stays visible
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [feedbackState, liteMode, motionPaused]);

  const switchWorkshop = (id: WorkshopId) => {
    onSelectWorkshop(id);
    setTaskIdx(0);
    setPickedIndex(null);
    setFeedbackState('idle');
    setRewardBanner(false);
    if (!liteMode && !motionPaused) {
      setSwitching(true);
      window.setTimeout(() => setSwitching(false), 180);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (!activeTask) return;
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
    if (tasks.length === 0) return;
    setTaskIdx((i) => (i + 1) % tasks.length);
    setPickedIndex(null);
    setFeedbackState('idle');
  };

  const codeLines = activeTask ? activeTask.codeSnippet.split('\n') : [];

  return (
    <section
      id="oyinlar"
      data-surface="blueprint"
      className="ws-surface ws-blueprint-grid ws-girih-bg scroll-mt-20 border-t-2 border-[var(--line-strong)] py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 text-[14px] font-bold text-[var(--ok-ink)]">
            <PhWorkshop size={18} weight="bold" />
            <span>{t.surfaceBlueprint}</span>
          </div>
          <h2 className="ws-h2 font-extrabold tracking-tight text-[#EAF2FF]">
            {t.gamesTitle}
          </h2>
          <p className="ws-body text-[#B6CCE8]">{t.gamesSubtitle}</p>
        </div>

        {/* 3 Workshop tabs powered by @base-ui/react/tabs */}
        <Tabs.Root
          value={activeWorkshop.id}
          onValueChange={(val) => switchWorkshop(val as WorkshopId)}
        >
          <Tabs.List
            aria-label={WORKSHOP_STRINGS.hud.workshopsLabel}
            className="mb-6 grid gap-3 sm:grid-cols-3"
          >
            {WORKSHOPS.map((ws) => {
              const wsUnlocked = unlockedWorkshops.includes(ws.id) || xp >= ws.unlockXp;
              const active = ws.id === activeWorkshop.id;
              const wsSolvedCount = ws.tasks.filter((tk) =>
                solvedTasks.includes(tk.id)
              ).length;
              const wsTheme = WORKSHOP_TOKENS[ws.id];
              const isJustUnlocked = justUnlockedId === ws.id;

              return (
                <Tabs.Tab
                  key={ws.id}
                  value={ws.id}
                  className={`flex min-h-[64px] cursor-pointer items-center justify-between gap-3 rounded-[16px] border-2 px-4 py-3 text-left transition-[transform,border-color,background-color] duration-150 ${
                    active
                      ? 'bg-[#11437D] shadow-[var(--sh-3)]'
                      : 'bg-[#07264B]/90 hover:-translate-y-0.5'
                  } ${isJustUnlocked ? 'ring-2 ring-[var(--ok)]' : ''}`}
                  style={{
                    borderColor: active ? wsTheme.border : 'rgba(234,242,255,0.28)',
                  }}
                >
                  <div>
                    <p
                      className="text-[13px] font-extrabold tracking-wide"
                      style={{ color: wsTheme.textInk }}
                    >
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
                </Tabs.Tab>
              );
            })}
          </Tabs.List>

          <Tabs.Panel value={activeWorkshop.id}>
            {switching ? (
              <div className="ws-blueprint-panel flex min-h-[260px] items-center justify-center bg-[#07264B] p-6">
                <GearLoader label={t.loadingText} />
              </div>
            ) : !isUnlocked ? (
              <div className="ws-blueprint-panel flex flex-col items-start gap-4 bg-[#07264B] p-6 text-[#EAF2FF]">
                <div className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--line-strong)] bg-[#0B3566] px-3 py-1.5 text-[14px] font-bold text-[var(--reward-ink)]">
                  <MechLockIcon unlocked={false} size={18} />
                  <span>{activeWorkshop.unlockXp} XP kerak</span>
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
                  {t.lockedEmptyTitle}
                </h3>
                <p className="text-[16px] text-[#B6CCE8]">
                  {t.lockedEmptyBody} (Hozir:{' '}
                  <strong className="ws-tabular text-[var(--reward-ink)]">{xp} XP</strong>)
                </p>
                <button
                  type="button"
                  onClick={onBackToLessons}
                  className="ws-key-btn ws-key-btn--primary min-h-[46px]"
                >
                  <span>{t.backToLessonsBtn}</span>
                  <PhPlay size={14} weight="fill" className="ws-key-icon" />
                </button>
              </div>
            ) : !activeTask ? (
              <div className="ws-blueprint-panel flex flex-col items-center gap-4 bg-[#07264B] p-6 text-center text-[#EAF2FF]">
                <MirzoRig mood="think" liteMode={liteMode} motionPaused={motionPaused} size={140} />
                <p className="text-[16px] font-semibold text-[#B6CCE8]">
                  {t.emptyTasksText}
                </p>
              </div>
            ) : (
              <div
                className={`ws-blueprint-panel bg-[#11437D] p-5 text-[#EAF2FF] sm:p-6 ${
                  feedbackState === 'wrong' && !liteMode && !motionPaused
                    ? 'ws-soft-nudge'
                    : ''
                }`}
                style={{ borderColor: activeAccent.border }}
              >
                {rewardBanner ? (
                  <button
                    type="button"
                    onClick={() => setRewardBanner(false)}
                    className="mb-4 flex w-full cursor-pointer items-center justify-between gap-3 rounded-[14px] border-2 border-[var(--ok)] bg-[#19B7A6]/20 px-4 py-3 text-left text-[#EAF2FF]"
                  >
                    <span className="flex items-center gap-2 font-bold">
                      <span className="flex items-center gap-1" aria-hidden="true">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className={!liteMode && !motionPaused ? 'ws-pin-pop inline-block' : 'inline-block'}
                            style={{ animationDelay: `${i * 120}ms` }}
                          >
                            <PinStarIcon size={20} />
                          </span>
                        ))}
                      </span>
                      <span>
                        {t.workshopSolvedBadge} {t.workshopRewardNote}
                      </span>
                    </span>
                    <span className="text-[13px] font-bold text-[#B6CCE8]">
                      {t.closeModal}
                    </span>
                  </button>
                ) : null}

                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p
                      className="text-[14px] font-bold"
                      style={{ color: activeAccent.textInk }}
                    >
                      {activeWorkshop.title} — Vazifa {taskIdx + 1}/{tasks.length}
                    </p>
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold sm:text-2xl">
                      {activeTask.prompt}
                    </h3>
                  </div>

                  {allSolvedInWorkshop ? (
                    <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--ok)] bg-[#19B7A6]/20 px-3 py-1 text-[14px] font-bold text-[#EAF2FF]">
                      <PhCheck size={16} weight="fill" className="text-[var(--ok-ink)]" />
                      <span>{t.workshopSolvedBadge}</span>
                    </span>
                  ) : null}
                </div>

                <div className="grid items-start gap-5 lg:grid-cols-[1fr_1fr]">
                  {/* Code trace viewer with A18 Rough.js error underline */}
                  <div className="self-start rounded-[14px] border-2 border-[var(--line-strong)] bg-[#07264B] p-4">
                    <pre className="overflow-x-auto text-[15px] leading-relaxed text-[#EAF2FF]">
                      {codeLines.map((line, i) => {
                        const isErrorLine =
                          feedbackState === 'wrong' && activeTask.errorLineIndex === i;
                        return (
                          <div
                            key={i}
                            className={`rounded px-1.5 py-0.5 ${
                              isErrorLine ? 'bg-[#E4572E]/18' : ''
                            }`}
                          >
                            <span className="ws-tabular mr-3 select-none text-[#B6CCE8]/70">
                              {i + 1}
                            </span>
                            <code>{line}</code>
                            {isErrorLine ? (
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 240 14"
                                preserveAspectRatio="none"
                                className="mt-0.5 ml-6 block h-2 w-48 text-[var(--warn-ink)]"
                              >
                                <path
                                  ref={codeErrLineRef}
                                  d={ROUGH_PATHS.errorUnderline}
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            ) : null}
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
                          liteMode={liteMode}
                          motionPaused={motionPaused}
                          onClick={() => handleSelectOption(idx)}
                        />
                      );
                    })}

                    {feedbackState === 'correct' ? (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border-2 border-[var(--ok)] bg-[#19B7A6]/18 p-3.5 text-[15px] font-semibold">
                        <span>{activeTask.successNote}</span>
                        {tasks.length > 1 ? (
                          <button
                            type="button"
                            onClick={handleNextTask}
                            className="min-h-[44px] cursor-pointer rounded-[10px] border-2 border-[#008273] bg-[#19B7A6] px-3.5 py-1.5 text-[14px] font-bold text-[#0F1E3A]"
                          >
                            {t.diagNextBtn}
                          </button>
                        ) : null}
                      </div>
                    ) : feedbackState === 'wrong' ? (
                      <div className="rounded-[12px] border-2 border-[var(--warn)] bg-[#E4572E]/18 p-3.5 text-[15px] font-semibold">
                        <strong className="mr-1.5 text-[var(--reward-ink)]">
                          {t.fixYourselfHint}
                        </strong>
                        {activeTask.hint}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </Tabs.Panel>
        </Tabs.Root>
      </div>
    </section>
  );
}
