/**
 * Pure Seeded Level Test Runner & Reference-Solution Harness (`lib/game/core/runner.ts`).
 * Evaluates visible + hidden + deterministic seeded test cases against VM programs
 * (`board` / `register`), Logic Gate circuits (`circuit`), or Packet Networks (`network`).
 */

import { evaluateCircuit, type LogicCircuit } from './gates';
import {
  runNetwork,
  type NetworkTopology,
  type Packet,
} from './packets';
import { createSeededRng } from './rng';
import {
  computeStars,
  matchFeedbackRules,
  type FeedbackRuleSpec,
  type ParSpec,
} from './scoring';
import type { StarCount } from './types';
import {
  DEFAULT_MAX_TICKS,
  runVm,
  type VmProgram,
  type VmSnapshot,
} from './vm';

export interface LevelTestCaseSpec {
  id: string;
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
}

export type LevelSolutionCandidate =
  | { engine: 'vm'; program: VmProgram }
  | { engine: 'circuit'; circuit: LogicCircuit }
  | { engine: 'network'; topology: NetworkTopology; packets?: readonly Packet[] };

export interface SeededGeneratorConfig {
  kind: 'vm-add' | 'vm-max2' | 'vm-sum-n';
  count: number;
  min?: number;
  max?: number;
}

export interface RunnableLevelSpec {
  id: string;
  tests: {
    visible: readonly LevelTestCaseSpec[];
    hidden: readonly LevelTestCaseSpec[];
    generatorSeed?: number;
    generator?: SeededGeneratorConfig;
  };
  par: ParSpec;
  feedbackRules: readonly FeedbackRuleSpec[];
  referenceSolution: LevelSolutionCandidate;
  maxTicks?: number;
}

export interface TestCaseOutcome {
  id: string;
  visibility: 'visible' | 'hidden' | 'seeded';
  passed: boolean;
  ticks: number;
  status: string;
  expected: Record<string, unknown>;
  actual: Record<string, unknown>;
  errorCode?: string | null;
  errorMessageKey?: string | null;
  lastSnapshot?: VmSnapshot;
}

export interface LevelEvaluationResult {
  levelId: string;
  passed: boolean;
  stars: StarCount;
  passedCount: number;
  totalCount: number;
  maxTicksUsed: number;
  instructionsCount: number;
  failingCase: TestCaseOutcome | null;
  matchedMisconception: FeedbackRuleSpec | null;
  outcomes: TestCaseOutcome[];
}

export function generateSeededTestCases(
  seed: number,
  config: SeededGeneratorConfig
): LevelTestCaseSpec[] {
  const rng = createSeededRng(seed);
  const lo = config.min ?? 1;
  const hi = config.max ?? 20;
  const out: LevelTestCaseSpec[] = [];

  for (let i = 0; i < config.count; i += 1) {
    if (config.kind === 'vm-add') {
      const a = rng.nextInt(lo, hi);
      const b = rng.nextInt(lo, hi);
      out.push({
        id: `seed-${seed}-${i + 1}`,
        input: { inputs: [a, b] },
        expected: { outputs: [a + b] },
      });
    } else if (config.kind === 'vm-max2') {
      const a = rng.nextInt(lo, hi);
      const b = rng.nextInt(lo, hi);
      out.push({
        id: `seed-${seed}-${i + 1}`,
        input: { inputs: [a, b] },
        expected: { outputs: [Math.max(a, b)] },
      });
    } else {
      const n = rng.nextInt(Math.max(1, lo), Math.min(25, hi));
      const sum = (n * (n + 1)) / 2;
      out.push({
        id: `seed-${seed}-${i + 1}`,
        input: { inputs: [n] },
        expected: { outputs: [sum] },
      });
    }
  }
  return out;
}

