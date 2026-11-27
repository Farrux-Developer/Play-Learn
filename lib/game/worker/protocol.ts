/**
 * Typed Web Worker protocol for Mirzo simulation runs (lib/game/worker/protocol.ts).
 */

import type {
  LevelEvaluationResult,
  LevelSolutionCandidate,
  NetworkRunResult,
  NetworkTopology,
  Packet,
  RunnableLevelSpec,
  VmProgram,
  VmRunOptions,
  VmRunResult,
} from '@/lib/game/core';

export type WorkerRequest =
  | {
      id: string;
      kind: 'RUN_VM';
      program: VmProgram;
      inputs: number[];
      options?: VmRunOptions;
    }
  | {
      id: string;
      kind: 'RUN_LEVEL_TESTS';
      level: RunnableLevelSpec;
      candidate: LevelSolutionCandidate;
      hintsUsed?: number;
    }
  | {
      id: string;
      kind: 'RUN_NETWORK';
      packets: Packet[];
      topology: NetworkTopology;
      maxTicks?: number;
    };

export type WorkerResponse =
  | {
      id: string;
      kind: 'RUN_VM';
      ok: true;
      elapsedMs: number;
      result: VmRunResult;
    }
  | {
      id: string;
      kind: 'RUN_LEVEL_TESTS';
      ok: true;
      elapsedMs: number;
      result: LevelEvaluationResult;
    }
  | {
      id: string;
      kind: 'RUN_NETWORK';
      ok: true;
      elapsedMs: number;
      result: NetworkRunResult;
    }
  | {
      id: string;
      kind: WorkerRequest['kind'];
      ok: false;
      elapsedMs: number;
      error: string;
    };
