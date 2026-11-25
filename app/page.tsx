/**
 * Main Workshop Page:
 * - Coordinates Paper ("Understand": Hero, Darslar, Tamoyillar) <-> Blueprint ("Play": Workshop HUD, Xarita, Oʻyinlar)
 * - Uses View Transitions clip-path iris from click coordinates + shared Mirzo stage
 * - Single shared pointer handler for Mirzo gaze + grid spotlight
 * - Connects DiagnosticModal, Darslar, Xarita, 3 Ustaxona, and Tamoyillar with persistent localStorage state
 */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { PhPlay } from '@/components/icons/WorkshopIcons';
import { HeroSection } from '@/components/HeroSection';
import { NetworkBackdrop } from '@/components/NetworkBackdrop';
import { WorkshopHeader, type NavSectionId } from '@/components/WorkshopHeader';
import { DevWorkshopPanel } from '@/components/DevWorkshopPanel';
import { DiagnosticModal } from '@/components/ui/DiagnosticModal';
import { DarslarSection } from '@/components/sections/DarslarSection';
import { XaritaSection } from '@/components/sections/XaritaSection';
import { GamesSection } from '@/components/sections/GamesSection';
import { TamoyillarSection } from '@/components/sections/TamoyillarSection';
import { MACHINE_TICKS, WORKSHOPS, type LessonItem, type WorkshopTask } from '@/lib/data/workshop';
import { fireWorkshopConfetti } from '@/lib/engine/confetti';
import { WORKSHOP_STRINGS } from '@/lib/engine/i18n';
import type { MirzoController, MirzoMood } from '@/lib/engine/mirzo';
import { applyXpReward } from '@/lib/engine/progression';
import {
  detectHardwareLiteDefaults,
  measureInitialFrames,
} from '@/lib/engine/quality';
import { playWorkshopCue } from '@/lib/engine/sound';
import {
  clearWorkshopState,
  createDefaultState,
  getLevelInfo,
  loadWorkshopState,
  saveWorkshopState,
  type WorkshopId,
  type WorkshopState,
} from '@/lib/engine/store';

