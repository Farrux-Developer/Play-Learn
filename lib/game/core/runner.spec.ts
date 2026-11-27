import { describe, expect, it } from 'vitest';
import varAddLevel from '@/content/levels/algoritm/w5-var-add.json';
import loopGuardLevel from '@/content/levels/algoritm/w5-loop-guard.json';
import halfAdderLevel from '@/content/levels/mantiq/w4-half-adder.json';
import {
  generateSeededTestCases,
  runLevelTests,
  verifyReferenceSolution,
  type RunnableLevelSpec,
} from './runner';
import { computeStars } from './scoring';
import * as core from './index';

describe('Seeded Test Runner, Scoring & Reference Harness', () => {
  it('generates identical deterministic test cases for the same seed', () => {
    const a = generateSeededTestCases(501, { kind: 'vm-add', count: 5, min: 1, max: 30 });
    const b = generateSeededTestCases(501, { kind: 'vm-add', count: 5, min: 1, max: 30 });
    expect(a).toEqual(b);
    expect(a).toHaveLength(5);
  });

  it('computes 0/1/2/3 stars accurately from pass, hints, and par', () => {
    expect(
      computeStars({ passed: false, hintsUsed: 0, instructionsCount: 2, ticksCount: 2, par: { instructions: 3, ticks: 5 } })
    ).toBe(0);
    expect(
      computeStars({ passed: true, hintsUsed: 1, instructionsCount: 2, ticksCount: 2, par: { instructions: 3, ticks: 5 } })
    ).toBe(1);
    expect(
      computeStars({ passed: true, hintsUsed: 0, instructionsCount: 5, ticksCount: 2, par: { instructions: 3, ticks: 5 } })
    ).toBe(2);
    expect(
      computeStars({ passed: true, hintsUsed: 0, instructionsCount: 3, ticksCount: 5, par: { instructions: 3, ticks: 5 } })
    ).toBe(3);
  });

  it('verifies all reference solutions pass visible + hidden + seeded cases at 3 stars', () => {
    const levels = [varAddLevel, loopGuardLevel, halfAdderLevel] as unknown as RunnableLevelSpec[];
    for (const lvl of levels) {
      const check = verifyReferenceSolution(lvl);
      expect(check.ok, check.reason).toBe(true);
      expect(check.evaluation.stars).toBe(3);
    }
  });

  it('returns misconception feedback when a learner omits OUT or creates infinite loop', () => {
    const lvl = varAddLevel as unknown as RunnableLevelSpec;
    const missingOut = runLevelTests(lvl, {
      engine: 'vm',
      program: {
        isaVersion: core.MIRZO_ISA_VERSION,
        mode: 'board',
        instructions: [
          { op: 'SET', target: 'a', value: { kind: 'input' } },
          { op: 'SET', target: 'b', value: { kind: 'input' } },
          { op: 'ADD', target: 'yigindi', left: { kind: 'var', name: 'a' }, right: { kind: 'var', name: 'b' } },
          { op: 'HLT' },
        ],
      },
    });
    expect(missingOut.passed).toBe(false);
    expect(missingOut.matchedMisconception?.id).toBe('missing-out');

    const loopLvl = loopGuardLevel as unknown as RunnableLevelSpec;
    const runaway = runLevelTests(
      { ...loopLvl, maxTicks: 100 },
      {
        engine: 'vm',
        program: {
          isaVersion: core.MIRZO_ISA_VERSION,
          mode: 'board',
          instructions: [
            { op: 'LABEL', label: 'loop' },
            { op: 'JUMP', targetLabel: 'loop' },
          ],
        },
      }
    );
    expect(runaway.passed).toBe(false);
    expect(runaway.failingCase?.errorCode).toBe('tick_limit_exceeded');
    expect(runaway.matchedMisconception?.id).toBe('infinite-loop');
  });
});
