/**
 * Pure domain primitives for Mirzo Ustaxonasi (zero React, DOM, or external deps).
 */

export const WORKSHOP_ORDER = [
  'kompyuter-ichida',
  'bit-bayt',
  'matn-rasm',
  'mantiq',
  'algoritm',
  'protsessor',
  'tarmoq',
  'xavfsizlik-ai',
  'kompyuter-yasa',
] as const;

export type CoreWorkshopId = (typeof WORKSHOP_ORDER)[number];

export const LEVEL_KINDS = [
  'build',
  'arrange',
  'predict',
  'debug',
  'modify',
  'boss',
  'sandbox',
] as const;

export type LevelKind = (typeof LEVEL_KINDS)[number];

export const REVIEW_STATUSES = ['draft', 'reviewed'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type StarCount = 0 | 1 | 2 | 3;

export const SKILL_STATES = [
  'new',
  'introduced',
  'practicing',
  'mastered',
  'retained',
] as const;

export type SkillState = (typeof SKILL_STATES)[number];
