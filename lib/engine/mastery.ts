/**
 * Pedagogical engine: BKT-lite mastery tracking, adaptive difficulty (ZPD),
 * SM-2 spaced repetition, Seen/Applied/Explained stages, misconception analytics,
 * twin repair rewards, daily review queue, and resilient localStorage persistence (schema v3).
 */

import {
  LOGIC_TASKS,
  LOOP_BUG_TASKS,
  SEQUENCE_TASKS,
  type DifficultyLevel,
  type SkillId,
} from '../data/curriculum';
import type { LessonId } from '../data/lessons';
import type { LocaleScript } from './i18n';

export const LEGACY_STORAGE_KEY_V2 = 'oyna_va_organ_progress_v2';
export const PROGRESS_STORAGE_KEY = 'oyna_va_organ_progress_v3';
export const CURRENT_SCHEMA_VERSION = 3;
export const MASTERY_THRESHOLD = 0.7;

export type QualityTier = 'high' | 'medium' | 'low';

export interface SkillProgress {
  mastery: number; // 0.0 to 1.0
  attempts: number;
  correct: number;
  consecutiveErrors: number;
  currentDifficulty: DifficultyLevel;
  completedTaskIds: string[];
  /** SM-2 spaced repetition state */
  repetitionCount: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewAt: number | null;
}

export interface UserPreferences {
  soundEnabled: boolean;
  subtitlesEnabled: boolean;
  reducedMotion: boolean;
  dyslexiaMode: boolean;
  qualityTier: QualityTier;
  script: LocaleScript;
  showRealCode: boolean;
}

export interface ProgressState {
  schemaVersion: number;
  xp: number;
  streak: number;
  bestStreak: number;
  unlockedBadges: string[];
  diagnosticDone: boolean;
  diagnosticScore: number | null;
  firstWinSeconds: number | null;
  sessionStartedAt: number;
  seenLessons: LessonId[];
  explainedLessons: LessonId[];
  misconceptionCounts: Record<string, number>;
  repairedTaskIds: string[];
  skills: Record<SkillId, SkillProgress>;
  preferences: UserPreferences;
}

export interface SkillStageStatus {
  seen: boolean;
  applied: boolean;
  explained: boolean;
}

export interface DailyReviewItem {
  skillId: SkillId;
  taskId: string;
  reason: 'misconception' | 'due' | 'fresh';
}

function createInitialSkill(difficulty: DifficultyLevel = 1): SkillProgress {
  return {
    mastery: 0,
    attempts: 0,
    correct: 0,
    consecutiveErrors: 0,
    currentDifficulty: difficulty,
    completedTaskIds: [],
    repetitionCount: 0,
    intervalDays: 1,
    easeFactor: 2.5,
    nextReviewAt: null,
  };
}

export function createInitialProgress(now: number = Date.now()): ProgressState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    xp: 0,
    streak: 0,
    bestStreak: 0,
    unlockedBadges: [],
    diagnosticDone: false,
    diagnosticScore: null,
    firstWinSeconds: null,
    sessionStartedAt: now,
    seenLessons: [],
    explainedLessons: [],
    misconceptionCounts: {},
    repairedTaskIds: [],
    skills: {
      algoritmlar: createInitialSkill(1),
      mantiq: createInitialSkill(1),
      sikllar: createInitialSkill(1),
    },
    preferences: {
      soundEnabled: false,
      subtitlesEnabled: true,
      reducedMotion: false,
      dyslexiaMode: false,
      qualityTier: 'high',
      script: 'uz-Latn',
      showRealCode: false,
    },
  };
}

export function getLevelFromXp(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  percent: number;
} {
  const safeXp = Math.max(0, Math.floor(xp));
  const level = Math.floor(safeXp / 120) + 1;
  const currentLevelBase = (level - 1) * 120;
  const currentLevelXp = safeXp - currentLevelBase;
  const percent = Math.min(100, Math.round((currentLevelXp / 120) * 100));
  return {
    level,
    currentLevelXp,
    nextLevelXp: 120,
    percent,
  };
}

