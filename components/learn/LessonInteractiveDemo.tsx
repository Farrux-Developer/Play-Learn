'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { SpeechBubble } from '@/components/ui/SpeechBubble';
import type { LessonDocument } from '@/lib/game/content/lessons';

export function LessonInteractiveDemo({
  demoProgram,
  selfCheck,
}: {
  demoProgram: LessonDocument['demoProgram'];
  selfCheck: LessonDocument['selfCheck'];
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const steps = demoProgram.instructions;
  const activeStep = steps[stepIdx] ?? steps[0];
  const isCorrect = picked !== null && picked === selfCheck.correctIndex;

  return (
    <div className="space-y-6">
      <Panel variant="chamfered" surface="blueprint" data-surface="blueprint">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--on-surface)]">
              {demoProgram.title}
            </h3>
            <p className="text-[14px] text-[var(--on-surface-muted)]">
              Kirish: {demoProgram.inputs.join(', ') || '—'} · Takt{' '}
              <span className="ws-tabular font-bold">
                {stepIdx + 1}/{steps.length}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              disabled={stepIdx === 0}
            >
              Orqaga qaytar
            </Button>
            <Button
              variant="primary"
              onClick={() => setStepIdx((i) => (i + 1) % steps.length)}
            >
              1 takt bos
            </Button>
          </div>
        </div>

        <ol className="mt-4 space-y-2">
          {steps.map((st, idx) => {
            const current = idx === stepIdx;
            return (
              <li
                key={idx}
                className={`rounded-[12px] border-2 px-3.5 py-2.5 font-[family-name:var(--font-mono)] text-[14px] transition-colors ${
                  current
                    ? 'border-[var(--accent)] bg-[var(--surface-inset)] text-[var(--on-surface)]'
                    : 'border-[var(--line)] bg-[var(--surface-raised)] text-[var(--on-surface-muted)]'
                }`}
              >
                <span className="ws-tabular mr-2 font-bold text-[var(--reward-ink)]">
                  {idx + 1}.
                </span>
                <span>{st.label}</span>
              </li>
            );
          })}
        </ol>

        {activeStep ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[12px] border border-[var(--line)] bg-[var(--surface-inset)] p-3">
              <p className="text-[13px] font-bold text-[var(--on-surface-muted)]">
                Oʻzgaruvchi qutilar:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(activeStep.vars).map(([name, val]) => (
                  <span
                    key={name}
                    className="ws-tabular rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[14px] font-bold"
                  >
                    {name} = {val}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[12px] border border-[var(--line)] bg-[var(--surface-inset)] p-3">
              <p className="text-[13px] font-bold text-[var(--on-surface-muted)]">
                Chiqish (OUT):
              </p>
              <p className="ws-tabular mt-2 font-[family-name:var(--font-mono)] text-[16px] font-extrabold text-[var(--ok-ink)]">
                {activeStep.outputs.length > 0 ? activeStep.outputs.join(', ') : '—'}
              </p>
            </div>
          </div>
        ) : null}

        {activeStep ? (
          <div className="mt-4">
            <SpeechBubble text={activeStep.note} tone="neutral" />
          </div>
        ) : null}
      </Panel>

      <Panel variant="elevated" surface="paper">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
          Qisqa oʻz-oʻzini tekshirish
        </h3>
        <p className="mt-2 text-[16px] font-medium text-[var(--on-surface)]">
          {selfCheck.question}
        </p>
        <div className="mt-4 grid gap-2.5">
          {selfCheck.options.map((opt, idx) => {
            const selected = picked === idx;
            const right = selected && idx === selfCheck.correctIndex;
            const wrong = selected && idx !== selfCheck.correctIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setPicked(idx)}
                aria-pressed={selected}
                className={`min-h-[48px] cursor-pointer rounded-[12px] border-2 px-4 py-2.5 text-left text-[15.5px] font-bold transition-colors ${
                  right
                    ? 'border-[var(--ok)] bg-[var(--ok)]/15 text-[var(--on-surface)]'
                    : wrong
                      ? 'border-[var(--danger)] bg-[var(--danger)]/12 text-[var(--on-surface)]'
                      : 'border-[var(--line-strong)] bg-[var(--surface-raised)] text-[var(--on-surface)] hover:border-[var(--accent)]'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {picked !== null ? (
          <div className="mt-4">
            <SpeechBubble
              tone={isCorrect ? 'success' : 'danger'}
              text={
                isCorrect
                  ? `Toʻgʻri! ${selfCheck.explanation}`
                  : `Qayta oʻylab koʻr: ${selfCheck.explanation}`
              }
            />
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
