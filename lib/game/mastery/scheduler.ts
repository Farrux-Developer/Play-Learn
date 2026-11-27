/**
 * Deterministic daily spaced-review queue builder for "Taʼmirlash kuni".
 */

import type { SkillDef } from '@/lib/game/content/schemas';
import { applyMasteryDecay, DAY_MS } from './model';
import type { RepairItem, SkillProgress } from './types';

export function buildRepairQueue(
  skillsMap: Record<string, SkillProgress>,
  skillDefs: readonly SkillDef[],
  nowMs: number,
  limit = 8
): RepairItem[] {
  const candidates: RepairItem[] = [];

  for (const def of skillDefs) {
    const progress = skillsMap[def.id];
    if (!progress || progress.state === 'new') continue;

    const afterDecay = applyMasteryDecay(progress, nowMs);
    const decayed = afterDecay.state !== progress.state || afterDecay.mastery < progress.mastery;
    const due = progress.nextReviewAt !== null && nowMs >= progress.nextReviewAt;
    const weak = progress.consecutiveMisses > 0 || progress.mastery < 0.65;

    if (!decayed && !due && !weak) continue;

    const overdueDays =
      progress.nextReviewAt !== null && nowMs > progress.nextReviewAt
        ? Math.floor((nowMs - progress.nextReviewAt) / DAY_MS)
        : 0;

    const reason: RepairItem['reason'] = decayed
      ? 'decayed'
      : due
        ? 'due'
        : 'weak';

    const priority =
      (decayed ? 100 : due ? 60 : 30) +
      Math.min(40, overdueDays * 4) +
      progress.consecutiveMisses * 10;

    candidates.push({
      skillId: def.id,
      workshop: def.workshop,
      reason,
      priority,
      overdueDays,
    });
  }

  return candidates
    .sort((a, b) => b.priority - a.priority || a.skillId.localeCompare(b.skillId))
    .slice(0, Math.max(0, limit));
}
