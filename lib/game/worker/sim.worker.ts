/**
 * Web Worker runner executing pure core simulations off the main UI thread.
 */

import { runLevelTests, runNetwork, runVm } from '@/lib/game/core';
import type { WorkerRequest, WorkerResponse } from './protocol';

export function executeWorkerTask(req: WorkerRequest): WorkerResponse {
  const started = performance.now();
  try {
    if (req.kind === 'RUN_VM') {
      const result = runVm(req.program, req.inputs, req.options);
      return {
        id: req.id,
        kind: 'RUN_VM',
        ok: true,
        elapsedMs: Number((performance.now() - started).toFixed(3)),
        result,
      };
    }
    if (req.kind === 'RUN_LEVEL_TESTS') {
      const result = runLevelTests(req.level, req.candidate, req.hintsUsed ?? 0);
      return {
        id: req.id,
        kind: 'RUN_LEVEL_TESTS',
        ok: true,
        elapsedMs: Number((performance.now() - started).toFixed(3)),
        result,
      };
    }
    const result = runNetwork(req.packets, req.topology, req.maxTicks);
    return {
      id: req.id,
      kind: 'RUN_NETWORK',
      ok: true,
      elapsedMs: Number((performance.now() - started).toFixed(3)),
      result,
    };
  } catch (err) {
    return {
      id: req.id,
      kind: req.kind,
      ok: false,
      elapsedMs: Number((performance.now() - started).toFixed(3)),
      error: err instanceof Error ? err.message : 'Unknown worker error',
    };
  }
}

if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
  self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
    const response = executeWorkerTask(event.data);
    self.postMessage(response);
  });
}