export default function HomePage() {
  const [state, setState] = useState<WorkshopState>(() => createDefaultState());
  const [hydrated, setHydrated] = useState(false);
  const [activeNav, setActiveNav] = useState<NavSectionId>('darslar');
  const [activeWorkshopId, setActiveWorkshopId] = useState<WorkshopId>('algoritmlar');
  const [diagOpen, setDiagOpen] = useState(false);
  const [mood, setMood] = useState<MirzoMood>('idle');
  const [speechText, setSpeechText] = useState<string>(WORKSHOP_STRINGS.hud.defaultSay);
  const [nudgeError, setNudgeError] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [pointerPos, setPointerPos] = useState({ x: 720, y: 400 });
  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 });
  const mirzoRef = useRef<MirzoController | null>(null);

  useEffect(() => {
    const saved = loadWorkshopState();
    const hw = detectHardwareLiteDefaults();
    if (hw.saveData || hw.reducedMotion) {
      saved.liteMode = true;
    }
    queueMicrotask(() => {
      setState(saved);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveWorkshopState(state);
    const root = document.documentElement;
    root.setAttribute('data-surface', state.surfaceMode);
    root.setAttribute('data-lite', String(state.liteMode));
    root.setAttribute('data-motion-paused', String(state.motionPaused));
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated || state.liteMode) return;
    return measureInitialFrames(() => {
      setState((prev) => ({ ...prev, liteMode: true }));
    });
  }, [hydrated, state.liteMode]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || state.liteMode || state.motionPaused) return;
    document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
    document.documentElement.style.setProperty('--my', `${e.clientY}px`);
    setPointerPos({ x: e.clientX, y: e.clientY });

    const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    const ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
    setLookOffset({ x: nx, y: ny });
  };

  const handlePointerLeave = () => {
    setLookOffset({ x: 0, y: 0 });
  };

  const switchSurface = (
    nextSurface: 'paper' | 'blueprint',
    e?: React.MouseEvent<HTMLElement>
  ) => {
    if (state.surfaceMode === nextSurface) return;
    if (e) {
      document.documentElement.style.setProperty('--vt-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--vt-y', `${e.clientY}px`);
    }
    const apply = () => setState((prev) => ({ ...prev, surfaceMode: nextSurface }));
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (
      typeof doc.startViewTransition === 'function' &&
      !state.motionPaused &&
      !state.liteMode
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
      state.liteMode ||
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
    setMood(nextIdx === MACHINE_TICKS.length - 1 ? 'happy' : 'think');
    setSpeechText(MACHINE_TICKS[nextIdx].mirzoNote);
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
    const ws = WORKSHOPS.find((w) => w.id === id);
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
    }
  ) => {
    const outcome = applyXpReward(state, xpDelta, options);
    setState(outcome.nextState);

    if (outcome.leveledUp) {
      playWorkshopCue('levelUp', outcome.nextState.soundEnabled);
      setMood('cheer');
      mirzoRef.current?.celebrate(outcome.newLevel);
      setSpeechText(`${outcome.newLevel}-darajaga koʻtarilding! Yangi imkoniyatlar ochildi.`);
      void fireWorkshopConfetti({
        liteMode: outcome.nextState.liteMode,
        motionPaused: outcome.nextState.motionPaused,
      });
    } else {
      playWorkshopCue('success', outcome.nextState.soundEnabled);
      setMood('happy');
      mirzoRef.current?.setMood('happy');
      if (options?.successMessage) {
        setSpeechText(options.successMessage);
      }
      if (options?.markTaskId) {
        void fireWorkshopConfetti({
          liteMode: outcome.nextState.liteMode,
          motionPaused: outcome.nextState.motionPaused,
        });
      }
    }
  };

  const handleCompleteLesson = (lesson: LessonItem) => {
    const alreadyDone = state.completedLessons.includes(lesson.id);
    rewardAndReact(alreadyDone ? 0 : 20, {
      markLessonId: lesson.id,
      successMessage: alreadyDone
        ? `${lesson.id} takrorlandi! Endi ustaxonada sinab koʻr.`
        : `${lesson.id} oʻzlashtirildi! +20 XP qoʻshildi.`,
    });
  };

  const handleSoftError = (msg: string) => {
    playWorkshopCue('softError', state.soundEnabled);
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
      successMessage: alreadySolved
        ? 'Barakalla! Vazifa yana bir bor toʻgʻri yechildi.'
        : 'Barakalla! +25 XP va seriya olovi yondi!',
    });
  };

  const levelInfo = getLevelInfo(state.xp);

  return (
    <div
      data-surface={state.surfaceMode}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`ws-surface min-h-screen ${
        state.surfaceMode === 'paper' ? 'ws-paper-grain' : ''
      }`}
    >
      <NetworkBackdrop
        surfaceMode={state.surfaceMode}
        liteMode={state.liteMode}
        motionPaused={state.motionPaused}
        pointerPos={pointerPos}
      />

      <div className="relative z-10">
        <WorkshopHeader
          activeSection={activeNav}
          surfaceMode={state.surfaceMode}
          motionPaused={state.motionPaused}
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
            liteMode={state.liteMode}
            motionPaused={state.motionPaused}
            unlockedWorkshops={state.unlockedWorkshops}
            machineTick={state.machineTick}
            mood={mood}
            speechText={speechText}
            nudgeError={nudgeError}
            lookOffset={lookOffset}
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
          />

          <DarslarSection
            completedLessons={state.completedLessons}
            liteMode={state.liteMode}
            motionPaused={state.motionPaused}
            onCompleteLesson={handleCompleteLesson}
            onWrongPrediction={(lesson) =>
              handleSoftError(`${lesson.id} uchun yana bir bor oʻylab koʻramiz!`)
            }
            onGoGames={(e) => handleNavigate('oyinlar', true, e)}
          />

          <XaritaSection
            xp={state.xp}
            unlockedWorkshops={state.unlockedWorkshops}
            onOpenWorkshop={handleOpenWorkshop}
          />

          <GamesSection
            xp={state.xp}
            activeWorkshopId={activeWorkshopId}
            unlockedWorkshops={state.unlockedWorkshops}
            solvedTasks={state.solvedTasks}
            onSelectWorkshop={setActiveWorkshopId}
            onSolveTask={(task) => handleSolveTask(task)}
            onWrongTask={(task) => handleSoftError(task.hint)}
            onBackToLessons={(e) => handleNavigate('darslar', false, e)}
          />

          <TamoyillarSection
            liteMode={state.liteMode}
            motionPaused={state.motionPaused}
            onResetProgress={() => {
              setState(clearWorkshopState());
              setActiveWorkshopId('algoritmlar');
              setMood('idle');
              setSpeechText(WORKSHOP_STRINGS.hud.defaultSay);
            }}
          />
        </main>
      </div>

      {/* Diagnostic Modal ("Qisqa sinov") */}
      <DiagnosticModal
        open={diagOpen}
        onClose={() => setDiagOpen(false)}
        onComplete={(res) => {
          setDiagOpen(false);
          rewardAndReact(res.xpEarned, {
            successMessage: `Sinov yakunlandi! +${res.xpEarned} XP qoʻshildi.`,
          });
          setActiveWorkshopId(res.recommendedWorkshop);
          setActiveNav('oyinlar');
          switchSurface('blueprint');
          scrollToSection('oyinlar');
        }}
      />

      {/* Mobile sticky CTA bar after hero scrolls out of view */}
      {!heroVisible ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-[var(--line-strong)] bg-[var(--surface)]/95 p-3 md:hidden">
          <button
            type="button"
            onClick={handleStart}
            className="ws-key-btn ws-key-btn--primary min-h-[52px] w-full"
          >
            <span>{WORKSHOP_STRINGS.hero.primaryCta}</span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--on-accent)]/18">
              <PhPlay size={13} weight="fill" />
            </span>
          </button>
        </div>
      ) : null}

      <DevWorkshopPanel
        xp={state.xp}
        streak={state.streak}
        liteMode={state.liteMode}
        onAddXp={(delta) =>
          rewardAndReact(delta, {
            successMessage: `+${delta} XP qoʻshildi! Kolba toʻlyapti.`,
          })
        }
        onLevelUp={() =>
          rewardAndReact(120, {
            successMessage: 'Yangi daraja va yangi ustaxona ochildi!',
          })
        }
        onStreakPlus={() => {
          playWorkshopCue('success', state.soundEnabled);
          setState((prev) => ({ ...prev, streak: prev.streak + 1 }));
          setMood('happy');
          setSpeechText('Seriya olovi yondi!');
        }}
        onCorrect={() => {
          playWorkshopCue('success', state.soundEnabled);
          setMood('happy');
          mirzoRef.current?.setMood('happy');
          setSpeechText('Barakalla! Aniq va toʻgʻri.');
        }}
        onWrong={() =>
          handleSoftError('Hechqisi yoʻq — qadamni birga tekshiramiz.')
        }
        onToggleLite={() =>
          setState((prev) => ({ ...prev, liteMode: !prev.liteMode }))
        }
        onReset={() => {
          setState(clearWorkshopState());
          setActiveWorkshopId('algoritmlar');
          setMood('idle');
          setSpeechText(WORKSHOP_STRINGS.hud.defaultSay);
        }}
      />
    </div>
  );
}
