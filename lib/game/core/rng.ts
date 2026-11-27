/**
 * Pure deterministic PRNG (Mulberry32) for seeded level tests and challenges.
 * Zero Math.random() or browser globals.
 */

export interface SeededRng {
  readonly seed: number;
  next(): number;
  nextInt(minInclusive: number, maxInclusive: number): number;
  nextBool(probabilityTrue?: number): boolean;
  pick<T>(items: readonly T[]): T | undefined;
  shuffle<T>(items: readonly T[]): T[];
}

export function createSeededRng(seed: number): SeededRng {
  let state = seed >>> 0;
  if (state === 0) {
    state = 0x9e3779b9;
  }

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const nextInt = (minInclusive: number, maxInclusive: number): number => {
    const lo = Math.ceil(Math.min(minInclusive, maxInclusive));
    const hi = Math.floor(Math.max(minInclusive, maxInclusive));
    const span = hi - lo + 1;
    return lo + Math.floor(next() * span);
  };

  const nextBool = (probabilityTrue = 0.5): boolean => next() < probabilityTrue;

  const pick = <T>(items: readonly T[]): T | undefined => {
    if (items.length === 0) return undefined;
    const idx = nextInt(0, items.length - 1);
    return items[idx];
  };

  const shuffle = <T>(items: readonly T[]): T[] => {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = nextInt(0, i);
      const a = out[i];
      const b = out[j];
      if (a !== undefined && b !== undefined) {
        out[i] = b;
        out[j] = a;
      }
    }
    return out;
  };

  return {
    seed: seed >>> 0,
    next,
    nextInt,
    nextBool,
    pick,
    shuffle,
  };
}
