/**
 * Deterministic Leitner-5 mastery & delayed-retention engine (ADR-0003).
 * Pure functions with injected `nowMs` clock for reproducible unit & property tests.
 */

import type { LevelKind, SkillState } from '@/lib/game/core/types';
import type {
  AttemptEvidence,
  LeitnerBox,
  MasteryUpdateResult,
  SkillProgress,
} from './types';

export const DAY_MS = 86_400_000;

export const LEITNER_INTERVALS_MS: Record<LeitnerBox, number> = {
  0: 0,
  1: 1 * DAY_MS,
  2: 3 * DAY_MS,
  3: 7 * DAY_MS,
  4: 14 * DAY_MS,
};

/** Skill must pass a delayed review >= 7 days after mastery to become 'retained'. */
export const RETENTION_DELAY_MS = 7 * DAY_MS;

export const WORKSHOP_XP_CAP = 200;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(4))));
}

export function createInitialSkillProgress(skillId: string): SkillProgress {
  return {
    skillId,
    state: 'new',
    mastery: 0,
    leitnerBox: 0,
    completedKinds: [],
    consecutiveMisses: 0,
    masteredAt: null,
    lastReviewedAt: null,
    nextReviewAt: null,
  };
}

function nextBoxUp(box: LeitnerBox): LeitnerBox {
  if (box >= 4) return 4;
  return (box + 1) as LeitnerBox;
}

function nextBoxDown(box: LeitnerBox): LeitnerBox {
  if (box <= 0) return 0;
  return (box - 1) as LeitnerBox;
}

export function applySkillEvidence(
  prev: SkillProgress,
  ev: AttemptEvidence
): MasteryUpdateResult {
  const safeHints = Math.max(0, Math.floor(ev.hintsUsed));

  if (!ev.passed) {
    const downBox = nextBoxDown(prev.leitnerBox);
    const nextState: SkillState =
      prev.state === 'new' ? 'introduced' : prev.state === 'retained' ? 'mastered' : prev.state;
    const next: SkillProgress = {
      ...prev,
      state: nextState,
      leitnerBox: downBox,
      consecutiveMisses: prev.consecutiveMisses + 1,
      lastReviewedAt: ev.nowMs,
      nextReviewAt: ev.nowMs + LEITNER_INTERVALS_MS[1],
    };
    return {
      next,
      masteryGain: 0,
      xpAwarded: 0,
      transferredToNewKind: false,
      becameRetained: false,
    };
  }

  const transferredToNewKind =
    ev.kind !== 'sandbox' && !prev.completedKinds.includes(ev.kind);

  const completedKinds: LevelKind[] = transferredToNewKind
    ? [...prev.completedKinds, ev.kind]
    : prev.completedKinds;

  // Transparent weighted mastery increment with diminishing returns when repeating the same kind
  let delta = 0.18;
  if (ev.firstTry) delta += 0.08;
  if (safeHints === 0) delta += 0.06;
  if (ev.predictCorrect === true) delta += 0.06;
  delta -= Math.min(0.12, safeHints * 0.04);

  if (transferredToNewKind) {
    delta += 0.14;
  } else if (completedKinds.length < 2 && !completedKinds.includes('boss')) {
    delta *= 0.4;
  }
  delta = Math.max(0.06, delta);

  const hasTransferOrBoss =
    completedKinds.length >= 2 || completedKinds.includes('boss');
  const rawNext = prev.mastery + delta;
  const nextMastery = clamp01(hasTransferOrBoss ? rawNext : Math.min(0.78, rawNext));
  const masteryGain = Math.max(0, Number((nextMastery - prev.mastery).toFixed(4)));
  const upBox = nextBoxUp(prev.leitnerBox);
  const nextReviewAt = ev.nowMs + LEITNER_INTERVALS_MS[upBox];

  let nextState: SkillState = 'practicing';
  let masteredAt = prev.masteredAt;
  let becameRetained = false;

  if (nextMastery >= 0.8 && hasTransferOrBoss) {
    if (
      prev.state === 'mastered' &&
      prev.masteredAt !== null &&
      ev.nowMs - prev.masteredAt >= RETENTION_DELAY_MS
    ) {
      nextState = 'retained';
      becameRetained = true;
    } else if (prev.state === 'retained') {
      nextState = 'retained';
    } else {
      nextState = 'mastered';
      masteredAt = prev.masteredAt ?? ev.nowMs;
    }
  } else if (nextMastery < 0.35 && prev.state === 'new') {
    nextState = 'introduced';
  }

  const xpAwarded = Math.max(0, Math.round(masteryGain * 120));

  return {
    next: {
      skillId: prev.skillId,
      state: nextState,
      mastery: nextMastery,
      leitnerBox: upBox,
      completedKinds,
      consecutiveMisses: 0,
      masteredAt,
      lastReviewedAt: ev.nowMs,
      nextReviewAt,
    },
    masteryGain,
    xpAwarded,
    transferredToNewKind,
    becameRetained,
  };
}

/**
 * Softly decays skills overdue beyond 2x their scheduled Leitner interval,
 * preparing them for Taʼmirlash kuni without punitive XP subtraction.
 */
export function applyMasteryDecay(
  skill: SkillProgress,
  nowMs: number
): SkillProgress {
  if (skill.nextReviewAt === null) return skill;
  const interval = Math.max(DAY_MS, LEITNER_INTERVALS_MS[skill.leitnerBox]);
  if (nowMs <= skill.nextReviewAt + interval) return skill;

  const decayedState: SkillState =
    skill.state === 'retained'
      ? 'mastered'
      : skill.state === 'mastered'
        ? 'practicing'
        : skill.state;

  const nextMastery = clamp01(Math.max(0.4, skill.mastery - 0.12));

  return {
    ...skill,
    state: decayedState,
    mastery: nextMastery,
    leitnerBox: nextBoxDown(skill.leitnerBox),
  };
}
