'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Code2,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import type { TraceProgram } from '@/lib/data/traces';
import { pickText, type LocaleScript } from '@/lib/engine/i18n';
import { MOTION_TOKENS } from '@/lib/motion/tokens';

interface TraceMachineProps {
  program: TraceProgram;
  script: LocaleScript;
  showRealCode: boolean;
  onToggleRealCode?: () => void;
  reducedMotion: boolean;
  compact?: boolean;
}

export function TraceMachine({
  program,
  script,
  showRealCode,
  onToggleRealCode,
  reducedMotion,
  compact = false,
}: TraceMachineProps) {
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [predictions, setPredictions] = useState<Record<number, string>>({});

  // Reset stepper cleanly when program changes without useEffect setState
  const [prevProgramId, setPrevProgramId] = useState(program.id);
  if (prevProgramId !== program.id) {
    setPrevProgramId(program.id);
    setFrameIdx(0);
    setPlaying(false);
    setPredictions({});
  }

  const frames = program.frames;
  const safeIdx = Math.min(frameIdx, Math.max(0, frames.length - 1));
  const frame = frames[safeIdx];
  const prevFrame = safeIdx > 0 ? frames[safeIdx - 1] : null;

  const gate = frame?.predictionGate;
  const predictedVal = predictions[safeIdx];
  const gateBlocked = Boolean(gate && !predictedVal);
  const isAtEnd = safeIdx >= frames.length - 1;

  // Auto-play timer: stops inside timer callback at prediction gate or final frame
  useEffect(() => {
    if (!playing) return;
    const intervalMs = reducedMotion ? 1800 : 1350;
    const timer = window.setInterval(() => {
      setFrameIdx((curr) => {
        const currFrame = frames[curr];
        if (currFrame?.predictionGate && !predictions[curr]) {
          setPlaying(false);
          return curr;
        }
        if (curr >= frames.length - 1) {
          setPlaying(false);
          return curr;
        }
        return curr + 1;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [playing, frames, predictions, reducedMotion]);

  const goBack = () => {
    setPlaying(false);
    setFrameIdx((i) => Math.max(0, i - 1));
  };

  const goNext = () => {
    if (gateBlocked || isAtEnd) return;
    setFrameIdx((i) => Math.min(frames.length - 1, i + 1));
  };

  const resetTrace = () => {
    setPlaying(false);
    setFrameIdx(0);
    setPredictions({});
  };

  const togglePlay = () => {
    if (gateBlocked) return;
    if (isAtEnd) {
      setFrameIdx(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPlaying(false);
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goBack();
    } else if (e.key === ' ') {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'BUTTON') {
        e.preventDefault();
        togglePlay();
      }
    }
  };

  const changedSummary = frame.changedVars
    .map((name) => {
      const oldVal = prevFrame?.vars[name];
      const newVal = frame.vars[name];
      return oldVal !== undefined ? `${name}: ${oldVal} -> ${newVal}` : `${name}: ${newVal}`;
    })
    .join(', ');

  const t =
    script === 'uz-Cyrl'
      ? {
          machineLabel: 'Мирзо машинаси (қаторма-қатор)',
          stepLabel: 'Қадам',
          memoryTitle: 'Хотира қутилари',
          emptyVars: 'Ҳали ўзгарувчи яратилмаган',
          changedBadge: 'ўзгарди',
          outputTitle: 'Экран натижаси',
          emptyOut: 'Экранга ҳали ҳеч нарса чиқмади',
          back: 'Орқага',
          next: 'Кейинги',
          play: 'Ижро',
          pause: 'Пауза',
          reset: 'Бошидан',
          predictPrompt: 'Давом этишдан олдин тахмин қил:',
          predictCorrect: 'Тўғри тахмин! Энди "Кейинги" ни босиб кузат.',
          predictWrongPrefix: 'Қизиқ тахмин! Энди "Кейинги" ни босиб аслида нима бўлишини кўр. (Тўғри жавоб:',
          pythonHeader: 'Ҳақиқий код (Python)',
          pseudoHeader: 'Ўзбекча псевдокод',
          keysHint: 'Клавиатура: ← орқага · → кейинги · Space ижро',
        }
      : {
          machineLabel: 'Mirzo mashinasi (qatorma-qator)',
          stepLabel: 'Qadam',
          memoryTitle: 'Xotira qutilari',
          emptyVars: 'Hali oʻzgaruvchi yaratilmagan',
          changedBadge: 'oʻzgardi',
          outputTitle: 'Ekran natijasi',
          emptyOut: 'Ekranga hali hech narsa chiqmadi',
          back: 'Orqaga',
          next: 'Keyingi',
          play: 'Ijro',
          pause: 'Pauza',
          reset: 'Boshidan',
          predictPrompt: 'Davom etishdan oldin taxmin qil:',
          predictCorrect: 'Toʻgʻri taxmin! Endi "Keyingi" ni bosib kuzat.',
          predictWrongPrefix: 'Qiziq taxmin! Endi "Keyingi" ni bosib aslida nima boʻlishini koʻr. (Toʻgʻri javob:',
          pythonHeader: 'Haqiqiy kod (Python)',
          pseudoHeader: 'Oʻzbekcha psevdokod',
          keysHint: 'Klaviatura: ← orqaga · → keyingi · Space ijro',
        };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${pickText(program.title, script)} — ${t.machineLabel}`}
      className="rounded-2xl bg-[#0E1A2B] text-[#F4F6FA] border border-[#243957] p-4 sm:p-5 space-y-4 focus-visible:outline-3 focus-visible:outline-[#F59E0B]"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#243957] pb-3">
        <div>
          <p className="text-xs font-medium text-[#94A3B8]">{t.machineLabel}</p>
          <h4 className="font-display text-base sm:text-lg font-bold text-white">
            {pickText(program.title, script)}
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onToggleRealCode && (
            <button
              type="button"
              onClick={onToggleRealCode}
              aria-pressed={showRealCode}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                showRealCode
                  ? 'bg-[#0F4C81] border-[#38BDF8] text-white'
                  : 'bg-[#17273E] border-[#243957] text-[#B8C4D6] hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.pythonHeader}</span>
            </button>
          )}
          <span className="text-xs font-bold text-[#F59E0B] tabular-nums px-2.5 py-1 rounded-lg bg-[#17273E]">
            {t.stepLabel} {safeIdx + 1} / {frames.length}
          </span>
        </div>
      </div>

      {/* Main Grid: Code + Memory Boxes & Output */}
      <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-12' : 'lg:grid-cols-12'} gap-4`}>
        {/* Code Column(s) */}
        <div className={`${compact ? 'md:col-span-7' : 'lg:col-span-7'} space-y-3`}>
          <div className={`grid grid-cols-1 ${showRealCode ? 'sm:grid-cols-2' : ''} gap-3`}>
            <div className="rounded-xl bg-[#09121E] border border-[#243957] p-3 font-code text-xs sm:text-sm overflow-x-auto">
              {showRealCode && (
                <p className="text-[11px] font-sans font-semibold text-[#94A3B8] mb-2">
                  {t.pseudoHeader}
                </p>
              )}
              <div className="space-y-1">
                {program.codeLines.map((lineText, idx) => {
                  const lineNo = idx + 1;
                  const active = frame.line === lineNo;
                  return (
                    <div
                      key={`${program.id}-uz-${lineNo}`}
                      aria-current={active ? 'step' : undefined}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-colors ${
                        active
                          ? 'bg-[#0F4C81]/55 border-[#F59E0B] text-white font-semibold'
                          : 'border-transparent text-[#CBD5E1]'
                      }`}
                    >
                      <span className="w-4 shrink-0 flex items-center justify-center">
                        {active ? (
                          <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
                        ) : (
                          <span className="text-[11px] text-[#64748B] tabular-nums">{lineNo}</span>
                        )}
                      </span>
                      <span className="whitespace-pre">{lineText}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {showRealCode && (
              <div className="rounded-xl bg-[#09121E] border border-[#243957] p-3 font-code text-xs sm:text-sm overflow-x-auto">
                <p className="text-[11px] font-sans font-semibold text-[#38BDF8] mb-2">
                  {t.pythonHeader}
                </p>
                <div className="space-y-1">
                  {program.pythonLines.map((lineText, idx) => {
                    const lineNo = idx + 1;
                    const active = frame.line === lineNo;
                    return (
                      <div
                        key={`${program.id}-py-${lineNo}`}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border ${
                          active
                            ? 'bg-[#0F4C81]/45 border-[#38BDF8] text-white font-semibold'
                            : 'border-transparent text-[#CBD5E1]'
                        }`}
                      >
                        <span className="w-4 shrink-0 text-[11px] text-[#64748B] tabular-nums">
                          {lineNo}
                        </span>
                        <span className="whitespace-pre">{lineText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Frame Note */}
          <div
            aria-live="polite"
            className="rounded-xl bg-[#17273E] border border-[#243957] px-3.5 py-2.5 text-xs sm:text-sm text-[#E2E8F0]"
          >
            <p>{pickText(frame.note, script)}</p>
            {changedSummary && (
              <p className="sr-only">
                {changedSummary}
              </p>
            )}
          </div>
        </div>

        {/* Memory Boxes & Output */}
        <div className={`${compact ? 'md:col-span-5' : 'lg:col-span-5'} space-y-3`}>
          {/* Memory Boxes */}
          <div className="rounded-xl bg-[#17273E] border border-[#243957] p-3.5 space-y-2.5">
            <p className="text-xs font-semibold text-[#B8C4D6]">{t.memoryTitle}</p>
            {Object.keys(frame.vars).length === 0 ? (
              <p className="text-xs text-[#94A3B8]">{t.emptyVars}</p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(frame.vars).map(([varName, val]) => {
                  const changed = frame.changedVars.includes(varName);
                  return (
                    <motion.div
                      key={`${varName}-${String(val)}`}
                      initial={
                        changed && !reducedMotion
                          ? { scale: 0.92, opacity: 0.65 }
                          : false
                      }
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: MOTION_TOKENS.duration.fast }}
                      className={`rounded-xl p-2.5 border ${
                        changed
                          ? 'bg-[#0F4C81]/45 border-[#F59E0B]'
                          : 'bg-[#0E1A2B] border-[#243957]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-code text-xs text-[#94A3B8]">{varName}</span>
                        {changed && (
                          <span className="text-[10px] font-bold text-[#FDE68A]">
                            {t.changedBadge}
                          </span>
                        )}
                      </div>
                      <p className="font-code text-lg font-bold text-white tabular-nums mt-0.5">
                        {String(val)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="rounded-xl bg-[#09121E] border border-[#243957] p-3.5 space-y-2">
            <p className="text-xs font-semibold text-[#B8C4D6] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#34D399]" aria-hidden="true" />
              <span>{t.outputTitle}</span>
            </p>
            {frame.output.length === 0 ? (
              <p className="text-xs font-code text-[#64748B]">{t.emptyOut}</p>
            ) : (
              <div className="font-code text-sm text-[#34D399] space-y-0.5">
                {frame.output.map((outLine, i) => (
                  <p key={`${program.id}-out-${i}`}>{outLine}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prediction Gate (when frame has one) */}
      {gate && (
        <div className="rounded-xl bg-[#17273E] border border-[#F59E0B]/60 p-3.5 space-y-2.5">
          <div className="flex items-start gap-2 text-xs sm:text-sm font-semibold text-[#FDE68A]">
            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#F59E0B]">
                {t.predictPrompt}
              </p>
              <p>{pickText(gate.prompt, script)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {gate.options.map((opt) => {
              const isChosen = predictedVal === opt;
              const isRight = opt === gate.correctValue;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setPredictions((prev) => ({ ...prev, [safeIdx]: opt }))
                  }
                  className={`px-4 py-2 min-h-[40px] rounded-lg border font-code text-sm font-bold transition-colors cursor-pointer ${
                    isChosen
                      ? isRight
                        ? 'bg-[#047857] border-[#34D399] text-white'
                        : 'bg-[#9A5B00] border-[#F59E0B] text-white'
                      : 'bg-[#0E1A2B] border-[#243957] hover:border-[#F59E0B] text-[#E2E8F0]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {predictedVal && (
            <p
              role="status"
              className={`text-xs font-medium ${
                predictedVal === gate.correctValue ? 'text-[#34D399]' : 'text-[#FDE68A]'
              }`}
            >
              {predictedVal === gate.correctValue
                ? t.predictCorrect
                : `${t.predictWrongPrefix} ${gate.correctValue})`}
            </p>
          )}
        </div>
      )}

      {/* Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            disabled={safeIdx === 0}
            className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-lg bg-[#17273E] border border-[#243957] hover:border-[#38BDF8] disabled:opacity-40 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>{t.back}</span>
          </button>

          <button
            type="button"
            onClick={togglePlay}
            disabled={gateBlocked}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg bg-[#0F4C81] hover:bg-[#155E9E] disabled:opacity-40 text-white text-xs sm:text-sm font-semibold cursor-pointer"
          >
            {playing ? (
              <>
                <Pause className="w-4 h-4" aria-hidden="true" />
                <span>{t.pause}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" aria-hidden="true" />
                <span>{t.play}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={gateBlocked || isAtEnd}
            className="inline-flex items-center gap-1 px-3.5 py-2 min-h-[40px] rounded-lg bg-[#047857] hover:bg-[#065F46] disabled:opacity-40 text-white text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <span>{t.next}</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={resetTrace}
            className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-lg bg-[#17273E] border border-[#243957] hover:border-[#38BDF8] text-xs font-medium text-[#CBD5E1] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.reset}</span>
          </button>
        </div>

        <p className="text-[11px] text-[#94A3B8]">{t.keysHint}</p>
      </div>
    </div>
  );
}
