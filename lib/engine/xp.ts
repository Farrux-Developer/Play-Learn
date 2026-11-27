/**
 * Minimal pure XP & workshop-unlock updater isolated from diagnostic quiz payloads
 * so landing First-Load JS stays <= 120 KB gz.
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