function arraysEqual(a: readonly unknown[], b: readonly unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function countInstructions(candidate: LevelSolutionCandidate): number {
  if (candidate.engine === 'vm') {
    return candidate.program.instructions.filter((i) => i.op !== 'LABEL').length;
  }
  if (candidate.engine === 'circuit') {
    return candidate.circuit.nodes.filter(
      (n) => n.kind !== 'INPUT' && n.kind !== 'OUTPUT'
    ).length;
  }
  return candidate.topology.links.length;
}

export function runLevelTests(
  level: RunnableLevelSpec,
  candidate: LevelSolutionCandidate,
  hintsUsed = 0
): LevelEvaluationResult {
  const maxTicks = level.maxTicks ?? DEFAULT_MAX_TICKS;
  const seeded =
    level.tests.generator && level.tests.generatorSeed !== undefined
      ? generateSeededTestCases(level.tests.generatorSeed, level.tests.generator)
      : [];

  const allCases: { spec: LevelTestCaseSpec; vis: 'visible' | 'hidden' | 'seeded' }[] = [
    ...level.tests.visible.map((spec) => ({ spec, vis: 'visible' as const })),
    ...level.tests.hidden.map((spec) => ({ spec, vis: 'hidden' as const })),
    ...seeded.map((spec) => ({ spec, vis: 'seeded' as const })),
  ];

  const outcomes: TestCaseOutcome[] = [];
  let maxTicksUsed = 0;
  let failingCase: TestCaseOutcome | null = null;
  let matchedMisconception: FeedbackRuleSpec | null = null;

  for (const { spec, vis } of allCases) {
    if (candidate.engine === 'vm') {
      const inputsRaw = spec.input['inputs'];
      const inputs = Array.isArray(inputsRaw)
        ? inputsRaw.filter((x): x is number => typeof x === 'number')
        : [];
      const varsOverride = spec.input['vars'];
      const programWithVars: VmProgram =
        candidate.program.mode === 'board' &&
        varsOverride &&
        typeof varsOverride === 'object' &&
        !Array.isArray(varsOverride)
          ? {
              ...candidate.program,
              initialVars: {
                ...candidate.program.initialVars,
                ...(varsOverride as Record<string, number>),
              },
            }
          : candidate.program;

      const res = runVm(programWithVars, inputs, { maxTicks, keepHistory: false });
      const snap = res.snapshot;
      maxTicksUsed = Math.max(maxTicksUsed, snap.tick);

      let passed = snap.status === 'halted';
      const expOutputs = spec.expected['outputs'];
      if (passed && Array.isArray(expOutputs)) {
        passed = arraysEqual(snap.outputs, expOutputs);
      }
      const expVars = spec.expected['vars'];
      if (passed && expVars && typeof expVars === 'object' && !Array.isArray(expVars)) {
        for (const [k, v] of Object.entries(expVars as Record<string, unknown>)) {
          if (snap.vars[k] !== v) {
            passed = false;
            break;
          }
        }
      }

      const outcome: TestCaseOutcome = {
        id: spec.id,
        visibility: vis,
        passed,
        ticks: snap.tick,
        status: snap.status,
        expected: spec.expected,
        actual: {
          outputs: snap.outputs,
          vars: snap.vars,
        },
        errorCode: snap.errorCode,
        errorMessageKey: snap.errorMessageKey,
        lastSnapshot: snap,
      };
      outcomes.push(outcome);

      if (!passed && !failingCase) {
        failingCase = outcome;
        matchedMisconception = matchFeedbackRules(level.feedbackRules, {
          errorCode: snap.errorCode,
          status: snap.status,
          actualOutputs: snap.outputs,
          expectedOutputs: Array.isArray(expOutputs)
            ? (expOutputs as number[])
            : undefined,
          vars: snap.vars,
          ticks: snap.tick,
        });
      }
    } else if (candidate.engine === 'circuit') {
      const boolInputs: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(spec.input)) {
        boolInputs[k] = Boolean(v);
      }
      const res = evaluateCircuit(candidate.circuit, boolInputs);
      maxTicksUsed = Math.max(maxTicksUsed, res.order.length || 1);

      let passed = res.status === 'ok';
      if (passed) {
        for (const [k, exp] of Object.entries(spec.expected)) {
          if (res.outputs[k] !== Boolean(exp)) {
            passed = false;
            break;
          }
        }
      }

      const outcome: TestCaseOutcome = {
        id: spec.id,
        visibility: vis,
        passed,
        ticks: 1,
        status: res.status,
        expected: spec.expected,
        actual: res.outputs,
        errorCode: res.status === 'ok' ? null : res.status,
        errorMessageKey: res.errorMessageKey ?? null,
      };
      outcomes.push(outcome);

      if (!passed && !failingCase) {
        failingCase = outcome;
        matchedMisconception = matchFeedbackRules(level.feedbackRules, {
          errorCode: res.status === 'ok' ? null : res.status,
          status: res.status,
          actualOutputs: Object.values(res.outputs),
          expectedOutputs: Object.values(spec.expected).map(Boolean),
        });
      }
    } else {
      const packetsRaw = spec.input['packets'];
      const packets = Array.isArray(packetsRaw)
        ? (packetsRaw as Packet[])
        : (candidate.packets ?? []);
      const res = runNetwork(packets, candidate.topology, maxTicks);
      maxTicksUsed = Math.max(maxTicksUsed, res.durationTicks);
      const expDelivered = spec.expected['deliveredCount'];
      const expDropped = spec.expected['droppedCount'];
      let passed = !res.timedOut;
      if (typeof expDelivered === 'number' && res.snapshot.deliveredCount !== expDelivered) {
        passed = false;
      }
      if (typeof expDropped === 'number' && res.snapshot.droppedCount !== expDropped) {
        passed = false;
      }

      const outcome: TestCaseOutcome = {
        id: spec.id,
        visibility: vis,
        passed,
        ticks: res.durationTicks,
        status: res.timedOut ? 'tick_limit' : 'completed',
        expected: spec.expected,
        actual: {
          deliveredCount: res.snapshot.deliveredCount,
          droppedCount: res.snapshot.droppedCount,
          resolvedIps: res.snapshot.resolvedIps,
        },
        errorCode: res.timedOut ? 'tick_limit_exceeded' : null,
      };
      outcomes.push(outcome);

      if (!passed && !failingCase) {
        failingCase = outcome;
        matchedMisconception = matchFeedbackRules(level.feedbackRules, {
          errorCode: res.timedOut ? 'tick_limit_exceeded' : null,
          status: outcome.status,
          ticks: res.durationTicks,
        });
      }
    }
  }

  const passedCount = outcomes.filter((o) => o.passed).length;
  const passed = passedCount === outcomes.length && outcomes.length > 0;
  const instructionsCount = countInstructions(candidate);
  const stars = computeStars({
    passed,
    hintsUsed,
    instructionsCount,
    ticksCount: maxTicksUsed,
    par: level.par,
  });

  return {
    levelId: level.id,
    passed,
    stars,
    passedCount,
    totalCount: outcomes.length,
    maxTicksUsed,
    instructionsCount,
    failingCase,
    matchedMisconception,
    outcomes,
  };
}

/**
 * Reference-solution CI harness: verifies a level's referenceSolution passes all tests
 * AND earns 3 stars (meets `par.instructions` and `par.ticks` with 0 hints).
 */
export function verifyReferenceSolution(level: RunnableLevelSpec): {
  ok: boolean;
  reason?: string;
  evaluation: LevelEvaluationResult;
} {
  const evaluation = runLevelTests(level, level.referenceSolution, 0);
  if (!evaluation.passed) {
    return {
      ok: false,
      reason: `Reference solution failed case "${evaluation.failingCase?.id ?? 'unknown'}" (${evaluation.passedCount}/${evaluation.totalCount})`,
      evaluation,
    };
  }
  if (evaluation.stars < 3) {
    return {
      ok: false,
      reason: `Reference solution passed (${evaluation.passedCount}/${evaluation.totalCount}) but missed par (instructions=${evaluation.instructionsCount}/${level.par.instructions ?? '∞'}, ticks=${evaluation.maxTicksUsed}/${level.par.ticks ?? '∞'})`,
      evaluation,
    };
  }
  return { ok: true, evaluation };
}
