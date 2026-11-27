import type { CoreWorkshopId, LevelKind, SkillState } from '@/lib/game/core/types';

export type LeitnerBox = 0 | 1 | 2 | 3 | 4;

export interface SkillProgress {
  skillId: string;
  state: SkillState;
  /** Normalized 0..1 mastery estimate derived from transparent attempt evidence */
  mastery: number;
  leitnerBox: LeitnerBox;
  completedKinds: LevelKind[];
  consecutiveMisses: number;
  masteredAt: number | null;
  lastReviewedAt: number | null;
  nextReviewAt: number | null;
}

export interface AttemptEvidence {
  skillId: string;
  levelId: string;
  kind: LevelKind;
  passed: boolean;
  firstTry: boolean;
  hintsUsed: number;
  predictCorrect: boolean | null;
  nowMs: number;
}

export interface MasteryUpdateResult {
  next: SkillProgress;
  masteryGain: number;
  xpAwarded: number;
  transferredToNewKind: boolean;
  becameRetained: boolean;
}

export interface RepairItem {
  skillId: string;
  workshop: CoreWorkshopId;
  reason: 'decayed' | 'due' | 'weak';
  priority: number;
  overdueDays: number;
}
