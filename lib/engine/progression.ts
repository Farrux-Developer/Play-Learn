/**
 * Pure progression, diagnostic scoring, and workshop unlock logic.
 * Decoupled from React UI so all rules can be unit-tested deterministically.
 */

import { getLevelInfo, type WorkshopId, type WorkshopState } from './store';

export const WORKSHOP_THRESHOLDS: Record<WorkshopId, number> = {
  algoritmlar: 0,
  mantiq: 60,
  sikllar: 120,
};

export interface XpRewardOutcome {
  nextState: WorkshopState;
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
  newlyUnlockedWorkshops: WorkshopId[];
}

export function computeUnlockedWorkshops(
  xp: number,
  existing: WorkshopId[] = []
): WorkshopId[] {
  const safeXp = Math.max(0, Math.floor(xp));
  const set = new Set<WorkshopId>(existing);
  set.add('algoritmlar');
  if (safeXp >= WORKSHOP_THRESHOLDS.mantiq) set.add('mantiq');
  if (safeXp >= WORKSHOP_THRESHOLDS.sikllar) set.add('sikllar');
  return (['algoritmlar', 'mantiq', 'sikllar'] as WorkshopId[]).filter((id) =>
    set.has(id)
  );
}

export function applyXpReward(
  state: WorkshopState,
  xpDelta: number,
  options?: {
    markLessonId?: string;
    markTaskId?: string;
    incrementStreak?: boolean;
  }
): XpRewardOutcome {
  const prevInfo = getLevelInfo(state.xp);
  const nextXp = Math.max(0, Math.floor(state.xp + xpDelta));
  const nextInfo = getLevelInfo(nextXp);

  const nextUnlocked = computeUnlockedWorkshops(nextXp, state.unlockedWorkshops);
  const newlyUnlockedWorkshops = nextUnlocked.filter(
    (id) => !state.unlockedWorkshops.includes(id)
  );

  const completedLessons =
    options?.markLessonId && !state.completedLessons.includes(options.markLessonId)
      ? [...state.completedLessons, options.markLessonId]
      : state.completedLessons;

  const seenLessons =
    options?.markLessonId && !state.seenLessons.includes(options.markLessonId)
      ? [...state.seenLessons, options.markLessonId]
      : state.seenLessons;

  const solvedTasks =
    options?.markTaskId && !state.solvedTasks.includes(options.markTaskId)
      ? [...state.solvedTasks, options.markTaskId]
      : state.solvedTasks;

  const nextState: WorkshopState = {
    ...state,
    xp: nextXp,
    streak: options?.incrementStreak ? state.streak + 1 : state.streak,
    unlockedWorkshops: nextUnlocked,
    completedLessons,
    seenLessons,
    solvedTasks,
  };

  return {
    nextState,
    leveledUp: nextInfo.level > prevInfo.level,
    previousLevel: prevInfo.level,
    newLevel: nextInfo.level,
    newlyUnlockedWorkshops,
  };
}

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
