/**
 * Client Workshop Shell:
 * - Keeps above-the-fold Header + Hero + Workshop HUD lightweight (<= 120 KB gz First-Load JS)
 * - Code-splits below-the-fold sections (SSR enabled), modal, backdrop, confetti & dev panel
 * - Preserves exact Paper <-> Blueprint View Transitions & MotionCore event choreography
 */
'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { HeroSection } from '@/components/HeroSection';
import { PhPlay } from '@/components/icons/WorkshopIcons';
import { WorkshopHeader, type NavSectionId } from '@/components/WorkshopHeader';
import {
  LESSONS_TOTAL,
  MACHINE_TICKS,
  WORKSHOP_META,
} from '@/lib/data/heroMeta';
import type { LessonItem, WorkshopTask } from '@/lib/data/workshop';
import { HERO_STRINGS } from '@/lib/engine/heroStrings';
import type { MirzoController, MirzoMood } from '@/lib/engine/mirzo';
import { applyXpReward } from '@/lib/engine/xp';
import type { SoundCue } from '@/lib/engine/sound';
import {
  clearWorkshopState,
  createDefaultState,
  getLevelInfo,
  loadWorkshopState,
  saveWorkshopState,
  type WorkshopId,
  type WorkshopState,
} from '@/lib/engine/store';
import { motionCore, type QualityTier } from '@/lib/motion/core';

const NetworkBackdrop = dynamic(
  () => import('@/components/NetworkBackdrop').then((m) => m.NetworkBackdrop),
  { ssr: false }
);
const DarslarSection = dynamic(
  () => import('@/components/sections/DarslarSection').then((m) => m.DarslarSection),
  { ssr: true }
);
const XaritaSection = dynamic(
  () => import('@/components/sections/XaritaSection').then((m) => m.XaritaSection),
  { ssr: true }
);
const GamesSection = dynamic(
  () => import('@/components/sections/GamesSection').then((m) => m.GamesSection),
  { ssr: true }
);
const TamoyillarSection = dynamic(
  () => import('@/components/sections/TamoyillarSection').then((m) => m.TamoyillarSection),
  { ssr: true }
);
const DiagnosticModal = dynamic(
  () => import('@/components/ui/DiagnosticModal').then((m) => m.DiagnosticModal),
  { ssr: false }
);
const DevWorkshopPanel = dynamic(
  () => import('@/components/DevWorkshopPanel').then((m) => m.DevWorkshopPanel),
  { ssr: false }
);

const DIAG_DONE_KEY = 'oyna_diag_done_v1';

function playWorkshopCue(cue: SoundCue, enabled: boolean) {
  if (!enabled) return;
  void import('@/lib/engine/sound')
    .then((m) => m.playWorkshopCue(cue, enabled))
    .catch(() => {});
}

