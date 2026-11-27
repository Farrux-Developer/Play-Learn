import { z } from 'zod';
import {
  LEVEL_KINDS,
  SKILL_STATES,
  WORKSHOP_ORDER,
} from '@/lib/game/core/types';
import { SUPPORTED_LOCALES } from '@/lib/i18n/types';

export const ProgressSchemaVersion = 2 as const;

export const SkillProgressSchema = z.object({
  skillId: z.string().min(1),
  state: z.enum(SKILL_STATES),
  mastery: z.number().min(0).max(1),
  leitnerBox: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]),
  completedKinds: z.array(z.enum(LEVEL_KINDS)),
  consecutiveMisses: z.number().int().min(0),
  masteredAt: z.number().nullable(),
  lastReviewedAt: z.number().nullable(),
  nextReviewAt: z.number().nullable(),
});

export const LevelProgressSchema = z.object({
  bestStars: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  attempts: z.number().int().min(0),
  hintsUsed: z.number().int().min(0),
  bestTicks: z.number().int().positive().optional(),
  updatedAt: z.number(),
});

export const PrePostCheckSchema = z.object({
  preScore: z.number().min(0).max(5).optional(),
  postScore: z.number().min(0).max(5).optional(),
});

export const ProgressV2Schema = z.object({
  schemaVersion: z.literal(2),
  profile: z.object({
    nickname: z.string().max(32),
    avatar: z.enum(['boy', 'girl', 'neutral']),
  }),
  settings: z.object({
    locale: z.enum(SUPPORTED_LOCALES),
    soundEnabled: z.boolean(),
    subtitlesEnabled: z.boolean(),
    motionPaused: z.boolean(),
    liteMode: z.boolean(),
    dyslexiaFont: z.boolean(),
    surfaceMode: z.enum(['paper', 'blueprint']),
  }),
  xp: z.number().int().min(0),
  streak: z.number().int().min(0),
  streakFreezes: z.number().int().min(0).max(3),
  lastActiveDay: z.string().nullable(),
  diagnosticCompleted: z.boolean(),
  seenLessons: z.array(z.string()),
  completedLessons: z.array(z.string()),
  unlockedWorkshops: z.array(z.enum(WORKSHOP_ORDER)),
  solvedLegacyTasks: z.array(z.string()),
  machineTick: z.number().int().min(0),
  levels: z.record(z.string(), LevelProgressSchema),
  skills: z.record(z.string(), SkillProgressSchema),
  prePostChecks: z.record(z.string(), PrePostCheckSchema),
  updatedAt: z.number(),
});

export type ProgressV2 = z.infer<typeof ProgressV2Schema>;

export function createDefaultProgressV2(nowMs = 0): ProgressV2 {
  return {
    schemaVersion: 2,
    profile: {
      nickname: '',
      avatar: 'neutral',
    },
    settings: {
      locale: 'uz',
      soundEnabled: false,
      subtitlesEnabled: true,
      motionPaused: false,
      liteMode: false,
      dyslexiaFont: false,
      surfaceMode: 'paper',
    },
    xp: 15,
    streak: 0,
    streakFreezes: 1,
    lastActiveDay: null,
    diagnosticCompleted: false,
    seenLessons: ['L1'],
    completedLessons: [],
    unlockedWorkshops: ['kompyuter-ichida', 'algoritm'],
    solvedLegacyTasks: [],
    machineTick: 0,
    levels: {},
    skills: {},
    prePostChecks: {},
    updatedAt: nowMs,
  };
}
