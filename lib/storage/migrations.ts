/**
 * Safe versioned migrations from legacy localStorage v1 ('oyna_organ_workshop_v1')
 * to IndexedDB ProgressV2.
 */

import type { CoreWorkshopId } from '@/lib/game/core/types';
import type { WorkshopState } from '@/lib/engine/store';
import {
  createDefaultProgressV2,
  ProgressV2Schema,
  type ProgressV2,
} from './schema';

const LEGACY_TO_CORE_WORKSHOP: Record<string, CoreWorkshopId[]> = {
  algoritmlar: ['kompyuter-ichida', 'algoritm'],
  mantiq: ['mantiq', 'algoritm'],
  sikllar: ['algoritm'],
};

export function migrateFromV1(
  v1: Partial<WorkshopState> | null | undefined,
  nowMs: number
): ProgressV2 {
  const base = createDefaultProgressV2(nowMs);
  if (!v1 || typeof v1 !== 'object') return base;

  const unlockedSet = new Set<CoreWorkshopId>(base.unlockedWorkshops);
  if (Array.isArray(v1.unlockedWorkshops)) {
    for (const oldId of v1.unlockedWorkshops) {
      const mapped = LEGACY_TO_CORE_WORKSHOP[oldId];
      if (mapped) {
        for (const id of mapped) unlockedSet.add(id);
      }
    }
  }

  return {
    ...base,
    settings: {
      ...base.settings,
      soundEnabled: typeof v1.soundEnabled === 'boolean' ? v1.soundEnabled : base.settings.soundEnabled,
      subtitlesEnabled:
        typeof v1.subtitlesEnabled === 'boolean'
          ? v1.subtitlesEnabled
          : base.settings.subtitlesEnabled,
      motionPaused: typeof v1.motionPaused === 'boolean' ? v1.motionPaused : base.settings.motionPaused,
      liteMode: typeof v1.liteMode === 'boolean' ? v1.liteMode : base.settings.liteMode,
      surfaceMode:
        v1.surfaceMode === 'paper' || v1.surfaceMode === 'blueprint'
          ? v1.surfaceMode
          : base.settings.surfaceMode,
    },
    xp: typeof v1.xp === 'number' && Number.isFinite(v1.xp) ? Math.max(0, Math.floor(v1.xp)) : base.xp,
    streak:
      typeof v1.streak === 'number' && Number.isFinite(v1.streak)
        ? Math.max(0, Math.floor(v1.streak))
        : base.streak,
    seenLessons: Array.isArray(v1.seenLessons)
      ? v1.seenLessons.filter((x): x is string => typeof x === 'string')
      : base.seenLessons,
    completedLessons: Array.isArray(v1.completedLessons)
      ? v1.completedLessons.filter((x): x is string => typeof x === 'string')
      : base.completedLessons,
    unlockedWorkshops: Array.from(unlockedSet),
    solvedLegacyTasks: Array.isArray(v1.solvedTasks)
      ? v1.solvedTasks.filter((x): x is string => typeof x === 'string')
      : base.solvedLegacyTasks,
    machineTick:
      typeof v1.machineTick === 'number' && Number.isFinite(v1.machineTick)
        ? Math.max(0, Math.floor(v1.machineTick))
        : base.machineTick,
    updatedAt: nowMs,
  };
}

export function migrateProgress(raw: unknown, nowMs: number): ProgressV2 {
  if (!raw || typeof raw !== 'object') {
    return createDefaultProgressV2(nowMs);
  }

  const parsedV2 = ProgressV2Schema.safeParse(raw);
  if (parsedV2.success) {
    return parsedV2.data;
  }

  const record = raw as Record<string, unknown>;
  if (!('schemaVersion' in record) || record.schemaVersion === 1) {
    return migrateFromV1(record as Partial<WorkshopState>, nowMs);
  }

  return createDefaultProgressV2(nowMs);
}