export function WorkshopClientShell({
  headlineSlot,
  promisesSlot,
}: {
  headlineSlot?: React.ReactNode;
  promisesSlot?: React.ReactNode;
}) {
  const [state, setState] = useState<WorkshopState>(() => createDefaultState());
  const [hydrated, setHydrated] = useState(false);
  const [diagCompleted, setDiagCompleted] = useState(false);
  const [tier, setTier] = useState<QualityTier>('mid');
  const [activeNav, setActiveNav] = useState<NavSectionId>('darslar');
  const [activeWorkshopId, setActiveWorkshopId] = useState<WorkshopId>('algoritmlar');
  const [diagOpen, setDiagOpen] = useState(false);
  const [mood, setMood] = useState<MirzoMood>('idle');
  const [speechText, setSpeechText] = useState<string>(HERO_STRINGS.hud.defaultSay);
  const [nudgeError, setNudgeError] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [idleNudgeCta, setIdleNudgeCta] = useState(false);
  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 });
  const mirzoRef = useRef<MirzoController | null>(null);
  const lastLookUpdateRef = useRef(0);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Start MotionCore once and synchronize tier + pointer idle nudge
  useEffect(() => {
    const saved = loadWorkshopState();
    stateRef.current = saved;
    let savedDiag = false;
    try {
      savedDiag = window.localStorage.getItem(DIAG_DONE_KEY) === '1';
    } catch {
      savedDiag = false;
    }
    queueMicrotask(() => {
      setState(saved);
      setDiagCompleted(savedDiag);
      setHydrated(true);
    });

    const stopCore = motionCore.start();
    const syncTel = () => {
      const tel = motionCore.getTelemetry();
      setTier(tel.tier);
    };
    syncTel();
    const offTel = motionCore.subscribeTelemetry(syncTel);
    const offIdle = motionCore.on('pointer:idle', () => {
      setIdleNudgeCta(true);
      window.setTimeout(() => setIdleNudgeCta(false), 1400);
    });

    return () => {
      offTel();
      offIdle();
      stopCore();
    };
  }, []);

  // Persist workshop progress & sync MotionCore flags
  useEffect(() => {
    if (!hydrated) return;
    saveWorkshopState(state);
    motionCore.setSoundEnabled(state.soundEnabled);
    motionCore.setMotionPaused(state.motionPaused);
    if (state.liteMode && motionCore.getTelemetry().tierOverride === 'auto') {
      motionCore.setTierOverride('lite');
    }
    const root = document.documentElement;
    root.setAttribute('data-surface', state.surfaceMode);
  }, [state, hydrated]);

  // Sample pointer lookOffset smoothly (<= 20 Hz, zero 60Hz React re-renders)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || tier === 'lite' || state.motionPaused) return;
    const now = performance.now();
    if (now - lastLookUpdateRef.current < 48) return;
    lastLookUpdateRef.current = now;
    const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    const ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
    setLookOffset({ x: nx, y: ny });
  };

  const handlePointerLeave = () => {
    setLookOffset({ x: 0, y: 0 });
  };

  const triggerHaptic = () => {
    if (
      state.soundEnabled &&
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function'
    ) {
      navigator.vibrate(8);
    }
  };

  const triggerConfetti = (
    variant: 'correct' | 'levelUp' | 'quiz',
    motionPausedFlag: boolean
  ) => {
    void import('@/lib/engine/confetti')
      .then((m) =>
        m.fireWorkshopConfetti({
          liteMode: tier === 'lite',
          motionPaused: motionPausedFlag,
          variant,
        })
      )
      .catch(() => {});
  };

  const switchSurface = (
    nextSurface: 'paper' | 'blueprint',
    e?: React.MouseEvent<HTMLElement>
  ) => {
    if (stateRef.current.surfaceMode === nextSurface) return;
    const vx = e?.clientX;
    const vy = e?.clientY;
    if (e) {
      document.documentElement.style.setProperty('--vt-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--vt-y', `${e.clientY}px`);
    }
    motionCore.emit('ui:mode', { mode: nextSurface, x: vx, y: vy });

    const apply = () =>
      setState((prev) => {
        const next = { ...prev, surfaceMode: nextSurface };
        stateRef.current = next;
        return next;
      });
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (
      typeof doc.startViewTransition === 'function' &&
      !state.motionPaused &&
      tier !== 'lite' &&
      !reduced
    ) {
      doc.startViewTransition(() => {
        flushSync(apply);
      });
    } else {
      apply();
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduced =
      state.motionPaused ||
      tier === 'lite' ||
      (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  const handleNavigate = (
    section: NavSectionId,
    triggerBlueprint = false,
    e?: React.MouseEvent<HTMLElement>
  ) => {
    playWorkshopCue('tap', state.soundEnabled);
    setActiveNav(section);
    switchSurface(triggerBlueprint ? 'blueprint' : 'paper', e);
    scrollToSection(section);
  };

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    playWorkshopCue('success', state.soundEnabled);
    triggerHaptic();
    setActiveNav('oyinlar');
    setMood('happy');
    mirzoRef.current?.setMood('happy');
    setSpeechText('Ajoyib! Birinchi ustaxonaga oʻtdik.');
    switchSurface('blueprint', e);
    scrollToSection('oyinlar');
  };

  const handleStepMachine = () => {
    playWorkshopCue('tap', state.soundEnabled);
    const nextIdx = (state.machineTick + 1) % MACHINE_TICKS.length;
    setState((prev) => ({ ...prev, machineTick: nextIdx }));
    motionCore.emit('machine:step', { tick: nextIdx });
    const nextTick = MACHINE_TICKS[nextIdx];
    setMood(nextIdx === MACHINE_TICKS.length - 1 ? 'happy' : 'think');
    if (nextTick) setSpeechText(nextTick.mirzoNote);
  };

  const handleOpenWorkshop = (
    id: WorkshopId,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    playWorkshopCue('tap', state.soundEnabled);
    setActiveWorkshopId(id);
    setActiveNav('oyinlar');
    switchSurface('blueprint', e);
    scrollToSection('oyinlar');

    const unlocked = state.unlockedWorkshops.includes(id);
    if (!unlocked) {
      setMood('think');
      setSpeechText('Bu ustaxona keyingi XP darajasida ochiladi!');
      return;
    }
    const ws = WORKSHOP_META.find((w) => w.id === id);
    setMood('happy');
    setSpeechText(`${ws?.title ?? 'Ustaxona'} tayyor! Birinchi vazifani koʻramiz.`);
  };

  const rewardAndReact = (
    xpDelta: number,
    options?: {
      markLessonId?: string;
      markTaskId?: string;
      incrementStreak?: boolean;
      successMessage?: string;
      source?: string;
    }
  ) => {
    const prevSnapshot = stateRef.current;
    const outcome = applyXpReward(prevSnapshot, xpDelta, options);
    stateRef.current = outcome.nextState;
    setState(outcome.nextState);
    triggerHaptic();

    if (xpDelta > 0) {
      motionCore.emit('xp:gain', {
        amount: xpDelta,
        from: options?.source ?? 'workshop',
      });
    }
    if (options?.incrementStreak && outcome.nextState.streak > prevSnapshot.streak) {
      motionCore.emit('streak:ignite', { streak: outcome.nextState.streak });
    }
    for (const id of outcome.newlyUnlockedWorkshops) {
      motionCore.emit('workshop:unlock', { id });
    }

    if (outcome.leveledUp) {
      playWorkshopCue('levelUp', outcome.nextState.soundEnabled);
      motionCore.emit('level:up', { level: outcome.newLevel });
      setMood('cheer');
      mirzoRef.current?.celebrate(outcome.newLevel);
      setSpeechText(
        `${outcome.newLevel}-darajaga koʻtarilding! Yangi imkoniyatlar ochildi.`
      );
      triggerConfetti('levelUp', outcome.nextState.motionPaused);
    } else {
      playWorkshopCue('success', outcome.nextState.soundEnabled);
      motionCore.emit('answer:correct', { xpDelta });
      setMood('happy');
      mirzoRef.current?.setMood('happy');
      if (options?.successMessage) {
        setSpeechText(options.successMessage);
      }
      if (options?.markTaskId) {
        triggerConfetti('correct', outcome.nextState.motionPaused);
      }
    }
  };

  const handleCompleteLesson = (lesson: LessonItem) => {
    const alreadyDone = state.completedLessons.includes(lesson.id);
    rewardAndReact(alreadyDone ? 0 : 20, {
      markLessonId: lesson.id,
      source: lesson.id,
      successMessage: alreadyDone
        ? `${lesson.id} takrorlandi! Endi ustaxonada sinab koʻr.`
        : `${lesson.id} oʻzlashtirildi! +20 XP qoʻshildi.`,
    });
  };

  const handleSoftError = (msg: string) => {
    playWorkshopCue('softError', state.soundEnabled);
    motionCore.emit('answer:wrong', {});
    setMood('oops');
    mirzoRef.current?.setMood('oops');
    setNudgeError(true);
    setSpeechText(msg);
    window.setTimeout(() => setNudgeError(false), 320);
  };

  const handleSolveTask = (task: WorkshopTask) => {
    const alreadySolved = state.solvedTasks.includes(task.id);
    rewardAndReact(alreadySolved ? 0 : 25, {
      markTaskId: task.id,
      incrementStreak: !alreadySolved,
      source: task.id,
      successMessage: alreadySolved
        ? 'Barakalla! Vazifa yana bir bor toʻgʻri yechildi.'
        : 'Barakalla! +25 XP va seriya olovi yondi!',
    });
  };

  const levelInfo = getLevelInfo(state.xp);
  const lessonProgressPct = Math.round(
    (state.completedLessons.length / Math.max(1, LESSONS_TOTAL)) * 100
  );

  return (
    <div
      data-surface={state.surfaceMode}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`ws-surface min-h-screen ${
        state.surfaceMode === 'paper' && tier !== 'lite' ? 'ws-paper-grain' : ''
      }`}
    >
      <NetworkBackdrop
        surfaceMode={state.surfaceMode}
        tier={tier}
        motionPaused={state.motionPaused}
      />

      <div className="relative z-10">
        <WorkshopHeader
          activeSection={activeNav}
          surfaceMode={state.surfaceMode}
          motionPaused={state.motionPaused}
          lessonProgressPct={lessonProgressPct}
          completedCount={state.completedLessons.length}
          totalLessons={LESSONS_TOTAL}
          onNavigate={handleNavigate}
          onStart={handleStart}
          onTogglePause={() =>
            setState((prev) => ({ ...prev, motionPaused: !prev.motionPaused }))
          }
        />

        <main>
          <HeroSection
            level={levelInfo.level}
            inLevelXp={levelInfo.inLevelXp}
            targetXp={levelInfo.targetXp}
            streak={state.streak}
            soundEnabled={state.soundEnabled}
            subtitlesEnabled={state.subtitlesEnabled}
            tier={tier}
            motionPaused={state.motionPaused}
            unlockedWorkshops={state.unlockedWorkshops}
            machineTick={state.machineTick}
            mood={mood}
            speechText={speechText}
            nudgeError={nudgeError}
            lookOffset={lookOffset}
            idleNudgeCta={idleNudgeCta}
            mirzoRef={mirzoRef}
            onStart={handleStart}
            onDiagnostic={() => {
              playWorkshopCue('tap', state.soundEnabled);
              setDiagOpen(true);
              setMood('think');
              setSpeechText('Qisqa sinov ochildi — 3 ta savolga javob ber.');
            }}
            onToggleSound={() =>
              setState((prev) => {
                const next = !prev.soundEnabled;
                playWorkshopCue('tap', next);
                return { ...prev, soundEnabled: next };
              })
            }
            onToggleSubtitles={() =>
              setState((prev) => ({
                ...prev,
                subtitlesEnabled: !prev.subtitlesEnabled,
              }))
            }
            onStepMachine={handleStepMachine}
            onOpenWorkshop={handleOpenWorkshop}
            onHeroVisibleChange={setHeroVisible}
            headlineSlot={headlineSlot}
            promisesSlot={promisesSlot}
          />

          <DarslarSection
            completedLessons={state.completedLessons}
            tier={tier}
            motionPaused={state.motionPaused}
            onCompleteLesson={handleCompleteLesson}
            onWrongPrediction={(lesson) =>
              handleSoftError(`${lesson.id} uchun yana bir bor oʻylab koʻramiz!`)
            }
            onGoGames={(e) => handleNavigate('oyinlar', true, e)}
          />

          <XaritaSection
            xp={state.xp}
            tier={tier}
            motionPaused={state.motionPaused}
            unlockedWorkshops={state.unlockedWorkshops}
            onOpenWorkshop={handleOpenWorkshop}
          />

          <GamesSection
            xp={state.xp}
            tier={tier}
            motionPaused={state.motionPaused}
            activeWorkshopId={activeWorkshopId}
            unlockedWorkshops={state.unlockedWorkshops}
            solvedTasks={state.solvedTasks}
            onSelectWorkshop={setActiveWorkshopId}
            onSolveTask={(task) => handleSolveTask(task)}
            onWrongTask={(task) => handleSoftError(task.hint)}
            onBackToLessons={(e) => handleNavigate('darslar', false, e)}
          />

          <TamoyillarSection
            tier={tier}
            motionPaused={state.motionPaused}
            onResetProgress={() => {
              if (state.streak > 0) {
                motionCore.emit('streak:break', { previousStreak: state.streak });
              }
              try {
                window.localStorage.removeItem(DIAG_DONE_KEY);
              } catch {
                // ignore storage errors
              }
              setDiagCompleted(false);
              setState(clearWorkshopState());
              setActiveWorkshopId('algoritmlar');
              setMood('idle');
              setSpeechText(HERO_STRINGS.hud.defaultSay);
            }}
          />
        </main>
      </div>

      {/* Diagnostic Modal ("Qisqa sinov") */}
      {diagOpen ? (
        <DiagnosticModal
          open={diagOpen}
          liteMode={tier === 'lite'}
          motionPaused={state.motionPaused}
          onClose={() => setDiagOpen(false)}
          onAnswerFeedback={(correct) => {
            playWorkshopCue(correct ? 'success' : 'softError', state.soundEnabled);
            motionCore.emit(correct ? 'answer:correct' : 'answer:wrong', {});
          }}
          onComplete={(res) => {
            setDiagOpen(false);
            motionCore.emit('quiz:complete', {
              score: res.correctCount,
              total: 3,
              unlockedWorkshop: res.recommendedWorkshop,
            });
            triggerConfetti('quiz', state.motionPaused);
            const grantedXp = diagCompleted ? 0 : res.xpEarned;
            if (!diagCompleted) {
              setDiagCompleted(true);
              try {
                window.localStorage.setItem(DIAG_DONE_KEY, '1');
              } catch {
                // ignore storage errors
              }
            }
            rewardAndReact(grantedXp, {
              source: 'diagnostic',
              successMessage:
                grantedXp > 0
                  ? `Sinov yakunlandi! +${grantedXp} XP qoʻshildi.`
                  : 'Qisqa sinov qayta yakunlandi! Tavsiya etilgan ustaxona ochildi.',
            });
            setActiveWorkshopId(res.recommendedWorkshop);
            setActiveNav('oyinlar');
            switchSurface('blueprint');
            scrollToSection('oyinlar');
          }}
        />
      ) : null}

      {/* Mobile sticky CTA bar after hero scrolls out of view */}
      {!heroVisible ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-[var(--line-strong)] bg-[var(--surface)]/95 p-3 md:hidden">
          <button
            type="button"
            onClick={handleStart}
            className="ws-key-btn ws-key-btn--primary min-h-[52px] w-full"
          >
            <span>{HERO_STRINGS.hero.primaryCta}</span>
            <span className="ws-key-icon inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--on-accent)]/18">
              <PhPlay size={13} weight="fill" />
            </span>
          </button>
        </div>
      ) : null}

      {process.env.NODE_ENV !== 'production' ? (
        <DevWorkshopPanel
          xp={state.xp}
          streak={state.streak}
          surfaceMode={state.surfaceMode}
          onAddXp={(delta) =>
            rewardAndReact(delta, {
              source: 'dev',
              successMessage: `+${delta} XP qoʻshildi! Kolba toʻlyapti.`,
            })
          }
          onLevelUp={() =>
            rewardAndReact(120, {
              source: 'dev-levelup',
              successMessage: 'Yangi daraja va yangi ustaxona ochildi!',
            })
          }
          onStreakPlus={() => {
            playWorkshopCue('success', state.soundEnabled);
            const nextStreak = state.streak + 1;
            setState((prev) => ({ ...prev, streak: nextStreak }));
            motionCore.emit('streak:ignite', { streak: nextStreak });
            setMood('happy');
            setSpeechText('Seriya olovi yondi!');
          }}
          onStreakBreak={() => {
            const prevStreak = state.streak;
            setState((prev) => ({ ...prev, streak: 0 }));
            motionCore.emit('streak:break', { previousStreak: prevStreak });
            setMood('idle');
            setSpeechText('Seriya sokinlandi — yangidan boshlaymiz!');
          }}
          onCorrect={() => {
            playWorkshopCue('success', state.soundEnabled);
            triggerHaptic();
            motionCore.emit('answer:correct', { xpDelta: 10 });
            setMood('happy');
            mirzoRef.current?.setMood('happy');
            setSpeechText('Barakalla! Aniq va toʻgʻri.');
          }}
          onWrong={() =>
            handleSoftError('Hechqisi yoʻq — qadamni birga tekshiramiz.')
          }
          onQuizComplete={() => {
            playWorkshopCue('levelUp', state.soundEnabled);
            motionCore.emit('quiz:complete', {
              score: 3,
              total: 3,
              unlockedWorkshop: 'mantiq',
            });
            setMood('cheer');
            mirzoRef.current?.celebrate(levelInfo.level);
            triggerConfetti('quiz', state.motionPaused);
            setSpeechText('Sinov yakunlandi — barcha yulduzlar olindi!');
          }}
          onUnlockNext={() => {
            const nextLocked = WORKSHOP_META.find(
              (w) => !state.unlockedWorkshops.includes(w.id)
            );
            if (nextLocked) {
              const delta = Math.max(20, nextLocked.unlockXp - state.xp);
              rewardAndReact(delta, {
                source: 'dev-unlock',
                successMessage: `${nextLocked.title} ochildi!`,
              });
            } else {
              motionCore.emit('workshop:unlock', { id: 'sikllar' });
              setSpeechText('Barcha ustaxonalar allaqachon ochiq!');
            }
          }}
          onToggleSurface={() =>
            switchSurface(stateRef.current.surfaceMode === 'paper' ? 'blueprint' : 'paper')
          }
          onReset={() => {
            if (state.streak > 0) {
              motionCore.emit('streak:break', { previousStreak: state.streak });
            }
            try {
              window.localStorage.removeItem(DIAG_DONE_KEY);
            } catch {
              // ignore storage errors
            }
            setDiagCompleted(false);
            setState(clearWorkshopState());
            setActiveWorkshopId('algoritmlar');
            setMood('idle');
            setSpeechText(HERO_STRINGS.hud.defaultSay);
          }}
        />
      ) : null}
    </div>
  );
}
