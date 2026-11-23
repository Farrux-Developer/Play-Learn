'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, HelpCircle } from 'lucide-react';
import {
  DIAGNOSTIC_QUESTIONS,
  MISCONCEPTION_CATALOG,
  type SkillId,
} from '@/lib/data/curriculum';
import { pickText, type LocaleScript } from '@/lib/engine/i18n';

interface DiagnosticModalProps {
  open: boolean;
  script: LocaleScript;
  showRealCode: boolean;
  onClose: () => void;
  onRecordMisconception: (misconceptionId: string) => void;
  onComplete: (results: Record<SkillId, boolean>) => void;
}

export function DiagnosticModal({
  open,
  script,
  showRealCode,
  onClose,
  onRecordMisconception,
  onComplete,
}: DiagnosticModalProps) {
  const [step, setStep] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Record<SkillId, boolean>>({
    algoritmlar: false,
    mantiq: false,
    sikllar: false,
  });

  if (!open) return null;

  const q = DIAGNOSTIC_QUESTIONS[step];
  const isCorrect = selectedIdx === q.correctIndex;
  const wrongMiscId =
    selectedIdx !== null && !isCorrect ? q.misconceptionIds[selectedIdx] : undefined;
  const wrongMiscMeta = wrongMiscId ? MISCONCEPTION_CATALOG[wrongMiscId] : undefined;

  const ui =
    script === 'uz-Cyrl'
      ? {
          headerTag: 'Қисқа синов',
          title: 'Қайси босқичдан бошлаш қулай?',
          closeAria: 'Синовни ёпиш',
          rightTitle: 'Тўғри топдинг! (+15 XP)',
          wrongTitle: 'Яхши уриниш!',
          checkBtn: 'Текшириш',
          nextBtn: 'Кейинги савол',
          finishBtn: 'Натижани қўллаш',
        }
      : {
          headerTag: 'Qisqa sinov',
          title: 'Qaysi bosqichdan boshlash qulay?',
          closeAria: 'Sinovni yopish',
          rightTitle: 'Toʻgʻri topding! (+15 XP)',
          wrongTitle: 'Yaxshi urinish!',
          checkBtn: 'Tekshirish',
          nextBtn: 'Keyingi savol',
          finishBtn: 'Natijani qoʻllash',
        };

  const handleCheck = () => {
    if (selectedIdx === null) return;
    setChecked(true);
    const ok = selectedIdx === q.correctIndex;
    if (!ok) {
      const miscId = q.misconceptionIds[selectedIdx];
      if (miscId && miscId !== 'ok') {
        onRecordMisconception(miscId);
      }
    }
    setAnswers((prev) => ({
      ...prev,
      [q.skillId]: ok,
    }));
  };

  const handleNext = () => {
    if (step + 1 < DIAGNOSTIC_QUESTIONS.length) {
      setStep((s) => s + 1);
      setSelectedIdx(null);
      setChecked(false);
    } else {
      onComplete(answers);
      setStep(0);
      setSelectedIdx(null);
      setChecked(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagnostic-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1A2B]/70 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white border border-[#D5CEC0] p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#5C6B80] tabular-nums">
              {ui.headerTag} · {step + 1} / {DIAGNOSTIC_QUESTIONS.length}
            </p>
            <h2
              id="diagnostic-title"
              className="font-display text-xl font-bold text-[#122033]"
            >
              {ui.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={ui.closeAria}
            className="p-2 min-w-[40px] min-h-[40px] rounded-xl hover:bg-[#EAE5DA] text-[#43536B] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-base font-medium text-[#122033]">
          {pickText(q.prompt, script)}
        </p>

        {q.code && (
          <div className={`grid grid-cols-1 ${showRealCode && q.pythonCode ? 'sm:grid-cols-2' : ''} gap-2.5`}>
            <pre className="rounded-xl bg-[#0E1A2B] text-[#F4F6FA] p-4 text-xs sm:text-sm font-code overflow-x-auto">
              <code>{q.code}</code>
            </pre>
            {showRealCode && q.pythonCode && (
              <pre className="rounded-xl bg-[#17273E] text-[#BAE6FD] p-4 text-xs sm:text-sm font-code overflow-x-auto">
                <code>{q.pythonCode}</code>
              </pre>
            )}
          </div>
        )}

        <div className="space-y-2.5">
          {q.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const optText = pickText(opt, script);
            return (
              <button
                key={`${q.id}-opt-${idx}`}
                type="button"
                disabled={checked}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left px-4 py-3 min-h-[48px] rounded-xl border text-sm sm:text-base transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[#0F4C81] bg-[#F0F9FF] text-[#075985] font-semibold'
                    : 'border-[#D5CEC0] bg-[#F6F4EE]/60 hover:border-[#0F4C81] text-[#122033]'
                }`}
              >
                {optText}
              </button>
            );
          })}
        </div>

        {checked && (
          <div
            role="status"
            className={`rounded-xl p-4 text-sm flex items-start gap-2.5 ${
              isCorrect
                ? 'bg-[#ECFDF5] text-[#065F46]'
                : 'bg-[#F0F9FF] text-[#075985]'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <div className="space-y-1">
              <p className="font-semibold">
                {isCorrect ? ui.rightTitle : ui.wrongTitle}
              </p>
              <p>{pickText(q.explanation, script)}</p>
              {wrongMiscMeta && (
                <p className="text-xs font-semibold text-[#9A5B00]">
                  {pickText(wrongMiscMeta.label, script)}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          {!checked ? (
            <button
              type="button"
              disabled={selectedIdx === null}
              onClick={handleCheck}
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#0F4C81] disabled:opacity-45 text-white font-semibold text-sm cursor-pointer"
            >
              {ui.checkBtn}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-semibold text-sm cursor-pointer"
            >
              {step + 1 < DIAGNOSTIC_QUESTIONS.length ? ui.nextBtn : ui.finishBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
