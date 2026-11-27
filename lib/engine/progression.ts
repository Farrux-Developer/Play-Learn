/**
 * Pure progression, diagnostic scoring, and workshop unlock logic.
 * Decoupled from React UI so all rules can be unit-tested deterministically.
 */

import type { WorkshopId } from './store';
export {
  WORKSHOP_THRESHOLDS,
  computeUnlockedWorkshops,
  applyXpReward,
  type XpRewardOutcome,
} from './xp';

export interface DiagnosticQuestion {
  id: string;
  prompt: string;
  code: string;
  options: string[];
  correctIndex: number;
  feedback: string;
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'diag-1',
    prompt: 'Avval qaysi son chop etiladi?',
    code: 'son = 4\nson = son + 2\nchopEt(son)',
    options: ['4', '6', '42'],
    correctIndex: 1,
    feedback: 'Qutidagi 4 soniga 2 qoʻshilib, 6 saqlandi.',
  },
  {
    id: 'diag-2',
    prompt: 'agar (yosh >= 12) sharti yosh = 12 boʻlganda qanday qiymat beradi?',
    code: 'yosh = 12\nagar (yosh >= 12) { ... }',
    options: ['Rost (bajariladi)', 'Yolgʻon (oʻtkaziladi)', 'Xato chiqadi'],
    correctIndex: 0,
    feedback: '12 >= 12 sharti tenglikni ham oladi, shuning uchun rost.',
  },
  {
    id: 'diag-3',
    prompt: 'Bu sikl ichidagi buyruq necha marta ishlaydi?',
    code: 'uchun i = 1 dan 3 gacha {\n  qadam()\n}',
    options: ['2 marta', '3 marta', '4 marta'],
    correctIndex: 1,
    feedback: 'i qiymati 1, 2, 3 boʻlib jami 3 marta aylanadi.',
  },
];

export function evaluateDiagnostic(answers: number[]): {
  correctCount: number;
  total: number;
  xpEarned: number;
  recommendedWorkshop: WorkshopId;
} {
  let correctCount = 0;
  DIAGNOSTIC_QUESTIONS.forEach((q, idx) => {
    if (answers[idx] === q.correctIndex) {
      correctCount += 1;
    }
  });

  const xpEarned = 10 + correctCount * 5;
  const recommendedWorkshop: WorkshopId =
    correctCount >= 3 ? 'sikllar' : correctCount === 2 ? 'mantiq' : 'algoritmlar';

  return {
    correctCount,
    total: DIAGNOSTIC_QUESTIONS.length,
    xpEarned,
    recommendedWorkshop,
  };
}
