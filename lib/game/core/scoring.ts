/**
 * Pure star scoring (1..3 stars) & misconception-specific feedback matcher.
 */

import type { StarCount } from './types';

export interface ParSpec {
  instructions?: number;
  ticks?: number;
}

export interface ScoreInput {
  passed: boolean;
  hintsUsed: number;
  instructionsCount: number;
  ticksCount: number;
  par: ParSpec;
}

export interface FeedbackRuleSpec {
  id: string;
  pattern: string;
  misconception: string;
  messageKey: string;
}

export interface FeedbackObservation {
  errorCode?: string | null;
  status?: string;
  actualOutputs?: readonly (number | boolean)[];
  expectedOutputs?: readonly (number | boolean)[];
  vars?: Record<string, number>;
  ticks?: number;
}

export function computeStars(input: ScoreInput): StarCount {
  if (!input.passed) return 0;
  if (input.hintsUsed > 0) return 1;
  const instrOk =
    input.par.instructions === undefined ||
    input.instructionsCount <= input.par.instructions;
  const ticksOk =
    input.par.ticks === undefined || input.ticksCount <= input.par.ticks;
  if (instrOk && ticksOk) return 3;
  return 2;
}

/**
 * Matches deterministic misconception pattern tags cleanly against observed failure state:
 * - `error:<code>` (e.g. `error:tick_limit_exceeded`, `error:division_by_zero`)
 * - `empty_output` (program halted without emitting expected output)
 * - `var:<name>==<num>` or `var_unread:<name>`
 * - `off_by_one` (single numeric output differs from expected by +-1)
 * - `status:<name>`
 * - `always` (fallback misconception hint for failing solution)
 */
export function matchFeedbackRules(
  rules: readonly FeedbackRuleSpec[],
  obs: FeedbackObservation
): FeedbackRuleSpec | null {
  for (const rule of rules) {
    const pat = rule.pattern.trim();
    if (pat.startsWith('error:')) {
      const code = pat.slice('error:'.length);
      if (obs.errorCode === code) return rule;
    } else if (pat.startsWith('status:')) {
      const st = pat.slice('status:'.length);
      if (obs.status === st) return rule;
    } else if (pat === 'empty_output') {
      if (
        (obs.actualOutputs?.length ?? 0) === 0 &&
        (obs.expectedOutputs?.length ?? 0) > 0
      ) {
        return rule;
      }
    } else if (pat === 'off_by_one') {
      const act = obs.actualOutputs?.[0];
      const exp = obs.expectedOutputs?.[0];
      if (
        typeof act === 'number' &&
        typeof exp === 'number' &&
        Math.abs(act - exp) === 1
      ) {
        return rule;
      }
    } else if (pat.startsWith('var:')) {
      const expr = pat.slice('var:'.length);
      const [varName, rawVal] = expr.split('==');
      if (varName && rawVal !== undefined && obs.vars) {
        const num = Number(rawVal);
        if (Number.isFinite(num) && obs.vars[varName] === num) {
          return rule;
        }
      }
    } else if (pat === 'always') {
      return rule;
    }
  }
  return null;
}
