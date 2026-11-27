'use client';

import React, { useState } from 'react';
import type {
  BoardInstruction,
  CompareOp,
  ValueOperand,
} from '@/lib/game/core/vm';

const OP_LABELS: Record<BoardInstruction['op'], { uz: string; hint: string }> = {
  SET: { uz: 'Qiymat ber', hint: 'Qutiga son yoki kirishni yozadi' },
  ADD: { uz: 'Qoʻsh', hint: 'Ikki qiymatni qoʻshib saqlaydi' },
  SUB: { uz: 'Ayir', hint: 'Birinchidan ikkinchisini ayiradi' },
  MUL: { uz: 'Koʻpaytir', hint: 'Ikki qiymatni koʻpaytiradi' },
  DIV: { uz: 'Boʻl', hint: 'Butun boʻlinmani topadi' },
  MOD: { uz: 'Qoldiq', hint: 'Boʻlishdan qolgan qoldiqni oladi' },
  LIST_SET: { uz: 'Roʻyxat tuz', hint: 'Boshlangʻich roʻyxat yaratadi' },
  LIST_PUSH: { uz: 'Roʻyxatga qoʻsh', hint: 'Oxiriga yangi element qoʻshadi' },
  LIST_GET: { uz: 'Roʻyxatdan oʻqi', hint: 'Indeks boʻyicha elementni oladi' },
  LIST_LEN: { uz: 'Uzunlik', hint: 'Roʻyxatdagi elementlar soni' },
  LABEL: { uz: 'Yorliq', hint: 'Sakrash manzili belgisi' },
  JUMP: { uz: 'Sakra', hint: 'Koʻrsatilgan yorliqqa oʻtadi' },
  JUMP_IF: { uz: 'Shart tekshir', hint: 'Shart rost boʻlsa sakraydi' },
  CALL: { uz: 'Funksiya chaqir', hint: 'Funksiyaga kirib, RET da qaytadi' },
  RET: { uz: 'Qayt', hint: 'Funksiyadan chaqirilgan joyga qaytadi' },
  OUT: { uz: 'Chop et', hint: 'Natijani ekranga chiqaradi' },
  HLT: { uz: 'Toʻxta', hint: 'Mashinani yakunlaydi' },
};

function makeDefaultInstruction(op: string): BoardInstruction {
  switch (op) {
    case 'SET':
      return { op: 'SET', target: 'x', value: { kind: 'input' } };
    case 'ADD':
      return {
        op: 'ADD',
        target: 'sum',
        left: { kind: 'var', name: 'sum' },
        right: { kind: 'lit', value: 1 },
      };
    case 'SUB':
      return {
        op: 'SUB',
        target: 'n',
        left: { kind: 'var', name: 'n' },
        right: { kind: 'lit', value: 1 },
      };
    case 'MUL':
      return {
        op: 'MUL',
        target: 'son',
        left: { kind: 'var', name: 'son' },
        right: { kind: 'lit', value: 2 },
      };
    case 'DIV':
      return {
        op: 'DIV',
        target: 'x',
        left: { kind: 'var', name: 'x' },
        right: { kind: 'lit', value: 2 },
      };
    case 'MOD':
      return {
        op: 'MOD',
        target: 'x',
        left: { kind: 'var', name: 'x' },
        right: { kind: 'lit', value: 2 },
      };
    case 'LIST_SET':
      return { op: 'LIST_SET', list: 'narxlar', items: [10, 20] };
    case 'LIST_PUSH':
      return { op: 'LIST_PUSH', list: 'narxlar', value: { kind: 'var', name: 'yangi' } };
    case 'LIST_GET':
      return {
        op: 'LIST_GET',
        target: 'item',
        list: 'narxlar',
        index: { kind: 'lit', value: 0 },
      };
    case 'LIST_LEN':
      return { op: 'LIST_LEN', target: 'len', list: 'narxlar' };
    case 'LABEL':
      return { op: 'LABEL', label: 'loop' };
    case 'JUMP':
      return { op: 'JUMP', targetLabel: 'loop' };
    case 'JUMP_IF':
      return {
        op: 'JUMP_IF',
        left: { kind: 'var', name: 'n' },
        cmp: '<=',
        right: { kind: 'lit', value: 0 },
        targetLabel: 'done',
      };
    case 'CALL':
      return { op: 'CALL', targetLabel: 'plus_uch' };
    case 'RET':
      return { op: 'RET' };
    case 'OUT':
      return { op: 'OUT', value: { kind: 'var', name: 'x' } };
    default:
      return { op: 'HLT' };
  }
}

