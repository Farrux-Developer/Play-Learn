import { describe, expect, it } from 'vitest';
import {
  bitsToDecimal,
  decimalToBits,
  decodeCodepoints,
  encodeCodepoints,
  evaluateWorkshopPuzzle,
  expandRle,
  shiftCaesar,
} from './workshops';

describe('Phase 4 Pure Workshop Evaluators (W1, W2, W3, W8)', () => {
  it('evaluates W1 IPO & volatility checks deterministically', () => {
    const res = evaluateWorkshopPuzzle(
      {
        engine: 'workshop',
        mode: 'ipo',
        slots: { input: 'klaviatura', process: 'cpu', storage: 'ssd' },
        powerOff: true,
      },
      {},
      { slots: { input: 'klaviatura', process: 'cpu', storage: 'ssd' }, powerOff: true }
    );
    expect(res.passed).toBe(true);
  });

  it('converts binary bits <-> decimal accurately (W2)', () => {
    expect(bitsToDecimal([0, 0, 1, 0, 1, 0, 1, 0])).toBe(42);
    expect(decimalToBits(42, 8)).toEqual([0, 0, 1, 0, 1, 0, 1, 0]);
  });

  it('encodes Uzbek Unicode oʻ/ʼ and expands RLE pixels (W3)', () => {
    const codes = encodeCodepoints('oʻ');
    expect(codes).toEqual([111, 699]);
    expect(decodeCodepoints(codes)).toBe('oʻ');
    expect(expandRle('3W2B')).toBe('WWWBB');
  });

  it('evaluates Caesar cipher shift and AI dataset balance (W8)', () => {
    expect(shiftCaesar('SALOM', 3)).toBe('VDORP');
    expect(shiftCaesar('VDORP', -3)).toBe('SALOM');

    const biased = evaluateWorkshopPuzzle(
      {
        engine: 'workshop',
        mode: 'cyber-ai',
        submode: 'ai-bias',
        selectedSamples: { mushuk: 9, kuchuk: 1 },
      },
      {},
      { minTotal: 8, minRatio: 0.7 }
    );
    expect(biased.passed).toBe(false);

    const balanced = evaluateWorkshopPuzzle(
      {
        engine: 'workshop',
        mode: 'cyber-ai',
        submode: 'ai-bias',
        selectedSamples: { mushuk: 5, kuchuk: 5 },
      },
      {},
      { minTotal: 8, minRatio: 0.7 }
    );
    expect(balanced.passed).toBe(true);
  });
});