export function getSkillStages(
  state: ProgressState,
  skillId: SkillId
): SkillStageStatus {
  const sp = state.skills[skillId];
  const applied =
    sp.completedTaskIds.length >= 3 || sp.mastery >= MASTERY_THRESHOLD;

  if (skillId === 'algoritmlar') {
    return {
      seen: state.seenLessons.includes('L1'),
      applied,
      explained: state.explainedLessons.includes('L1'),
    };
  }
  if (skillId === 'mantiq') {
    return {
      seen:
        state.seenLessons.includes('L2') || state.seenLessons.includes('L3'),
      applied,
      explained:
        state.explainedLessons.includes('L2') &&
        state.explainedLessons.includes('L3'),
    };
  }
  return {
    seen: state.seenLessons.includes('L4'),
    applied,
    explained: state.explainedLessons.includes('L4'),
  };
}

function evaluateMasteryBadges(state: ProgressState): {
  unlockedBadges: string[];
  newlyUnlockedBadges: string[];
} {
  const badges = new Set(state.unlockedBadges);
  const newlyUnlockedBadges: string[] = [];

  const grantBadge = (id: string) => {
    if (!badges.has(id)) {
      badges.add(id);
      newlyUnlockedBadges.push(id);
    }
  };

  if (state.streak >= 3) grantBadge('kombo-3');
  if (state.repairedTaskIds.length >= 1) grantBadge('xato-tuzatuvchi');

  if (state.skills.algoritmlar.mastery >= MASTERY_THRESHOLD) {
    grantBadge('algoritm-ustasi');
  }
  if (state.skills.mantiq.mastery >= MASTERY_THRESHOLD) {
    grantBadge('mantiq-posboni');
  }
  if (state.skills.sikllar.mastery >= MASTERY_THRESHOLD) {
    grantBadge('xato-ovchisi');
  }

  const allMasteredAndExplained = (['algoritmlar', 'mantiq', 'sikllar'] as SkillId[]).every(
    (id) =>
      state.skills[id].mastery >= MASTERY_THRESHOLD &&
      getSkillStages(state, id).explained
  );

  if (allMasteredAndExplained) {
    grantBadge('kod-meʼmori');
  }

  return {
    unlockedBadges: Array.from(badges),
    newlyUnlockedBadges,
  };
}

/**
 * Checks whether a skill node is unlocked based on prerequisite mastery or diagnostic placement.
 */
export function isSkillUnlocked(state: ProgressState, skillId: SkillId): boolean {
  if (skillId === 'algoritmlar') return true;
  if (skillId === 'mantiq') {
    return (
      state.skills.algoritmlar.mastery >= MASTERY_THRESHOLD ||
      state.skills.algoritmlar.completedTaskIds.length >= 3 ||
      (state.diagnosticScore !== null && state.diagnosticScore >= 2)
    );
  }
  return (
    state.skills.mantiq.mastery >= MASTERY_THRESHOLD ||
    state.skills.mantiq.completedTaskIds.length >= 3 ||
    (state.diagnosticScore !== null && state.diagnosticScore >= 3)
  );
}

/**
 * BKT-lite + Adaptive Difficulty + SM-2 update on a task attempt.
 */