export function formatInstructionUz(instr: BoardInstruction): string {
  const fmtOp = (v: ValueOperand) =>
    v.kind === 'input' ? 'kirish' : v.kind === 'lit' ? String(v.value) : v.name;

  switch (instr.op) {
    case 'SET':
      return `SET ${instr.target} = ${fmtOp(instr.value)}`;
    case 'ADD':
    case 'SUB':
    case 'MUL':
    case 'DIV':
    case 'MOD': {
      const sym =
        instr.op === 'ADD'
          ? '+'
          : instr.op === 'SUB'
            ? '-'
            : instr.op === 'MUL'
              ? '*'
              : instr.op === 'DIV'
                ? '/'
                : '%';
      return `${instr.op} ${instr.target} = ${fmtOp(instr.left)} ${sym} ${fmtOp(instr.right)}`;
    }
    case 'LIST_SET':
      return `LIST_SET ${instr.list} = [${instr.items.join(', ')}]`;
    case 'LIST_PUSH':
      return `LIST_PUSH ${instr.list} <- ${fmtOp(instr.value)}`;
    case 'LIST_GET':
      return `LIST_GET ${instr.target} = ${instr.list}[${fmtOp(instr.index)}]`;
    case 'LIST_LEN':
      return `LIST_LEN ${instr.target} = len(${instr.list})`;
    case 'LABEL':
      return `LABEL ${instr.label}:`;
    case 'JUMP':
      return `JUMP -> ${instr.targetLabel}`;
    case 'JUMP_IF':
      return `JUMP_IF ${fmtOp(instr.left)} ${instr.cmp} ${fmtOp(instr.right)} -> ${instr.targetLabel}`;
    case 'CALL':
      return `CALL ${instr.targetLabel}()`;
    case 'RET':
      return 'RET';
    case 'OUT':
      return `OUT ${fmtOp(instr.value)}`;
    case 'HLT':
      return 'HLT';
  }
}

function OperandEditor({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: ValueOperand;
  disabled: boolean;
  onChange: (next: ValueOperand) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-[8px] border border-[var(--line)] bg-[var(--surface-inset)] px-2 py-1 text-[13px]">
      <span className="sr-only">{label}</span>
      <select
        aria-label={`${label} turi`}
        disabled={disabled}
        value={value.kind}
        onChange={(e) => {
          const k = e.target.value as ValueOperand['kind'];
          if (k === 'input') onChange({ kind: 'input' });
          else if (k === 'lit') onChange({ kind: 'lit', value: 0 });
          else onChange({ kind: 'var', name: 'ball' });
        }}
        className="min-h-[36px] rounded bg-transparent font-bold text-[var(--info-ink)]"
      >
        <option value="var" className="text-[#0F1E3A]">quti</option>
        <option value="lit" className="text-[#0F1E3A]">son</option>
        <option value="input" className="text-[#0F1E3A]">kirish</option>
      </select>
      {value.kind === 'var' ? (
        <input
          type="text"
          aria-label={`${label} quti nomi`}
          disabled={disabled}
          value={value.name}
          onChange={(e) => onChange({ kind: 'var', name: e.target.value })}
          className="w-20 rounded border border-[var(--line)] bg-[var(--surface)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[13px] text-[var(--on-surface)]"
        />
      ) : value.kind === 'lit' ? (
        <input
          type="number"
          aria-label={`${label} son`}
          disabled={disabled}
          value={value.value}
          onChange={(e) => onChange({ kind: 'lit', value: Number(e.target.value || 0) })}
          className="ws-tabular w-16 rounded border border-[var(--line)] bg-[var(--surface)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[13px] text-[var(--on-surface)]"
        />
      ) : (
        <span className="px-1 font-[family-name:var(--font-mono)] text-[13px] text-[var(--reward-ink)]">
          kirish
        </span>
      )}
    </div>
  );
}

export interface VmBoardEditorProps {
  instructions: BoardInstruction[];
  allowedParts: readonly string[];
  activePc: number | null;
  errorLineIndex: number | null;
  readOnly: boolean;
  arrangeOnly: boolean;
  textMode: boolean;
  onChange: (next: BoardInstruction[]) => void;
}

