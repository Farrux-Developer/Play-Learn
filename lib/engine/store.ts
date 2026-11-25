/**
 * Persistent browser workshop progress wrapped in try/catch localStorage.
 * Preserves initial 15/120 XP, level 1, streak 0, sound OFF, subtitles ON defaults.
 */

export type SurfaceMode = 'paper' | 'blueprint';
export type WorkshopId = 'algoritmlar' | 'mantiq' | 'sikllar';

export interface WorkshopState {
  xp: number;
  streak: number;
  soundEnabled: boolean;
  subtitlesEnabled: boolean;
  motionPaused: boolean;
  liteMode: boolean;
  surfaceMode: SurfaceMode;
  seenLessons: string[];
  completedLessons: string[];
  unlockedWorkshops: WorkshopId[];
  solvedTasks: string[];
  machineTick: number;
}

const STORAGE_KEY = 'oyna_organ_workshop_v1';
export const XP_PER_LEVEL = 120;

export function createDefaultState(): WorkshopState {
  return {
    xp: 15,
    streak: 0,
    soundEnabled: false,
    subtitlesEnabled: true,
    motionPaused: false,
    liteMode: false,
    surfaceMode: 'paper',
    seenLessons: ['L1'],
    completedLessons: [],
    unlockedWorkshops: ['algoritmlar'],
    solvedTasks: [],
    machineTick: 0,
  };
}

export function getLevelInfo(xp: number) {
  const safeXp = Math.max(0, Math.floor(xp));
  const level = Math.floor(safeXp / XP_PER_LEVEL) + 1;
  const inLevelXp = safeXp % XP_PER_LEVEL;
  const progressPct = Math.round((inLevelXp / XP_PER_LEVEL) * 100);
  return { level, inLevelXp, targetXp: XP_PER_LEVEL, progressPct };
}

export function loadWorkshopState(): WorkshopState {
  const fallback = createDefaultState();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<WorkshopState>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function saveWorkshopState(state: WorkshopState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or private mode blocks.
  }
}

export function clearWorkshopState(): WorkshopState {
  const fresh = createDefaultState();
  saveWorkshopState(fresh);
  return fresh;
}