export function recordTaskAttempt(
  state: ProgressState,
  params: {
    skillId: SkillId;
    taskId: string;
    isCorrect: boolean;
    hintsUsed: number;
    misconceptionId?: string;
    now?: number;
  }
): {
  nextState: ProgressState;
  xpEarned: number;
  newlyUnlockedBadges: string[];
  steppedDown: boolean;
} {
  const now = params.now ?? Date.now();
  const prevSkill = state.skills[params.skillId];

  const nextSkills: Record<SkillId, SkillProgress> = {
    algoritmlar: { ...state.skills.algoritmlar },
    mantiq: { ...state.skills.mantiq },
    sikllar: { ...state.skills.sikllar },
  };

  const skill = {
    ...prevSkill,
    completedTaskIds: [...prevSkill.completedTaskIds],
  };

  const nextMisconceptions = { ...state.misconceptionCounts };

  skill.attempts += 1;
  let xpEarned = 0;
  let steppedDown = false;
  let nextStreak = state.streak;

  if (params.isCorrect) {
    skill.correct += 1;
    skill.consecutiveErrors = 0;
    nextStreak += 1;

    const hintPenalty = Math.min(0.06, params.hintsUsed * 0.02);
    const gain = Math.max(0.06, 0.16 - hintPenalty) * (1 - skill.mastery * 0.45);
    skill.mastery = Number(Math.min(1, skill.mastery + gain).toFixed(3));

    if (!skill.completedTaskIds.includes(params.taskId)) {
      skill.completedTaskIds.push(params.taskId);
    }

    const comboBonus = Math.min(20, (nextStreak - 1) * 5);
    const hintCost = params.hintsUsed * 4;
    xpEarned = Math.max(8, 20 + comboBonus - hintCost);

    if (skill.correct % 3 === 0 && skill.currentDifficulty < 3 && params.hintsUsed <= 1) {
      skill.currentDifficulty = (skill.currentDifficulty + 1) as DifficultyLevel;
    }

    const quality = Math.max(3, 5 - params.hintsUsed);
    skill.repetitionCount += 1;
    if (skill.repetitionCount === 1) {
      skill.intervalDays = 1;
    } else if (skill.repetitionCount === 2) {
      skill.intervalDays = 3;
    } else {
      skill.intervalDays = Math.round(skill.intervalDays * skill.easeFactor);
    }
    skill.easeFactor = Number(
      Math.max(
        1.3,
        skill.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      ).toFixed(2)
    );
    skill.nextReviewAt = now + skill.intervalDays * 24 * 60 * 60 * 1000;
  } else {
    skill.consecutiveErrors += 1;
    nextStreak = 0;
    skill.mastery = Number(Math.max(0, skill.mastery - 0.03).toFixed(3));

    if (params.misconceptionId && params.misconceptionId !== 'ok') {
      nextMisconceptions[params.misconceptionId] =
        (nextMisconceptions[params.misconceptionId] ?? 0) + 1;
    }

    if (skill.consecutiveErrors >= 2 && skill.currentDifficulty > 1) {
      skill.currentDifficulty = (skill.currentDifficulty - 1) as DifficultyLevel;
      steppedDown = true;
    }

    skill.repetitionCount = 0;
    skill.intervalDays = 1;
    skill.nextReviewAt = now + 12 * 60 * 60 * 1000;
  }

  nextSkills[params.skillId] = skill;

  const bestStreak = Math.max(state.bestStreak, nextStreak);
  const nextXp = state.xp + xpEarned;

  const firstWinSeconds =
    params.isCorrect && state.firstWinSeconds === null
      ? Math.max(1, Math.round((now - state.sessionStartedAt) / 1000))
      : state.firstWinSeconds;

  const draftState: ProgressState = {
    ...state,
    xp: nextXp,
    streak: nextStreak,
    bestStreak,
    firstWinSeconds,
    misconceptionCounts: nextMisconceptions,
    skills: nextSkills,
  };

  if (params.isCorrect && !draftState.unlockedBadges.includes('ilk-qadam')) {
    draftState.unlockedBadges = [...draftState.unlockedBadges, 'ilk-qadam'];
  }

  const badgeEval = evaluateMasteryBadges(draftState);
  const newlyUnlockedBadges = [
    ...(params.isCorrect && !state.unlockedBadges.includes('ilk-qadam')
      ? ['ilk-qadam']
      : []),
    ...badgeEval.newlyUnlockedBadges,
  ];

  return {
    nextState: {
      ...draftState,
      unlockedBadges: badgeEval.unlockedBadges,
    },
    xpEarned,
    newlyUnlockedBadges,
    steppedDown,
  };
}

