/**
 * "Qisqa sinov" 3-question quick diagnostic modal.
 * Uses accessible dialog semantics, Escape close, soft feedback, XP award,
 * and recommends the learner's starting workshop.
 */
'use client';

import React, { useEffect, useState } from 'react';
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
  onClose: () => void;
  onComplete: (result: {
    correctCount: number;
    xpEarned: number;
    recommendedWorkshop: WorkshopId;
  }) => void;
}

export function DiagnosticModal({
  open,
  onClose,
  onComplete,
}: DiagnosticModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [doneResult, setDoneResult] = useState<ReturnType<
    typeof evaluateDiagnostic
  > | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const t = WORKSHOP_STRINGS.reviewStrings;
  const q = DIAGNOSTIC_QUESTIONS[step];
  const isLast = step === DIAGNOSTIC_QUESTIONS.length - 1;

  const handleSelect = (idx: number) => {
    if (checked) return;
    setSelected(idx);
    setChecked(true);
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
    setStep(0);
    setAnswers([]);
    setSelected(null);
    setChecked(false);
    setDoneResult(null);
    onComplete(res);
  };

  const handleResetClose = () => {
    setStep(0);
    setAnswers([]);
    setSelected(null);
    setChecked(false);
    setDoneResult(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#071529]/82 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="diag-modal-title"
        data-surface="paper"
        className="ws-surface ws-paper-grain relative w-full max-w-lg rounded-[22px] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-5 text-[var(--on-surface)] shadow-[var(--sh-5)] sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <PinStarIcon size={28} />
            <div>
              <h2
                id="diag-modal-title"
                className="font-[family-name:var(--font-display)] text-xl font-extrabold"
              >
                {t.diagTitle}
              </h2>
              <p className="text-[14px] text-[var(--on-surface-muted)]">
                {t.diagSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetClose}
            className="min-h-[44px] min-w-[44px] rounded-[10px] border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-[14px] font-bold hover:border-[var(--accent)]"
          >
            {t.closeModal}
          </button>
        </div>

        {!doneResult ? (
          <div className="space-y-4">
            {/* Step dots */}
            <div className="flex items-center gap-2" aria-label={`Savol ${step + 1} / ${DIAGNOSTIC_QUESTIONS.length}`}>
              {DIAGNOSTIC_QUESTIONS.map((item, idx) => (
                <span
                  key={item.id}
                  className={`h-2.5 flex-1 rounded-full border border-[var(--line-strong)] ${
                    idx < step
                      ? 'bg-[#19B7A6]'
                      : idx === step
                      ? 'bg-[#F5A800]'
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
                className={`ws-key-btn ws-key-btn--primary min-h-[48px] px-5 ${
                  !checked ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <span>{isLast ? t.diagFinishBtn : t.diagNextBtn}</span>
                <PhPlay size={14} weight="fill" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-[16px] border-2 border-[#19B7A6] bg-[#19B7A6]/10 p-4">
            <div className="flex items-center gap-2 text-[#0E7C70]">
              <PhCheck size={24} weight="fill" />
              <h3 className="font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--on-surface)]">
                {t.diagDoneTitle}
              </h3>
            </div>
            <p className="text-[15px] font-medium">
              Natija: <strong className="ws-tabular">{doneResult.correctCount} / {doneResult.total}</strong> toʻgʻri javob va{' '}
              <strong className="ws-tabular">+{doneResult.xpEarned} XP</strong>!
            </p>
            <p className="text-[14px] text-[var(--on-surface-muted)]">
              Tavsiya etilgan boshlangʻich ustaxona:{' '}
              <strong className="text-[var(--on-surface)]">
                {WORKSHOPS.find((w) => w.id === doneResult.recommendedWorkshop)?.title}
              </strong>
            </p>
            <button
              type="button"
              onClick={handleFinishAndGo}
              className="ws-key-btn ws-key-btn--primary min-h-[48px] w-full"
            >
              <span>{t.diagGoWorkshop}</span>
              <PhPlay size={14} weight="fill" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