export function VmBoardEditor({
  instructions,
  allowedParts,
  activePc,
  errorLineIndex,
  readOnly,
  arrangeOnly,
  textMode,
  onChange,
}: VmBoardEditorProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const moveRow = (from: number, to: number) => {
    if (readOnly || to < 0 || to >= instructions.length) return;
    const copy = [...instructions];
    const [item] = copy.splice(from, 1);
    if (!item) return;
    copy.splice(to, 0, item);
    onChange(copy);
  };

  const updateRow = (idx: number, nextInstr: BoardInstruction) => {
    if (readOnly || arrangeOnly) return;
    const copy = [...instructions];
    copy[idx] = nextInstr;
    onChange(copy);
  };

  const deleteRow = (idx: number) => {
    if (readOnly || arrangeOnly) return;
    onChange(instructions.filter((_, i) => i !== idx));
  };

  const addPart = (op: string) => {
    if (readOnly || arrangeOnly) return;
    onChange([...instructions, makeDefaultInstruction(op)]);
  };

  return (
    <div className="space-y-4">
      {!readOnly && !arrangeOnly ? (
        <div>
          <p className="mb-2 text-[13.5px] font-bold text-[var(--on-surface-muted)]">
            Qismlar paneli (bosib doskaga qoʻshing):
          </p>
          <div className="flex flex-wrap gap-2">
            {allowedParts.map((part) => {
              const info = OP_LABELS[part as BoardInstruction['op']];
              return (
                <button
                  key={part}
                  type="button"
                  onClick={() => addPart(part)}
                  title={info?.hint ?? part}
                  className="inline-flex min-h-[48px] cursor-pointer items-center gap-1.5 rounded-[10px] border-2 border-[var(--line-strong)] bg-[var(--surface-inset)] px-3 py-1.5 text-[14px] font-bold text-[var(--on-surface)] hover:border-[var(--accent)] active:translate-y-0.5"
                >
                  <span className="text-[var(--reward-ink)]">+</span>
                  <span className="font-[family-name:var(--font-mono)]">{part}</span>
                  {info ? (
                    <span className="text-[12px] font-normal text-[var(--on-surface-muted)]">
                      ({info.uz})
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {textMode ? (
        <div
          role="region"
          aria-label="Matn rejimidagi dastur roʻyxati"
          className="space-y-2 rounded-[14px] border-2 border-[var(--line-strong)] bg-[var(--surface-inset)] p-3"
        >
          <p className="text-[13.5px] font-bold text-[var(--on-surface-muted)]">
            Matn rejimi (ekran oʻquvchi va klaviatura uchun soddalashtirilgan koʻrinish):
          </p>
          <ol className="space-y-2">
            {instructions.map((instr, idx) => (
              <li
                key={idx}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-[10px] border p-2.5 ${
                  activePc === idx
                    ? 'border-[var(--accent)] bg-[var(--surface-raised)]'
                    : 'border-[var(--line)] bg-[var(--surface)]'
                }`}
              >
                <span className="font-[family-name:var(--font-mono)] text-[14px] font-bold">
                  {idx + 1}. {formatInstructionUz(instr)}
                </span>
                {!readOnly ? (
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      aria-label={`${idx + 1}-qatorni yuqoriga surish`}
                      disabled={idx === 0}
                      onClick={() => moveRow(idx, idx - 1)}
                      className="min-h-[44px] min-w-[44px] cursor-pointer rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-2 font-bold disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`${idx + 1}-qatorni pastga surish`}
                      disabled={idx === instructions.length - 1}
                      onClick={() => moveRow(idx, idx + 1)}
                      className="min-h-[44px] min-w-[44px] cursor-pointer rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-2 font-bold disabled:opacity-40"
                    >
                      ↓
                    </button>
                    {!arrangeOnly ? (
                      <button
                        type="button"
                        aria-label={`${idx + 1}-qatorni oʻchirish`}
                        onClick={() => deleteRow(idx)}
                        className="min-h-[44px] min-w-[44px] cursor-pointer rounded-[8px] border border-[var(--danger)] px-2 font-bold text-[var(--danger-ink)]"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <ol className="space-y-2.5" aria-label="Dastur qatorlari">
          {instructions.length === 0 ? (
            <li className="rounded-[14px] border-2 border-dashed border-[var(--line-strong)] p-5 text-center text-[15px] text-[var(--on-surface-muted)]">
              Doska boʻsh. Yuqoridagi qismlardan birini bosib buyruq qoʻshing.
            </li>
          ) : null}

          {instructions.map((instr, idx) => {
            const isCurrent = activePc === idx;
            const isError = errorLineIndex === idx;
            const meta = OP_LABELS[instr.op];

            return (
              <li
                key={idx}
                draggable={!readOnly}
                onDragStart={() => setDragIdx(idx)}
                onDragOver={(e) => {
                  if (!readOnly) e.preventDefault();
                }}
                onDrop={() => {
                  if (dragIdx !== null && dragIdx !== idx) {
                    moveRow(dragIdx, idx);
                  }
                  setDragIdx(null);
                }}
                onKeyDown={(e) => {
                  if (readOnly) return;
                  if (e.altKey && e.key === 'ArrowUp') {
                    e.preventDefault();
                    moveRow(idx, idx - 1);
                  } else if (e.altKey && e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveRow(idx, idx + 1);
                  }
                }}
                className={`flex flex-wrap items-center justify-between gap-2.5 rounded-[14px] border-2 px-3 py-2.5 transition-colors ${
                  isError
                    ? 'border-[var(--danger)] bg-[var(--danger)]/12'
                    : isCurrent
                      ? 'border-[var(--accent)] bg-[var(--surface-raised)] shadow-[var(--sh-2)]'
                      : 'border-[var(--line-strong)] bg-[var(--surface-raised)]/85'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`ws-tabular inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-[13px] font-extrabold ${
                      isCurrent
                        ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                        : 'bg-[var(--surface-inset)] text-[var(--on-surface-muted)]'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <span className="rounded-[8px] border border-[var(--line)] bg-[var(--surface-inset)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[13.5px] font-extrabold text-[var(--reward-ink)]">
                    {instr.op}
                  </span>
                  <span className="text-[12.5px] font-semibold text-[var(--on-surface-muted)]">
                    {meta.uz}
                  </span>

                  {/* Editable operands when build/debug/modify/boss/sandbox */}
                  {readOnly || arrangeOnly ? (
                    <code className="font-[family-name:var(--font-mono)] text-[14px] text-[var(--on-surface)]">
                      {formatInstructionUz(instr)}
                    </code>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {instr.op === 'SET' ? (
                        <>
                          <input
                            type="text"
                            aria-label="Oʻzgaruvchi nomi"
                            value={instr.target}
                            onChange={(e) =>
                              updateRow(idx, { ...instr, target: e.target.value })
                            }
                            className="w-20 rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[13.5px] font-bold"
                          />
                          <span className="font-bold">=</span>
                          <OperandEditor
                            label="Qiymat"
                            value={instr.value}
                            disabled={false}
                            onChange={(v) => updateRow(idx, { ...instr, value: v })}
                          />
                        </>
                      ) : instr.op === 'ADD' ||
                        instr.op === 'SUB' ||
                        instr.op === 'MUL' ||
                        instr.op === 'DIV' ||
                        instr.op === 'MOD' ? (
                        <>
                          <input
                            type="text"
                            aria-label="Natija qutisi"
                            value={instr.target}
                            onChange={(e) =>
                              updateRow(idx, { ...instr, target: e.target.value })
                            }
                            className="w-20 rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[13.5px] font-bold"
                          />
                          <span className="font-bold">=</span>
                          <OperandEditor
                            label="Chap qiymat"
                            value={instr.left}
                            disabled={false}
                            onChange={(v) => updateRow(idx, { ...instr, left: v })}
                          />
                          <OperandEditor
                            label="Oʻng qiymat"
                            value={instr.right}
                            disabled={false}
                            onChange={(v) => updateRow(idx, { ...instr, right: v })}
                          />
                        </>
                      ) : instr.op === 'JUMP_IF' ? (
                        <>
                          <OperandEditor
                            label="Solishtirish chap"
                            value={instr.left}
                            disabled={false}
                            onChange={(v) => updateRow(idx, { ...instr, left: v })}
                          />
                          <select
                            aria-label="Solishtirish belgisi"
                            value={instr.cmp}
                            onChange={(e) =>
                              updateRow(idx, {
                                ...instr,
                                cmp: e.target.value as CompareOp,
                              })
                            }
                            className="min-h-[38px] rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 font-[family-name:var(--font-mono)] text-[13.5px] font-bold text-[var(--on-surface)]"
                          >
                            {(['==', '!=', '<', '<=', '>', '>='] as const).map((c) => (
                              <option key={c} value={c} className="text-[#0F1E3A]">
                                {c}
                              </option>
                            ))}
                          </select>
                          <OperandEditor
                            label="Solishtirish oʻng"
                            value={instr.right}
                            disabled={false}
                            onChange={(v) => updateRow(idx, { ...instr, right: v })}
                          />
                          <span>→</span>
                          <input
                            type="text"
                            aria-label="Manzil yorligʻi"
                            value={instr.targetLabel}
                            onChange={(e) =>
                              updateRow(idx, { ...instr, targetLabel: e.target.value })
                            }
                            className="w-20 rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[13.5px]"
                          />
                        </>
                      ) : instr.op === 'LABEL' ? (
                        <input
                          type="text"
                          aria-label="Yorliq nomi"
                          value={instr.label}
                          onChange={(e) =>
                            updateRow(idx, { ...instr, label: e.target.value })
                          }
                          className="w-24 rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[13.5px]"
                        />
                      ) : instr.op === 'JUMP' || instr.op === 'CALL' ? (
                        <input
                          type="text"
                          aria-label="Nishon yorligʻi"
                          value={instr.targetLabel}
                          onChange={(e) =>
                            updateRow(idx, { ...instr, targetLabel: e.target.value })
                          }
                          className="w-24 rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[13.5px]"
                        />
                      ) : instr.op === 'OUT' ? (
                        <OperandEditor
                          label="Chiqariladigan qiymat"
                          value={instr.value}
                          disabled={false}
                          onChange={(v) => updateRow(idx, { ...instr, value: v })}
                        />
                      ) : instr.op === 'LIST_SET' ? (
                        <>
                          <input
                            type="text"
                            aria-label="Roʻyxat nomi"
                            value={instr.list}
                            onChange={(e) =>
                              updateRow(idx, { ...instr, list: e.target.value })
                            }
                            className="w-20 rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[13.5px]"
                          />
                          <input
                            type="text"
                            aria-label="Roʻyxat elementlari (vergul bilan)"
                            value={instr.items.join(',')}
                            onChange={(e) => {
                              const nums = e.target.value
                                .split(',')
                                .map((s) => Number(s.trim()))
                                .filter((n) => Number.isFinite(n));
                              updateRow(idx, { ...instr, items: nums });
                            }}
                            className="w-28 rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[13.5px]"
                          />
                        </>
                      ) : instr.op === 'LIST_PUSH' ? (
                        <>
                          <input
                            type="text"
                            aria-label="Roʻyxat nomi"
                            value={instr.list}
                            onChange={(e) =>
                              updateRow(idx, { ...instr, list: e.target.value })
                            }
                            className="w-20 rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[13.5px]"
                          />
                          <OperandEditor
                            label="Qoʻshiladigan qiymat"
                            value={instr.value}
                            disabled={false}
                            onChange={(v) => updateRow(idx, { ...instr, value: v })}
                          />
                        </>
                      ) : instr.op === 'LIST_GET' ? (
                        <>
                          <input
                            type="text"
                            aria-label="Saqlash qutisi"
                            value={instr.target}
                            onChange={(e) =>
                              updateRow(idx, { ...instr, target: e.target.value })
                            }
                            className="w-20 rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[13.5px]"
                          />
                          <span>=</span>
                          <input
                            type="text"
                            aria-label="Roʻyxat nomi"
                            value={instr.list}
                            onChange={(e) =>
                              updateRow(idx, { ...instr, list: e.target.value })
                            }
                            className="w-20 rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[13.5px]"
                          />
                          <OperandEditor
                            label="Indeks"
                            value={instr.index}
                            disabled={false}
                            onChange={(v) => updateRow(idx, { ...instr, index: v })}
                          />
                        </>
                      ) : instr.op === 'LIST_LEN' ? (
                        <>
                          <input
                            type="text"
                            aria-label="Natija qutisi"
                            value={instr.target}
                            onChange={(e) =>
                              updateRow(idx, { ...instr, target: e.target.value })
                            }
                            className="w-20 rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[13.5px]"
                          />
                          <input
                            type="text"
                            aria-label="Roʻyxat nomi"
                            value={instr.list}
                            onChange={(e) =>
                              updateRow(idx, { ...instr, list: e.target.value })
                            }
                            className="w-20 rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[13.5px]"
                          />
                        </>
                      ) : null}
                    </div>
                  )}
                </div>

                {!readOnly ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={`${idx + 1}-qatorni yuqoriga koʻchirish`}
                      disabled={idx === 0}
                      onClick={() => moveRow(idx, idx - 1)}
                      className="min-h-[44px] min-w-[44px] cursor-pointer rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface-inset)] px-2 text-[14px] font-bold disabled:opacity-35"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`${idx + 1}-qatorni pastga koʻchirish`}
                      disabled={idx === instructions.length - 1}
                      onClick={() => moveRow(idx, idx + 1)}
                      className="min-h-[44px] min-w-[44px] cursor-pointer rounded-[8px] border border-[var(--line-strong)] bg-[var(--surface-inset)] px-2 text-[14px] font-bold disabled:opacity-35"
                    >
                      ↓
                    </button>
                    {!arrangeOnly ? (
                      <button
                        type="button"
                        aria-label={`${idx + 1}-qatorni oʻchirish`}
                        onClick={() => deleteRow(idx)}
                        className="min-h-[44px] min-w-[44px] cursor-pointer rounded-[8px] border border-[var(--danger)] bg-[var(--danger)]/15 px-2 text-[15px] font-bold text-[var(--danger-ink)]"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
