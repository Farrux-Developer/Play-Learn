import { describe, expect, it } from 'vitest';
import varAddLevel from '@/content/levels/algoritm/w5-var-add.json';
import { MIRZO_ISA_VERSION, type RunnableLevelSpec } from '@/lib/game/core';
import {
  runLevelTestsInWorker,
  runNetworkInWorker,
  runVmInWorker,
} from './client';

describe('Web Worker Simulation Client', () => {
  it('executes a 10,000-tick VM run via Worker/fallback cleanly', async () => {
    const res = await runVmInWorker(
      {
        isaVersion: MIRZO_ISA_VERSION,
        mode: 'board',
        instructions: [
          { op: 'SET', target: 'k', value: { kind: 'lit', value: 0 } },
          { op: 'LABEL', label: 'loop' },
          {
            op: 'JUMP_IF',
            left: { kind: 'var', name: 'k' },
            cmp: '>=',
            right: { kind: 'lit', value: 2500 },
            targetLabel: 'done',
          },
          {
            op: 'ADD',
            target: 'k',
            left: { kind: 'var', name: 'k' },
            right: { kind: 'lit', value: 1 },
          },
          { op: 'JUMP', targetLabel: 'loop' },
          { op: 'LABEL', label: 'done' },
          { op: 'OUT', value: { kind: 'var', name: 'k' } },
          { op: 'HLT' },
        ],
      },
      [],
      { maxTicks: 10_500 }
    );

    expect(res.result.snapshot.status).toBe('halted');
    expect(res.result.snapshot.outputs).toEqual([2500]);
    expect(res.result.durationTicks).toBeGreaterThanOrEqual(10_000);
    expect(res.elapsedMs).toBeLessThan(200);
  });

  it('evaluates full level tests and packet networks asynchronously', async () => {
    const lvl = varAddLevel as unknown as RunnableLevelSpec;
    const evalRes = await runLevelTestsInWorker(lvl, lvl.referenceSolution, 0);
    expect(evalRes.result.passed).toBe(true);
    expect(evalRes.result.stars).toBe(3);

    const netRes = await runNetworkInWorker(
      [
        {
          id: 'pkt-1',
          seq: 1,
          kind: 'DATA',
          srcIp: '10.0.0.1',
          dstIp: '10.0.0.2',
          payload: 'salom',
          ttl: 4,
          currentNodeId: 'c1',
          nextHopNodeId: null,
          remainingLinkTicks: 0,
          status: 'in_transit',
          hops: ['c1'],
        },
      ],
      {
        nodes: [
          { id: 'c1', kind: 'client', ip: '10.0.0.1', routes: { '*': 's1' } },
          { id: 's1', kind: 'server', ip: '10.0.0.2', routes: {} },
        ],
        links: [{ a: 'c1', b: 's1', latencyTicks: 1, up: true }],
      }
    );
    expect(netRes.result.snapshot.deliveredCount).toBe(1);
  });
});