/**
 * Records a standalone misconception occurrence (e.g. from Diagnostic or Lesson checks).
 */
export function recordMisconception(
  state: ProgressState,
  misconceptionId?: string
): ProgressState {
  if (!misconceptionId || misconceptionId === 'ok') return state;
  return {
    ...state,
    misconceptionCounts: {
      ...state.misconceptionCounts,
      [misconceptionId]: (state.misconceptionCounts[misconceptionId] ?? 0) + 1,
    },
  };
}

/**
 * Records mini-lesson seen/explained completion and awards teach-back / transfer XP.
 */
export function recordLessonProgress(
  state: ProgressState,
  params: {
    lessonId: LessonId;
    seen?: boolean;
    explained?: boolean;
    xpBonus?: number;
  }
): {
  nextState: ProgressState;
  xpEarned: number;
  newlyUnlockedBadges: string[];
} {
  const seenSet = new Set(state.seenLessons);
  const explainedSet = new Set(state.explainedLessons);

  const alreadyExplained = explainedSet.has(params.lessonId);
  if (params.seen) seenSet.add(params.lessonId);
  if (params.explained) {
    seenSet.add(params.lessonId);
    explainedSet.add(params.lessonId);
  }

  const xpEarned =
    params.xpBonus && (!params.explained || !alreadyExplained)
      ? params.xpBonus
      : 0;

  const draft: ProgressState = {
    ...state,
    xp: state.xp + xpEarned,
    seenLessons: Array.from(seenSet),
    explainedLessons: Array.from(explainedSet),
  };

  const badgeEval = evaluateMasteryBadges(draft);
  return {
    nextState: {
      ...draft,
      unlockedBadges: badgeEval.unlockedBadges,
    },
    xpEarned,
    newlyUnlockedBadges: badgeEval.newlyUnlockedBadges,
  };
}

/**
 * Records solving a twin question after a miss ("xatoni tuzatish bonusi").
 */
export function recordTwinRepair(
  state: ProgressState,
  params: {
    taskId: string;
    isCorrect: boolean;
  }
): {
  nextState: ProgressState;
  xpEarned: number;
  newlyUnlockedBadges: string[];
} {
  if (!params.isCorrect) {
    return {
      nextState: state,
      xpEarned: 0,
      newlyUnlockedBadges: [],
    };
  }

  const alreadyRepaired = state.repairedTaskIds.includes(params.taskId);
  const xpEarned = alreadyRepaired ? 5 : 15;
  const nextRepaired = alreadyRepaired
    ? state.repairedTaskIds
    : [...state.repairedTaskIds, params.taskId];

  const draft: ProgressState = {
    ...state,
    xp: state.xp + xpEarned,
    repairedTaskIds: nextRepaired,
  };

  const badgeEval = evaluateMasteryBadges(draft);
  return {
    nextState: {
      ...draft,
      unlockedBadges: badgeEval.unlockedBadges,
    },
    xpEarned,
    newlyUnlockedBadges: badgeEval.newlyUnlockedBadges,
  };
}

export function getTopMisconceptions(
  state: ProgressState,
  limit = 3
): Array<{ id: string; count: number }> {
  return Object.entries(state.misconceptionCounts)
    .filter(([id, count]) => count > 0 && id !== 'ok')
    .sort((a, b) => {
      // Surface conceptual misconceptions before random 'slip' unless only slips exist
      if (a[0] === 'slip' && b[0] !== 'slip') return 1;
      if (b[0] === 'slip' && a[0] !== 'slip') return -1;
      return b[1] - a[1];
    })
    .slice(0, limit)
    .map(([id, count]) => ({ id, count }));
}

/**
 * Builds a 5-question mixed daily review queue ("Kunlik takror") prioritized by
 * top misconceptions, SM-2 due skills, and balanced across the 3 workshops.
 */
