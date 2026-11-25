/**
 * "Qisqa sinov" 3-question quick diagnostic modal:
 * - Built on @base-ui/react/dialog for accessible focus trap, Escape, and backdrop handling
 * - A19 completion choreography: 3 staggered enamel PinStarIcons (--spring-jelly),
 *   odometer result counter, and one-shot pulsing primary CTA
 */
'use client';

import React, { useEffect, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { PhCheck, PhPlay, PinStarIcon } from '@/components/icons/WorkshopIcons';
import { ChoiceTile } from '@/components/ui/ChoiceTile';
import { WORKSHOPS } from '@/lib/data/workshop';
import { WORKSHOP_STRINGS } from '@/lib/engine/i18n';
import {
  DIAGNOSTIC_QUESTIONS,
  evaluateDiagnostic,
} from '@/lib/engine/progression';
import type { WorkshopId } from '@/lib/engine/store';

interface DiagnosticModalProps {
  open: boolean;
  liteMode?: boolean;
  motionPaused?: boolean;
  onClose: () => void;
  onAnswerFeedback?: (correct: boolean) => void;
  onComplete: (result: {
    correctCount: number;
    xpEarned: number;
    recommendedWorkshop: WorkshopId;
  }) => void;
}

export function DiagnosticModal({
  open,
  liteMode = false,
  motionPaused = false,
  onClose,
  onAnswerFeedback,
  onComplete,
}: DiagnosticModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [doneResult, setDoneResult] = useState<ReturnType<
    typeof evaluateDiagnostic
  > | null>(null);
  const [displayXp, setDisplayXp] = useState(0);

  const t = WORKSHOP_STRINGS.reviewStrings;
  const q = DIAGNOSTIC_QUESTIONS[step];
  const isLast = step === DIAGNOSTIC_QUESTIONS.length - 1;

  // A19 Odometer count-up when diagnostic result screen appears
  useEffect(() => {
    if (!doneResult || liteMode || motionPaused) return;
    let val = 0;
    const target = doneResult.xpEarned;
    const id = window.setInterval(() => {
      val = Math.min(target, val + 3);
      setDisplayXp(val);
      if (val >= target) window.clearInterval(id);
    }, 32);
    return () => window.clearInterval(id);
  }, [doneResult, liteMode, motionPaused]);

  const shownXp =
    !doneResult ? 0 : liteMode || motionPaused ? doneResult.xpEarned : displayXp;

  const resetLocal = () => {
    setStep(0);
    setAnswers([]);
    setSelected(null);
    setChecked(false);
    setDoneResult(null);
    setDisplayXp(0);
  };

  const handleSelect = (idx: number) => {
    if (checked) return;
    setSelected(idx);
    setChecked(true);
    onAnswerFeedback?.(idx === q.correctIndex);
  };

  const handleNext = () => {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    if (!isLast) {
      setAnswers(nextAnswers);
      setStep((s) => s + 1);
      setSelected(null);
      setChecked(false);
    } else {
      const result = evaluateDiagnostic(nextAnswers);
      setDoneResult(result);
    }
  };

  const handleFinishAndGo = () => {
    if (!doneResult) return;
    const res = doneResult;
    resetLocal();
    onComplete(res);
  };

  const handleResetClose = () => {
    resetLocal();
    onClose();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleResetClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#071529]/82" />
        <Dialog.Popup
          data-surface="paper"
          className="ws-surface ws-paper-grain fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[22px] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-5 text-[var(--on-surface)] shadow-[var(--sh-5)] sm:p-6"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <PinStarIcon size={28} />
              <div>
                <Dialog.Title className="font-[family-name:var(--font-display)] text-xl font-extrabold">
                  {t.diagTitle}
                </Dialog.Title>
                <Dialog.Description className="text-[14px] text-[var(--on-surface-muted)]">
                  {t.diagSubtitle}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close
              type="button"
              className="min-h-[44px] min-w-[44px] cursor-pointer rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-[14px] font-bold hover:border-[var(--accent)]"
            >
              {t.closeModal}
            </Dialog.Close>
          </div>

          {!doneResult ? (
            <div className="space-y-4">
              {/* Step progress segments */}
              <div
                className="flex items-center gap-2"
                aria-label={`Savol ${step + 1} / ${DIAGNOSTIC_QUESTIONS.length}`}
              >
                {DIAGNOSTIC_QUESTIONS.map((item, idx) => (
                  <span
                    key={item.id}
                    className={`h-2.5 flex-1 rounded-full border border-[var(--line-strong)] ${
                      idx < step
                        ? 'bg-[var(--ok)]'
                        : idx === step
                          ? 'bg-[var(--reward)]'
                          : 'bg-[var(--surface-inset)]'
                    }`}
                  />
                ))}
              </div>

              <p className="text-[16px] font-bold">{q.prompt}</p>

              <pre className="overflow-x-auto rounded-[12px] border-2 border-[var(--line-strong)] bg-[#07264B] p-3.5 text-[14px] text-[#EAF2FF]">
                <code>{q.code}</code>
              </pre>

              <div className="space-y-2.5">
                {q.options.map((opt, idx) => {
                  const state = !checked
                    ? 'idle'
                    : idx === q.correctIndex
                      ? 'correct'
                      : idx === selected
                        ? 'wrong'
                        : 'idle';
                  return (
                    <ChoiceTile
                      key={opt}
                      indexLabel={String(idx + 1)}
                      label={opt}
                      state={state}
                      disabled={checked}
                      liteMode={liteMode}
                      motionPaused={motionPaused}
                      onClick={() => handleSelect(idx)}
                    />
                  );
                })}
              </div>

              {checked ? (
                <div className="rounded-[12px] border border-[var(--line-strong)] bg-[var(--surface)] p-3 text-[14px] font-medium">
                  {q.feedback}
                </div>
              ) : null}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={!checked}
                  onClick={handleNext}
                  className="ws-key-btn ws-key-btn--primary min-h-[48px] px-5"
                >
                  <span>{isLast ? t.diagFinishBtn : t.diagNextBtn}</span>
                  <PhPlay size={14} weight="fill" className="ws-key-icon" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-[16px] border-2 border-[var(--ok)] bg-[#19B7A6]/12 p-4">
              {/* A19 Staggered enamel star pins (--spring-jelly) */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[var(--ok-ink)]">
                  <PhCheck size={24} weight="fill" />
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--on-surface)]">
                    {t.diagDoneTitle}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {[0, 1, 2].map((starIdx) => {
                    const earned = starIdx < Math.max(1, doneResult.correctCount);
                    return (
                      <span
                        key={starIdx}
                        className={
                          earned && !liteMode && !motionPaused
                            ? 'ws-pin-pop inline-block'
                            : 'inline-block'
                        }
                        style={{
                          animationDelay: `${starIdx * 160}ms`,
                          opacity: earned ? 1 : 0.3,
                        }}
                      >
                        <PinStarIcon size={26} />
                      </span>
                    );
                  })}
                </div>
              </div>

              <p className="text-[15px] font-medium">
                Natija:{' '}
                <strong className="ws-tabular">
                  {doneResult.correctCount} / {doneResult.total}
                </strong>{' '}
                toʻgʻri javob va{' '}
                <strong className="ws-tabular text-[var(--ok-ink)]">
                  +{shownXp} XP
                </strong>
                !
              </p>
              <p className="text-[14px] text-[var(--on-surface-muted)]">
                Tavsiya etilgan boshlangʻich ustaxona:{' '}
                <strong className="text-[var(--on-surface)]">
                  {
                    WORKSHOPS.find(
                      (w) => w.id === doneResult.recommendedWorkshop
                    )?.title
                  }
                </strong>
              </p>
              <button
                type="button"
                onClick={handleFinishAndGo}
                className={`ws-key-btn ws-key-btn--primary min-h-[48px] w-full ${
                  !liteMode && !motionPaused ? 'ws-cta-pulse-once' : ''
                }`}
              >
                <span>{t.diagGoWorkshop}</span>
                <PhPlay size={14} weight="fill" className="ws-key-icon" />
              </button>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
