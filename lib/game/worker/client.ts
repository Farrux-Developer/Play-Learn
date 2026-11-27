/**
 * Promise client for Web Worker simulations with wall-clock timeout termination
 * and deterministic SSR/Node fallback when Worker is unavailable.
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
import type { WorkerRequest, WorkerResponse } from './protocol';
import { executeWorkerTask } from './sim.worker';

export const DEFAULT_WORKER_TIMEOUT_MS = 2000;

let seqCounter = 0;
function nextRequestId(): string {
  seqCounter += 1;
  return `sim-${seqCounter}`;
}

export async function dispatchSimulation(
  req: WorkerRequest,
  timeoutMs = DEFAULT_WORKER_TIMEOUT_MS
): Promise<WorkerResponse> {
  if (typeof Worker === 'undefined') {
    return Promise.resolve(executeWorkerTask(req));
  }

  return new Promise<WorkerResponse>((resolve) => {
    let settled = false;
    let worker: Worker | null = null;
    try {
      worker = new Worker(new URL('./sim.worker.ts', import.meta.url), {
        type: 'module',
      });
    } catch {
      resolve(executeWorkerTask(req));
      return;
    }

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      worker?.terminate();
      resolve({
        id: req.id,
        kind: req.kind,
        ok: false,
        elapsedMs: timeoutMs,
        error: 'Simulation timed out in Web Worker.',
      });
    }, timeoutMs);

    worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
      if (settled || event.data.id !== req.id) return;
      settled = true;
      clearTimeout(timer);
      worker?.terminate();
      resolve(event.data);
    });

    worker.addEventListener('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker?.terminate();
      resolve({
        id: req.id,
        kind: req.kind,
        ok: false,
        elapsedMs: 0,
        error: err.message || 'Web Worker execution error.',
      });
    });

    worker.postMessage(req);
  });
}

export async function runVmInWorker(
  program: VmProgram,
  inputs: number[] = [],
  options?: VmRunOptions,
  timeoutMs = DEFAULT_WORKER_TIMEOUT_MS
): Promise<{ elapsedMs: number; result: VmRunResult }> {
  const res = await dispatchSimulation(
    { id: nextRequestId(), kind: 'RUN_VM', program, inputs, options },
    timeoutMs
  );
  if (!res.ok || res.kind !== 'RUN_VM') {
    throw new Error(res.ok ? 'Unexpected response kind' : res.error);
  }
  return { elapsedMs: res.elapsedMs, result: res.result };
}

export async function runLevelTestsInWorker(
  level: RunnableLevelSpec,
  candidate: LevelSolutionCandidate,
  hintsUsed = 0,
  timeoutMs = DEFAULT_WORKER_TIMEOUT_MS
): Promise<{ elapsedMs: number; result: LevelEvaluationResult }> {
  const res = await dispatchSimulation(
    {
      id: nextRequestId(),
      kind: 'RUN_LEVEL_TESTS',
      level,
      candidate,
      hintsUsed,
    },
    timeoutMs
  );
  if (!res.ok || res.kind !== 'RUN_LEVEL_TESTS') {
    throw new Error(res.ok ? 'Unexpected response kind' : res.error);
  }
  return { elapsedMs: res.elapsedMs, result: res.result };
}

export async function runNetworkInWorker(
  packets: Packet[],
  topology: NetworkTopology,
  maxTicks = 10_000,
  timeoutMs = DEFAULT_WORKER_TIMEOUT_MS
): Promise<{ elapsedMs: number; result: NetworkRunResult }> {
  const res = await dispatchSimulation(
    {
      id: nextRequestId(),
      kind: 'RUN_NETWORK',
      packets,
      topology,
      maxTicks,
    },
    timeoutMs
  );
  if (!res.ok || res.kind !== 'RUN_NETWORK') {
    throw new Error(res.ok ? 'Unexpected response kind' : res.error);
  }
  return { elapsedMs: res.elapsedMs, result: res.result };
}