export function buildDailyReviewQueue(
  state: ProgressState,
  now: number = Date.now()
): DailyReviewItem[] {
  const topMisconceptionIds = new Set(
    getTopMisconceptions(state, 3).map((m) => m.id)
  );
  const dueSkills = new Set<SkillId>(
    (['algoritmlar', 'mantiq', 'sikllar'] as SkillId[]).filter((id) => {
      const sp = state.skills[id];
      return sp.nextReviewAt !== null && now >= sp.nextReviewAt;
    })
  );

  type Candidate = DailyReviewItem & { score: number };
  const candidates: Candidate[] = [];

  for (const task of SEQUENCE_TASKS) {
    const done = state.skills.algoritmlar.completedTaskIds.includes(task.id);
    const hitsMisc = topMisconceptionIds.has(task.misconceptionId);
    const isDue = dueSkills.has('algoritmlar');
    const score = (hitsMisc ? 30 : 0) + (isDue ? 20 : 0) + (!done ? 10 : 0);
    candidates.push({
      skillId: 'algoritmlar',
      taskId: task.id,
      reason: hitsMisc ? 'misconception' : isDue ? 'due' : 'fresh',
      score,
    });
  }

  for (const task of LOGIC_TASKS) {
    const done = state.skills.mantiq.completedTaskIds.includes(task.id);
    const hitsMisc = task.misconceptionIds.some((id) =>
      topMisconceptionIds.has(id)
    );
    const isDue = dueSkills.has('mantiq');
    const score = (hitsMisc ? 30 : 0) + (isDue ? 20 : 0) + (!done ? 10 : 0);
    candidates.push({
      skillId: 'mantiq',
      taskId: task.id,
      reason: hitsMisc ? 'misconception' : isDue ? 'due' : 'fresh',
      score,
    });
  }

  for (const task of LOOP_BUG_TASKS) {
    const done = state.skills.sikllar.completedTaskIds.includes(task.id);
    const miscs = [
      ...(task.lineMisconceptions ?? []),
      ...(task.optionMisconceptions ?? []),
    ];
    const hitsMisc = miscs.some((id) => topMisconceptionIds.has(id));
    const isDue = dueSkills.has('sikllar');
    const score = (hitsMisc ? 30 : 0) + (isDue ? 20 : 0) + (!done ? 10 : 0);
    candidates.push({
      skillId: 'sikllar',
      taskId: task.id,
      reason: hitsMisc ? 'misconception' : isDue ? 'due' : 'fresh',
      score,
    });
  }

  // Pick at least 1 from each skill for variety, then top scoring remaining up to 5
  const selected: DailyReviewItem[] = [];
  const usedIds = new Set<string>();
  const sorted = [...candidates].sort((a, b) => b.score - a.score);

  for (const skillId of ['algoritmlar', 'mantiq', 'sikllar'] as SkillId[]) {
    const pick = sorted.find((c) => c.skillId === skillId && !usedIds.has(c.taskId));
    if (pick) {
      usedIds.add(pick.taskId);
      selected.push({
        skillId: pick.skillId,
        taskId: pick.taskId,
        reason: pick.reason,
      });
    }
  }

  for (const item of sorted) {
    if (selected.length >= 5) break;
    if (!usedIds.has(item.taskId)) {
      usedIds.add(item.taskId);
      selected.push({
        skillId: item.skillId,
        taskId: item.taskId,
        reason: item.reason,
      });
    }
  }

  return selected;
}

/**
 * Applies diagnostic placement results to seed initial mastery and starting node.
 */
