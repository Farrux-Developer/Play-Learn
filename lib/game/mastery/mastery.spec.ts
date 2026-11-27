import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { getAllSkills } from '@/lib/game/content/loaders';
import { LEVEL_KINDS } from '@/lib/game/core/types';
import {
  applyMasteryDecay,
  applySkillEvidence,
  createInitialSkillProgress,
  DAY_MS,
  RETENTION_DELAY_MS,
} from './model';
import { buildRepairQueue } from './scheduler';

describe('Mastery model & Leitner-5 scheduler', () => {
  it('awards higher mastery for kind transfer than repeating the same level kind', () => {
    const s0 = createInitialSkillProgress('algo-sequence');
    const afterBuild = applySkillEvidence(s0, {
      skillId: 'algo-sequence',
      levelId: 'l1',
      kind: 'build',
      passed: true,
      firstTry: true,
      hintsUsed: 0,
      predictCorrect: true,
      nowMs: 1_000,
    });

    const repeatBuild = applySkillEvidence(afterBuild.next, {
      skillId: 'algo-sequence',
      levelId: 'l2',
      kind: 'build',
      passed: true,
      firstTry: true,
      hintsUsed: 0,
      predictCorrect: true,
      nowMs: 2_000,
    });

    const transferDebug = applySkillEvidence(afterBuild.next, {
      skillId: 'algo-sequence',
      levelId: 'l3',
      kind: 'debug',
      passed: true,
      firstTry: true,
      hintsUsed: 0,
      predictCorrect: true,
      nowMs: 2_000,
    });

    expect(transferDebug.transferredToNewKind).toBe(true);
    expect(transferDebug.masteryGain).toBeGreaterThan(repeatBuild.masteryGain);
    expect(transferDebug.next.state).toBe('mastered');
  });

  it('requires >= 7 days delayed review after mastery to become retained', () => {
    let s = createInitialSkillProgress('logic-gates');
    s = applySkillEvidence(s, {
      skillId: 'logic-gates',
      levelId: 'g1',
      kind: 'build',
      passed: true,
      firstTry: true,
      hintsUsed: 0,
      predictCorrect: true,
      nowMs: 1000,
    }).next;
    s = applySkillEvidence(s, {
      skillId: 'logic-gates',
      levelId: 'g2',
      kind: 'debug',
      passed: true,
      firstTry: true,
      hintsUsed: 0,
      predictCorrect: true,
      nowMs: 2000,
    }).next;
    expect(s.state).toBe('mastered');

    // Too early (2 days later): stays mastered
    const early = applySkillEvidence(s, {
      skillId: 'logic-gates',
      levelId: 'g3',
      kind: 'modify',
      passed: true,
      firstTry: true,
      hintsUsed: 0,
      predictCorrect: null,
      nowMs: 2000 + 2 * DAY_MS,
    });
    expect(early.becameRetained).toBe(false);
    expect(early.next.state).toBe('mastered');

    // Delayed >= 7 days: becomes retained
    const delayed = applySkillEvidence(s, {
      skillId: 'logic-gates',
      levelId: 'g4',
      kind: 'predict',
      passed: true,
      firstTry: true,
      hintsUsed: 0,
      predictCorrect: true,
      nowMs: 2000 + RETENTION_DELAY_MS,
    });
    expect(delayed.becameRetained).toBe(true);
    expect(delayed.next.state).toBe('retained');
  });

  it('softly decays overdue skills and prioritizes them in buildRepairQueue', () => {
    const defs = getAllSkills();
    const t0 = 1_000_000;
    const s1 = applySkillEvidence(createInitialSkillProgress('ipo-flow'), {
      skillId: 'ipo-flow',
      levelId: 'a1',
      kind: 'build',
      passed: true,
      firstTry: true,
      hintsUsed: 0,
      predictCorrect: true,
      nowMs: t0,
    }).next;
    const s2 = applySkillEvidence(s1, {
      skillId: 'ipo-flow',
      levelId: 'a2',
      kind: 'debug',
      passed: true,
      firstTry: true,
      hintsUsed: 0,
      predictCorrect: true,
      nowMs: t0 + 1000,
    }).next;

    const farFuture = t0 + 30 * DAY_MS;
    const decayed = applyMasteryDecay(s2, farFuture);
    expect(decayed.state).toBe('practicing');

    const queue = buildRepairQueue({ 'ipo-flow': s2 }, defs, farFuture, 8);
    expect(queue.length).toBe(1);
    expect(queue[0]?.skillId).toBe('ipo-flow');
    expect(queue[0]?.reason).toBe('decayed');
  });

  it('maintains fast-check bounds across arbitrary attempt sequences', () => {
    const kindArb = fc.constantFrom(...LEVEL_KINDS);
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            kind: kindArb,
            passed: fc.boolean(),
            firstTry: fc.boolean(),
            hintsUsed: fc.integer({ min: 0, max: 4 }),
            predictCorrect: fc.option(fc.boolean(), { nil: null }),
            dtDays: fc.integer({ min: 0, max: 12 }),
          }),
          { minLength: 1, maxLength: 12 }
        ),
        (attempts) => {
          let s = createInitialSkillProgress('algo-sequence');
          let now = 10_000;
          for (const a of attempts) {
            now += a.dtDays * DAY_MS;
            const res = applySkillEvidence(s, {
              skillId: 'algo-sequence',
              levelId: 'lvl',
              kind: a.kind,
              passed: a.passed,
              firstTry: a.firstTry,
              hintsUsed: a.hintsUsed,
              predictCorrect: a.predictCorrect,
              nowMs: now,
            });
            expect(res.next.mastery).toBeGreaterThanOrEqual(0);
            expect(res.next.mastery).toBeLessThanOrEqual(1);
            expect(res.xpAwarded).toBeGreaterThanOrEqual(0);
            if (!a.passed) {
              expect(res.xpAwarded).toBe(0);
              expect(res.masteryGain).toBe(0);
            }
            s = res.next;
          }
        }
      )
    );
  });
});
