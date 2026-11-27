'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MirzoRig } from '@/components/MirzoRig';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { SpeechBubble, type SpeechTone } from '@/components/ui/SpeechBubble';
import { Stars } from '@/components/ui/Stars';
import { TermChip } from '@/components/ui/TermChip';
import { Toggle } from '@/components/ui/Toggle';
import { playWorkshopCue } from '@/lib/engine/sound';
import type { GlossaryTerm, LevelDef } from '@/lib/game/content/schemas';
import {
  createVmHistory,
  MIRZO_ISA_VERSION,
  rewindVmHistory,
  stepVmHistory,
  type BoardInstruction,
  type LevelEvaluationResult,
  type RunnableLevelSpec,
  type VmHistory,
  type VmProgram,
} from '@/lib/game/core';
import { applySkillEvidence, createInitialSkillProgress } from '@/lib/game/mastery/model';
import { runLevelTestsInWorker } from '@/lib/game/worker/client';
import type { Locale } from '@/lib/i18n/types';
import { loadProgressV2, requestPersistentStorage, saveProgressV2 } from '@/lib/storage/idb';
import type { ProgressV2 } from '@/lib/storage/schema';
import { VmBoardEditor } from './VmBoardEditor';

const KIND_LABELS: Record<LevelDef['kind'], string> = {
  build: 'Qurish',
  arrange: 'Tartiblash',
  predict: 'Taxmin',
  debug: 'Xatoni top',
  modify: 'Oʻzgartirish',
  boss: 'Imtihon',
  sandbox: 'Erkin ustaxona',
};

interface DebugEvent {
  atMs: number;
  event: string;
  detail?: string;
}

function getInitialInstructions(level: LevelDef): BoardInstruction[] {
  const starter = level.starterProgram;
  if (starter && starter.engine === 'vm' && starter.program.mode === 'board') {
    return JSON.parse(JSON.stringify(starter.program.instructions)) as BoardInstruction[];
  }
  return [];
}

function getInitialVars(level: LevelDef): Record<string, number> | undefined {
  const starter = level.starterProgram;
  if (starter && starter.engine === 'vm' && starter.program.mode === 'board') {
    return starter.program.initialVars;
  }
  return undefined;
}

function extractFirstInputs(level: LevelDef): number[] {
  const first = level.tests.visible[0]?.input['inputs'];
  return Array.isArray(first)
    ? first.filter((x): x is number => typeof x === 'number')
    : [];
}

function extractFirstVars(level: LevelDef): Record<string, number> | undefined {
  const first = level.tests.visible[0]?.input['vars'];
  if (first && typeof first === 'object' && !Array.isArray(first)) {
    return first as Record<string, number>;
  }
  return getInitialVars(level);
}