export function applyDiagnosticResult(
  state: ProgressState,
  correctBySkill: Record<SkillId, boolean>
): ProgressState {
  const score = Object.values(correctBySkill).filter(Boolean).length;
  const nextSkills: Record<SkillId, SkillProgress> = {
    algoritmlar: { ...state.skills.algoritmlar },
    mantiq: { ...state.skills.mantiq },
    sikllar: { ...state.skills.sikllar },
  };

  if (correctBySkill.algoritmlar) {
    nextSkills.algoritmlar.mastery = Math.max(nextSkills.algoritmlar.mastery, 0.45);
    nextSkills.algoritmlar.currentDifficulty = 2;
  }
  if (correctBySkill.mantiq) {
    nextSkills.mantiq.mastery = Math.max(nextSkills.mantiq.mastery, 0.45);
    nextSkills.mantiq.currentDifficulty = 2;
  }
  if (correctBySkill.sikllar) {
    nextSkills.sikllar.mastery = Math.max(nextSkills.sikllar.mastery, 0.45);
    nextSkills.sikllar.currentDifficulty = 2;
  }

  return {
    ...state,
    diagnosticDone: true,
    diagnosticScore: score,
    xp: state.xp + score * 15,
    skills: nextSkills,
  };
}

/**
 * Migrates older saved schemas (v1 / v2) safely to v3 without losing user progress.
 */
export function migrateProgressState(raw: unknown): ProgressState {
  const fallback = createInitialProgress();
  if (!raw || typeof raw !== 'object') return fallback;
  const obj = raw as Partial<ProgressState>;

  const mergedSkills: Record<SkillId, SkillProgress> = {
    algoritmlar: { ...fallback.skills.algoritmlar, ...(obj.skills?.algoritmlar ?? {}) },
    mantiq: { ...fallback.skills.mantiq, ...(obj.skills?.mantiq ?? {}) },
    sikllar: { ...fallback.skills.sikllar, ...(obj.skills?.sikllar ?? {}) },
  };

  const validLessonIds = new Set<LessonId>(['L1', 'L2', 'L3', 'L4']);
  const seenLessons = Array.isArray(obj.seenLessons)
    ? obj.seenLessons.filter((id): id is LessonId => validLessonIds.has(id))
    : [];
  const explainedLessons = Array.isArray(obj.explainedLessons)
    ? obj.explainedLessons.filter((id): id is LessonId => validLessonIds.has(id))
    : [];

  const misconceptionCounts: Record<string, number> = {};
  if (obj.misconceptionCounts && typeof obj.misconceptionCounts === 'object') {
    for (const [k, v] of Object.entries(obj.misconceptionCounts)) {
      if (typeof v === 'number' && v > 0) {
        misconceptionCounts[k] = v;
      }
    }
  }

  return {
    ...fallback,
    ...obj,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    xp: typeof obj.xp === 'number' && obj.xp >= 0 ? obj.xp : 0,
    streak: typeof obj.streak === 'number' && obj.streak >= 0 ? obj.streak : 0,
    bestStreak:
      typeof obj.bestStreak === 'number' && obj.bestStreak >= 0 ? obj.bestStreak : 0,
    unlockedBadges: Array.isArray(obj.unlockedBadges) ? obj.unlockedBadges : [],
    seenLessons,
    explainedLessons,
    misconceptionCounts,
    repairedTaskIds: Array.isArray(obj.repairedTaskIds) ? obj.repairedTaskIds : [],
    skills: mergedSkills,
    preferences: {
      ...fallback.preferences,
      ...(obj.preferences ?? {}),
    },
  };
}

export function loadProgressFromStorage(): ProgressState {
  if (typeof window === 'undefined') return createInitialProgress();
  try {
    const rawV3 = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (rawV3) return migrateProgressState(JSON.parse(rawV3));

    const rawV2 = window.localStorage.getItem(LEGACY_STORAGE_KEY_V2);
    if (rawV2) {
      const migrated = migrateProgressState(JSON.parse(rawV2));
      saveProgressToStorage(migrated);
      return migrated;
    }
    return createInitialProgress();
  } catch {
    return createInitialProgress();
  }
}

export function saveProgressToStorage(state: ProgressState): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function resetProgressStorage(): ProgressState {
  const fresh = createInitialProgress();
  saveProgressToStorage(fresh);
  return fresh;
}