export function MirzoGameIsland({
  locale,
  level,
  nextLevelId,
  glossaryTerms,
  lessonHref,
}: {
  locale: Locale;
  level: LevelDef;
  nextLevelId: string | null;
  glossaryTerms: GlossaryTerm[];
  lessonHref: string;
}) {
  const [instructions, setInstructions] = useState<BoardInstruction[]>(() =>
    getInitialInstructions(level)
  );
  const [sandboxInputsText, setSandboxInputsText] = useState(() =>
    extractFirstInputs(level).join(', ')
  );
  const [progress, setProgress] = useState<ProgressV2 | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [textMode, setTextMode] = useState(false);

  // Level loop state: Watch -> Predict -> Build/Run/Test -> Reflect -> Reward
  const [watchOpen, setWatchOpen] = useState(Boolean(level.workedExample));
  const [watchStepIdx, setWatchStepIdx] = useState(0);
  const [predictChoice, setPredictChoice] = useState<number | null>(null);
  const [predictCommitted, setPredictCommitted] = useState(
    !level.predictPrompt
  );

  const [hintsShown, setHintsShown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [testing, setTesting] = useState(false);
  const [evalResult, setEvalResult] = useState<LevelEvaluationResult | null>(null);
  const [reflectChoice, setReflectChoice] = useState<number | null>(null);
  const [completedSaved, setCompletedSaved] = useState(false);
  const [xpDelta, setXpDelta] = useState(0);

  // Live simulation & time-travel rewind
  const initialInputs = useMemo(() => {
    if (level.kind === 'sandbox') {
      return sandboxInputsText
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n));
    }
    return extractFirstInputs(level);
  }, [level, sandboxInputsText]);

  const activeProgram: VmProgram = useMemo(
    () => ({
      isaVersion: MIRZO_ISA_VERSION,
      mode: 'board',
      initialVars: extractFirstVars(level),
      instructions,
    }),
    [level, instructions]
  );

  const [history, setHistory] = useState<VmHistory>(() =>
    createVmHistory(activeProgram, initialInputs)
  );
  const [isPlaying, setIsPlaying] = useState(false);

  // Mirzo coach state
  const [mirzoMood, setMirzoMood] = useState<'idle' | 'think' | 'happy' | 'oops' | 'cheer' | 'fix'>('idle');
  const [coachMessage, setCoachMessage] = useState(
    level.goalText ?? 'Buyurtmani oʻqib, qadamlarni tekshirib koʻr!'
  );
  const [coachTone, setCoachTone] = useState<SpeechTone>('neutral');

  // Local-only ?debug playtest log
  const [debugMode, setDebugMode] = useState(false);
  const [debugEvents, setDebugEvents] = useState<DebugEvent[]>([]);
  const mountedAtRef = useRef<number>(0);

  const logDebug = (event: string, detail?: string) => {
    const nowMs = new Date().getTime();
    const elapsed = mountedAtRef.current > 0 ? nowMs - mountedAtRef.current : 0;
    setDebugEvents((prev) => [
      ...prev,
      { atMs: elapsed, event, detail },
    ]);
  };

  useEffect(() => {
    mountedAtRef.current = Date.now();
    const isDbg =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).has('debug');
    void loadProgressV2().then((p) => {
      if (isDbg) setDebugMode(true);
      setProgress(p);
      setSoundEnabled(p.settings.soundEnabled);
      setSubtitlesEnabled(p.settings.subtitlesEnabled);
      if (p.settings.dyslexiaFont && typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-dyslexia', 'true');
      }
    });
  }, []);

  // Reset VM history whenever instructions or sandbox inputs change
  const resetSimulation = (nextInstr = instructions, nextIns = initialInputs) => {
    setIsPlaying(false);
    const prog: VmProgram = {
      isaVersion: MIRZO_ISA_VERSION,
      mode: 'board',
      initialVars: extractFirstVars(level),
      instructions: nextInstr,
    };
    setHistory(createVmHistory(prog, nextIns));
    setEvalResult(null);
  };

  const handleInstructionsChange = (next: BoardInstruction[]) => {
    setInstructions(next);
    resetSimulation(next, initialInputs);
  };

  const handleStep = () => {
    playWorkshopCue('tap', soundEnabled);
    setHistory((prev) =>
      stepVmHistory(prev, activeProgram, level.maxTicks ?? 1000)
    );
  };

  const handleRewind = () => {
    playWorkshopCue('tap', soundEnabled);
    setIsPlaying(false);
    setHistory((prev) => rewindVmHistory(prev));
  };

  // Auto-play loop
  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setTimeout(() => {
      if (history.current.status !== 'ready' && history.current.status !== 'running') {
        setIsPlaying(false);
        return;
      }
      setHistory((prev) => {
        const next = stepVmHistory(prev, activeProgram, level.maxTicks ?? 1000);
        if (next.current.status === 'tick_limit') {
          setMirzoMood('fix');
          setCoachTone('danger');
          setCoachMessage(
            'Mirzo mashinasi cheksiz aylanib qoldi — siklni nima toʻxtatadi?'
          );
          setIsPlaying(false);
        } else if (next.current.status === 'error') {
          setMirzoMood('oops');
          setCoachTone('danger');
          setCoachMessage(`Xato yuz berdi: ${next.current.errorCode ?? 'tekshir'}.`);
          setIsPlaying(false);
        } else if (next.current.status === 'halted') {
          setIsPlaying(false);
        }
        return next;
      });
    }, 380);
    return () => clearTimeout(timer);
  }, [isPlaying, history, activeProgram, level.maxTicks]);

  const handleRevealHint = () => {
    if (level.hintsDisabled) return;
    const nextCount = Math.min(3, hintsShown + 1);
    setHintsShown(nextCount);
    const hintText = level.hints[nextCount - 1];
    if (hintText) {
      setMirzoMood('think');
      setCoachTone('hint');
      setCoachMessage(hintText);
      logDebug('hint_used', `tier=${nextCount}`);
    }
  };

  const handleRunTests = async () => {
    if (level.predictPrompt && !predictCommitted) {
      setMirzoMood('think');
      setCoachTone('hint');
      setCoachMessage('Avval yuqoridagi taxmin savoliga javob tanla!');
      return;
    }

    setTesting(true);
    setIsPlaying(false);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    // Step local simulation through to end on first visible case for immediate trace inspection
    let sim = createVmHistory(activeProgram, initialInputs);
    let guard = 0;
    while (
      (sim.current.status === 'ready' || sim.current.status === 'running') &&
      guard < (level.maxTicks ?? 1000) + 2
    ) {
      sim = stepVmHistory(sim, activeProgram, level.maxTicks ?? 1000);
      guard += 1;
    }
    setHistory(sim);

    try {
      const { result } = await runLevelTestsInWorker(
        level as unknown as RunnableLevelSpec,
        { engine: 'vm', program: activeProgram },
        hintsShown
      );
      setEvalResult(result);
      logDebug('test_run', `passed=${result.passedCount}/${result.totalCount},stars=${result.stars}`);

      if (result.passed) {
        playWorkshopCue('success', soundEnabled);
        setMirzoMood('happy');
        setCoachTone('success');
        setCoachMessage(
          level.reflectQuestion
            ? `Zoʻr! Barcha ${result.totalCount} ta sinov oʻtdi. Endi oxirgi xulosa savoliga javob ber.`
            : `Barakalla! Barcha ${result.totalCount} ta sinovdan ${result.stars} yulduz bilan oʻtding!`
        );
        if (!level.reflectQuestion) {
          await persistSuccess(result.stars, nextAttempts);
        }
      } else {
        playWorkshopCue('softError', soundEnabled);
        setMirzoMood(result.failingCase?.errorCode === 'tick_limit_exceeded' ? 'fix' : 'oops');
        setCoachTone('danger');
        const msgKey = result.matchedMisconception?.messageKey;
        const customFeedback =
          (msgKey && level.feedbackMessages?.[msgKey]) ||
          result.matchedMisconception?.misconception ||
          'Natija kutilganidan farq qildi — 1 takt bosib qadam-baqadam tekshir.';
        setCoachMessage(customFeedback);
      }
    } finally {
      setTesting(false);
    }
  };

  const persistSuccess = async (stars: 0 | 1 | 2 | 3, finalAttempts: number) => {
    if (completedSaved) return;
    const base = progress ?? (await loadProgressV2());
    const now = new Date().getTime();
    const prevLevel = base.levels[level.id];
    const bestStars = Math.max(prevLevel?.bestStars ?? 0, stars) as 0 | 1 | 2 | 3;

    const nextSkills = { ...base.skills };
    let totalXpAdded = 0;
    const predictCorrect =
      level.predictPrompt && predictChoice !== null
        ? predictChoice === level.predictPrompt.correctIndex
        : null;

    for (const skillId of level.skillIds) {
      const curSkill = nextSkills[skillId] ?? createInitialSkillProgress(skillId);
      const upd = applySkillEvidence(curSkill, {
        skillId,
        levelId: level.id,
        kind: level.kind,
        passed: true,
        firstTry: finalAttempts === 1,
        hintsUsed: hintsShown,
        predictCorrect,
        nowMs: now,
      });
      nextSkills[skillId] = upd.next;
      totalXpAdded += upd.xpAwarded;
    }

    const updated: ProgressV2 = {
      ...base,
      xp: base.xp + totalXpAdded,
      settings: {
        ...base.settings,
        soundEnabled,
        subtitlesEnabled,
      },
      levels: {
        ...base.levels,
        [level.id]: {
          bestStars,
          attempts: (prevLevel?.attempts ?? 0) + finalAttempts,
          hintsUsed: Math.min(prevLevel?.hintsUsed ?? 99, hintsShown),
          bestTicks:
            prevLevel?.bestTicks !== undefined
              ? Math.min(prevLevel.bestTicks, evalResult?.maxTicksUsed ?? prevLevel.bestTicks)
              : evalResult?.maxTicksUsed,
          updatedAt: now,
        },
      },
      skills: nextSkills,
      updatedAt: now,
    };

    await saveProgressV2(updated);
    void requestPersistentStorage();
    setProgress(updated);
    setXpDelta(totalXpAdded);
    setCompletedSaved(true);
    setMirzoMood('cheer');
    playWorkshopCue('levelUp', soundEnabled);
    logDebug('level_completed', `stars=${stars},xp=${totalXpAdded}`);
  };

  const handleToggleSound = async (next: boolean) => {
    setSoundEnabled(next);
    if (progress) {
      const updated = {
        ...progress,
        settings: { ...progress.settings, soundEnabled: next },
      };
      setProgress(updated);
      await saveProgressV2(updated);
    }
  };

  const handleToggleSubtitles = async (next: boolean) => {
    setSubtitlesEnabled(next);
    if (progress) {
      const updated = {
        ...progress,
        settings: { ...progress.settings, subtitlesEnabled: next },
      };
      setProgress(updated);
      await saveProgressV2(updated);
    }
  };

  const snap = history.current;
  const traceEntries = [...history.past, history.current]
    .map((s) => s.lastTrace)
    .filter((t): t is NonNullable<typeof t> => t !== null);
  const workedSteps = level.workedExample?.steps ?? [];
  const activeWorkedStep = workedSteps[watchStepIdx];

  return (
    <div className="space-y-6">
      {/* Top Bar: Back, Title, Kind badge, Accessibility/Audio toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--r-panel)] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-4 shadow-[var(--sh-2)]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-[13.5px] font-bold">
            <Link
              href={`/${locale}/play`}
              className="inline-flex min-h-[44px] items-center rounded-[8px] border border-[var(--line)] px-3 text-[var(--info-ink)] no-underline hover:border-[var(--accent)]"
            >
              ← Ustaxonalar
            </Link>
            <span className="rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface-inset)] px-2.5 py-1 text-[var(--reward-ink)]">
              {KIND_LABELS[level.kind]}
            </span>
            {level.customerName ? (
              <span className="text-[var(--on-surface-muted)]">
                Buyurtmachi: {level.customerName}
              </span>
            ) : null}
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold sm:text-3xl">
            {level.orderNumber ? `${level.orderNumber}. ` : ''}
            {level.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Toggle
            label="Matn rejimi"
            checked={textMode}
            onChange={setTextMode}
          />
          <Toggle
            label="Ovoz"
            checked={soundEnabled}
            onChange={(v) => void handleToggleSound(v)}
          />
          <Toggle
            label="Subtitr"
            checked={subtitlesEnabled}
            onChange={(v) => void handleToggleSubtitles(v)}
          />
        </div>
      </div>

      {/* Step 1: Order + Visible Cases + TermChips */}
      <Panel variant="chamfered" state="active" className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--reward-ink)]">
              1. Buyurtma vazifasi
            </h2>
            <p className="text-[16.5px] font-medium text-[var(--on-surface)]">
              {level.goalText ?? level.title}
            </p>
          </div>
          <Link
            href={lessonHref}
            className="inline-flex min-h-[48px] items-center rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface-inset)] px-3.5 text-[14px] font-bold text-[var(--info-ink)] no-underline hover:border-[var(--accent)]"
          >
            Dars varagʻini ochish
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {level.tests.visible.map((tc) => (
            <div
              key={tc.id}
              className="ws-tabular rounded-[10px] border border-[var(--line)] bg-[var(--surface-inset)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[13.5px]"
            >
              <span className="text-[var(--on-surface-muted)]">Kirish: </span>
              <span className="font-bold text-[var(--on-surface)]">
                {JSON.stringify(tc.input)}
              </span>
              <span className="mx-1.5 text-[var(--reward-ink)]">→</span>
              <span className="font-bold text-[var(--ok-ink)]">
                {JSON.stringify(tc.expected)}
              </span>
            </div>
          ))}
        </div>

        {glossaryTerms.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {glossaryTerms.slice(0, 4).map((gt) => (
              <TermChip
                key={gt.slug}
                term={gt.term}
                definition={gt.shortDef}
                example={gt.example}
                glossaryHref={`/${locale}/glossary/${gt.slug}`}
              />
            ))}
          </div>
        ) : null}
      </Panel>

      {/* Step 2: Watch (skippable worked example) */}
      {watchOpen && level.workedExample ? (
        <Panel variant="elevated" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--info-ink)]">
              2. Kuzat: {level.workedExample.title}
            </h2>
            <Button variant="ghost" onClick={() => setWatchOpen(false)}>
              Oʻtkazib yuborish
            </Button>
          </div>
          {activeWorkedStep ? (
            <div className="rounded-[12px] border border-[var(--line-strong)] bg-[var(--surface-inset)] p-4">
              <p className="font-[family-name:var(--font-mono)] text-[15px] font-bold text-[var(--reward-ink)]">
                {activeWorkedStep.instructionText}
              </p>
              <p className="mt-1.5 text-[15px] text-[var(--on-surface)]">
                {activeWorkedStep.note}
              </p>
              {activeWorkedStep.vars ? (
                <p className="ws-tabular mt-2 font-[family-name:var(--font-mono)] text-[13.5px] text-[var(--ok-ink)]">
                  Qutilar: {JSON.stringify(activeWorkedStep.vars)}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="ws-tabular text-[13.5px] font-bold text-[var(--on-surface-muted)]">
              Qadam {watchStepIdx + 1} / {workedSteps.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={watchStepIdx === 0}
                onClick={() => setWatchStepIdx((i) => Math.max(0, i - 1))}
              >
                Oldingi
              </Button>
              {watchStepIdx < workedSteps.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={() => setWatchStepIdx((i) => i + 1)}
                >
                  Keyingi qadam
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setWatchOpen(false)}>
                  Tushundim, boshlaymiz!
                </Button>
              )}
            </div>
          </div>
        </Panel>
      ) : null}

      {/* Step 3: Predict before run */}
      {level.predictPrompt ? (
        <Panel variant="elevated" state={predictCommitted ? 'success' : 'warning'} className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
            3. Avval taxmin qil
          </h2>
          <p className="text-[16px] font-medium">{level.predictPrompt.question}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {level.predictPrompt.options.map((opt, idx) => {
              const selected = predictChoice === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={predictCommitted}
                  onClick={() => setPredictChoice(idx)}
                  aria-pressed={selected}
                  className={`min-h-[48px] cursor-pointer rounded-[12px] border-2 px-3 py-2 text-left text-[15px] font-bold ${
                    selected
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]'
                      : 'border-[var(--line-strong)] bg-[var(--surface-inset)] text-[var(--on-surface)]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {!predictCommitted ? (
            <Button
              variant="primary"
              disabled={predictChoice === null}
              onClick={() => {
                setPredictCommitted(true);
                const right = predictChoice === level.predictPrompt?.correctIndex;
                setMirzoMood(right ? 'happy' : 'think');
                setCoachTone(right ? 'success' : 'hint');
                setCoachMessage(
                  right
                    ? `Ajoyib taxmin! Endi mashinada oʻzing sinab koʻr.`
                    : `Qiziq taxmin! ${level.predictPrompt?.explanation ?? ''} Endi 1 takt bosib tekshir.`
                );
                logDebug('predict', `correct=${String(right)}`);
              }}
            >
              Taxminni tasdiqlash
            </Button>
          ) : (
            <div className="grid gap-2 rounded-[10px] border border-[var(--line)] bg-[var(--surface-inset)] p-3 text-[14.5px] sm:grid-cols-2">
              <p>
                <strong>Sening taxmining:</strong>{' '}
                {predictChoice !== null ? level.predictPrompt.options[predictChoice] : '—'}
              </p>
              <p>
                <strong>Toʻgʻri javob:</strong>{' '}
                {level.predictPrompt.options[level.predictPrompt.correctIndex]}
              </p>
            </div>
          )}
        </Panel>
      ) : null}

      {/* Main Workspace Grid: Left = Program Board | Right = Mirzo + Machine View */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel variant="elevated" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
              4. Buyruqlar doskasi ({instructions.filter((i) => i.op !== 'LABEL').length} buyruq · Par: {level.par.instructions ?? '—'})
            </h2>
            <div className="flex flex-wrap gap-2">
              {!level.hintsDisabled ? (
                <Button variant="secondary" onClick={handleRevealHint} disabled={hintsShown >= 3}>
                  Maslahat ({hintsShown}/3)
                </Button>
              ) : (
                <span className="inline-flex min-h-[44px] items-center rounded-[10px] border border-[var(--line)] px-3 text-[13px] font-bold text-[var(--on-surface-muted)]">
                  Imtihon: maslahatsiz
                </span>
              )}
              <Button
                variant="ghost"
                onClick={() => {
                  const initial = getInitialInstructions(level);
                  setInstructions(initial);
                  resetSimulation(initial, initialInputs);
                }}
              >
                Qaytadan boshla
              </Button>
            </div>
          </div>

          {level.kind === 'sandbox' ? (
            <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface-inset)] p-3">
              <label htmlFor="sandbox-inputs" className="text-[14px] font-bold">
                Sinov kirishlari (vergul bilan):
              </label>
              <input
                id="sandbox-inputs"
                type="text"
                value={sandboxInputsText}
                onChange={(e) => setSandboxInputsText(e.target.value)}
                className="min-h-[44px] flex-1 rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] px-3 font-[family-name:var(--font-mono)] text-[14px]"
              />
            </div>
          ) : null}

          <VmBoardEditor
            instructions={instructions}
            allowedParts={level.parts}
            activePc={snap.status === 'ready' || snap.status === 'running' ? snap.pc : null}
            errorLineIndex={snap.errorLineIndex}
            readOnly={level.kind === 'predict'}
            arrangeOnly={level.kind === 'arrange'}
            textMode={textMode}
            onChange={handleInstructionsChange}
          />
        </Panel>

        <div className="space-y-4">
          {/* Mirzo Coach */}
          <Panel variant="chamfered" className="space-y-3">
            <div className="flex items-center gap-3">
              <MirzoRig mood={mirzoMood} size={96} className="shrink-0" />
              <div className="flex-1">
                <SpeechBubble
                  text={coachMessage}
                  tone={coachTone}
                  subtitlesEnabled={subtitlesEnabled}
                  tailPosition="left"
                />
              </div>
            </div>

            {/* Run & Time-travel controls */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="secondary" onClick={handleStep}>
                1 takt bos
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsPlaying((p) => !p)}
              >
                {isPlaying ? 'Pauza' : 'Ishga tushir'}
              </Button>
              <Button
                variant="ghost"
                onClick={handleRewind}
                disabled={history.past.length === 0}
              >
                Orqaga qaytar
              </Button>
              <Button
                variant="primary"
                loading={testing}
                onClick={() => void handleRunTests()}
              >
                Tekshir
              </Button>
            </div>
          </Panel>

          {/* Machine State View */}
          <Panel variant="inset" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-[family-name:var(--font-display)] text-base font-extrabold">
                5. Mirzo mashinasi holati
              </h2>
              <span className="ws-tabular rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[13px] font-bold">
                Takt: {snap.tick} · Holat: {snap.status}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[13px] font-bold text-[var(--on-surface-muted)]">
                  Oʻzgaruvchi qutilar:
                </p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {Object.keys(snap.vars).length === 0 ? (
                    <span className="text-[14px] text-[var(--on-surface-muted)]">Hali boʻsh</span>
                  ) : (
                    Object.entries(snap.vars).map(([k, v]) => (
                      <div
                        key={k}
                        className="ws-tabular rounded-[10px] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[14px] font-bold"
                      >
                        <span className="text-[var(--on-surface-muted)]">{k}: </span>
                        <span className="text-[var(--reward-ink)]">{v}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-[13px] font-bold text-[var(--on-surface-muted)]">
                  Chiqish (OUT):
                </p>
                <div className="ws-tabular mt-1.5 rounded-[10px] border-2 border-[var(--ok)]/50 bg-[var(--surface-raised)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[15px] font-extrabold text-[var(--ok-ink)]">
                  {snap.outputs.length > 0 ? snap.outputs.join(', ') : '—'}
                </div>
              </div>
            </div>

            {Object.keys(snap.lists).length > 0 ? (
              <div>
                <p className="text-[13px] font-bold text-[var(--on-surface-muted)]">
                  Roʻyxatlar (0-indeksdan boshlanadi):
                </p>
                <div className="mt-1.5 space-y-1.5">
                  {Object.entries(snap.lists).map(([name, items]) => (
                    <div
                      key={name}
                      className="flex flex-wrap items-center gap-1.5 font-[family-name:var(--font-mono)] text-[13.5px]"
                    >
                      <span className="font-bold text-[var(--info-ink)]">{name}:</span>
                      {items.map((item, i) => (
                        <span
                          key={i}
                          className="ws-tabular rounded border border-[var(--line-strong)] bg-[var(--surface-raised)] px-2 py-0.5"
                        >
                          [{i}]={item}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <p className="text-[13px] font-bold text-[var(--on-surface-muted)]">
                Qadamlar izi (Trace log):
              </p>
              <ul className="mt-1.5 max-h-40 space-y-1 overflow-y-auto font-[family-name:var(--font-mono)] text-[12.5px]">
                {traceEntries.length === 0 ? (
                  <li className="text-[var(--on-surface-muted)]">
                    Hali takt bajarilmadi. «1 takt bos» tugmasini bosing.
                  </li>
                ) : (
                  traceEntries.slice(-8).map((entry, idx) => (
                    <li
                      key={idx}
                      className="rounded border border-[var(--line)] bg-[var(--surface-raised)] px-2.5 py-1"
                    >
                      <span className="ws-tabular font-bold text-[var(--reward-ink)]">
                        #{entry.tick}
                      </span>{' '}
                      {entry.summary}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </Panel>
        </div>
      </div>

      {/* Step 6: Test Evaluation Details */}
      {evalResult ? (
        <Panel
          variant="elevated"
          state={evalResult.passed ? 'success' : 'danger'}
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
                {evalResult.passed
                  ? `Barcha ${evalResult.totalCount} ta sinov muvaffaqiyatli oʻtdi!`
                  : `Sinov natijasi: ${evalResult.passedCount} / ${evalResult.totalCount} oʻtdi`}
              </h2>
              <p className="ws-tabular text-[14px] text-[var(--on-surface-muted)]">
                Ishlatilgan buyruqlar: {evalResult.instructionsCount} · Maksimal takt: {evalResult.maxTicksUsed}
              </p>
            </div>
            <Stars earned={evalResult.stars} showNumeric size={26} />
          </div>

          {!evalResult.passed && evalResult.failingCase ? (
            <div className="rounded-[12px] border border-[var(--danger)] bg-[var(--surface-inset)] p-4 font-[family-name:var(--font-mono)] text-[13.5px]">
              <p className="font-bold text-[var(--danger-ink)]">
                Qolib ketgan sinov ({evalResult.failingCase.visibility}):
              </p>
              <p className="mt-1">
                Kutilgan: {JSON.stringify(evalResult.failingCase.expected)}
              </p>
              <p>Chiqdi: {JSON.stringify(evalResult.failingCase.actual)}</p>
            </div>
          ) : null}

          {/* Step 7: Reflect question (only after passing!) */}
          {evalResult.passed && level.reflectQuestion && !completedSaved ? (
            <div className="space-y-3 rounded-[14px] border-2 border-[var(--accent)] bg-[var(--surface-inset)] p-4">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
                Oxirgi qadam — Nega bu ishladi?
              </h3>
              <p className="text-[16px] font-medium">{level.reflectQuestion.question}</p>
              <div className="grid gap-2">
                {level.reflectQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={async () => {
                      setReflectChoice(idx);
                      if (idx === level.reflectQuestion?.correctIndex) {
                        await persistSuccess(evalResult.stars, attempts);
                      } else {
                        setMirzoMood('think');
                        setCoachTone('hint');
                        setCoachMessage(level.reflectQuestion?.explanation ?? 'Yana oʻylab koʻr.');
                      }
                    }}
                    className={`min-h-[48px] cursor-pointer rounded-[12px] border-2 px-4 py-2.5 text-left text-[15px] font-bold ${
                      reflectChoice === idx
                        ? 'border-[var(--accent)] bg-[var(--surface-raised)]'
                        : 'border-[var(--line-strong)] bg-[var(--surface)]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Step 8: Reward + Next level CTA */}
          {completedSaved ? (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border-2 border-[var(--ok)] bg-[var(--ok)]/15 p-4">
              <div>
                <p className="font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--ok-ink)]">
                  Buyurtma bajarildi! +{xpDelta} XP mahoratga qoʻshildi
                </p>
                <p className="text-[14.5px] text-[var(--on-surface)]">
                  Natijang qurilmangga saqlandi.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {nextLevelId ? (
                  <Link
                    href={`/${locale}/play/${level.workshop}/${nextLevelId}`}
                    className="ws-key-btn ws-key-btn--primary min-h-[48px] px-5 no-underline"
                  >
                    Keyingi buyurtma →
                  </Link>
                ) : null}
                <Link
                  href={`/${locale}/map`}
                  className="ws-key-btn ws-key-btn--secondary min-h-[48px] px-5 no-underline"
                >
                  Bilim xaritasi
                </Link>
              </div>
            </div>
          ) : null}
        </Panel>
      ) : null}

      {/* Hidden ?debug local-only playtest telemetry log */}
      {debugMode ? (
        <Panel variant="inset" className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-mono)] text-sm font-bold">
              Local Playtest Debug Log (?debug)
            </h2>
            <Button
              variant="secondary"
              onClick={() => {
                const blob = new Blob([JSON.stringify(debugEvents, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `playtest-${level.id}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export JSON
            </Button>
          </div>
          <pre className="max-h-32 overflow-auto text-[12px]">
            {JSON.stringify(debugEvents, null, 2)}
          </pre>
        </Panel>
      ) : null}
    </div>
  );
}
