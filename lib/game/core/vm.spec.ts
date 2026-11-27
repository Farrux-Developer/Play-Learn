import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  createInitialSnapshot,
  createVmHistory,
  MIRZO_ISA_VERSION,
  rewindVmHistory,
  runVm,
  stepVm,
  stepVmHistory,
  type BoardInstruction,
  type VmProgram,
} from './vm';

describe('Mirzo Mashinasi VM (mirzo-v1)', () => {
  it('executes variables, arithmetic, lists, CALL/RET, and outputs deterministically', () => {
    const program: VmProgram = {
      isaVersion: MIRZO_ISA_VERSION,
      mode: 'board',
      instructions: [
        { op: 'SET', target: 'ball', value: { kind: 'lit', value: 5 } },
        { op: 'CALL', targetLabel: 'bonus' },
        { op: 'LIST_SET', list: 'arr', items: [10, 20] },
        { op: 'LIST_PUSH', list: 'arr', value: { kind: 'var', name: 'ball' } },
        { op: 'LIST_GET', target: 'last', list: 'arr', index: { kind: 'lit', value: 2 } },
        { op: 'OUT', value: { kind: 'var', name: 'last' } },
        { op: 'HLT' },
        { op: 'LABEL', label: 'bonus' },
        {
          op: 'ADD',
          target: 'ball',
          left: { kind: 'var', name: 'ball' },
          right: { kind: 'lit', value: 3 },
        },
        { op: 'RET' },
      ],
    };

    const res = runVm(program, [], { trace: true });
    expect(res.snapshot.status).toBe('halted');
    expect(res.snapshot.vars['ball']).toBe(8);
    expect(res.snapshot.outputs).toEqual([8]);
    expect(res.snapshot.lists['arr']).toEqual([10, 20, 8]);
  });

  it('executes RegisterISA stored-program CPU instructions (W6)', () => {
    // Adds two inputs: INP -> STA 10 -> INP -> ADD 10 -> OUT -> HLT
    const program: VmProgram = {
      isaVersion: MIRZO_ISA_VERSION,
      mode: 'register',
      instructions: [
        { op: 'INP' },
        { op: 'STA', operand: 10 },
        { op: 'INP' },
        { op: 'ADD', operand: 10 },
        { op: 'OUT' },
        { op: 'HLT' },
      ],
    };

    const res = runVm(program, [19, 23]);
    expect(res.snapshot.status).toBe('halted');
    expect(res.snapshot.outputs).toEqual([42]);
    expect(res.snapshot.memory[10]).toBe(19);
  });

  it('halts infinite-loop programs gracefully at maxTicks with teaching errorCode', () => {
    const infiniteBoard: VmProgram = {
      isaVersion: MIRZO_ISA_VERSION,
      mode: 'board',
      instructions: [
        { op: 'SET', target: 'c', value: { kind: 'lit', value: 0 } },
        { op: 'LABEL', label: 'again' },
        {
          op: 'ADD',
          target: 'c',
          left: { kind: 'var', name: 'c' },
          right: { kind: 'lit', value: 1 },
        },
        { op: 'JUMP', targetLabel: 'again' },
      ],
    };

    const res = runVm(infiniteBoard, [], { maxTicks: 250 });
    expect(res.snapshot.status).toBe('tick_limit');
    expect(res.snapshot.errorCode).toBe('tick_limit_exceeded');
    expect(res.snapshot.tick).toBe(251);

    const infiniteCpu: VmProgram = {
      isaVersion: MIRZO_ISA_VERSION,
      mode: 'register',
      instructions: [{ op: 'BRA', operand: 0 }],
    };
    const cpuRes = runVm(infiniteCpu, [], { maxTicks: 100 });
    expect(cpuRes.snapshot.status).toBe('tick_limit');
    expect(cpuRes.snapshot.errorCode).toBe('tick_limit_exceeded');
  });

  it('handles division by zero and out-of-bounds cleanly without throwing', () => {
    const divZero: VmProgram = {
      isaVersion: MIRZO_ISA_VERSION,
      mode: 'board',
      instructions: [
        {
          op: 'DIV',
          target: 'r',
          left: { kind: 'lit', value: 10 },
          right: { kind: 'lit', value: 0 },
        },
      ],
    };
    const r1 = runVm(divZero);
    expect(r1.snapshot.status).toBe('error');
    expect(r1.snapshot.errorCode).toBe('division_by_zero');

    const oob: VmProgram = {
      isaVersion: MIRZO_ISA_VERSION,
      mode: 'board',
      instructions: [
        { op: 'LIST_SET', list: 'xs', items: [1, 2] },
        { op: 'LIST_GET', target: 'v', list: 'xs', index: { kind: 'lit', value: 9 } },
      ],
    };
    const r2 = runVm(oob);
    expect(r2.snapshot.status).toBe('error');
    expect(r2.snapshot.errorCode).toBe('index_out_of_bounds');
  });

  it('runs a 10,000-tick loop quickly without blocking (< 150 ms)', () => {
    // Loop increments counter `i` until 3,333 (~10,000 ticks across LABEL + JUMP_IF + ADD + JUMP)
    const loopProgram: VmProgram = {
      isaVersion: MIRZO_ISA_VERSION,
      mode: 'board',
      instructions: [
        { op: 'SET', target: 'i', value: { kind: 'lit', value: 0 } },
        { op: 'LABEL', label: 'start' },
        {
          op: 'JUMP_IF',
          left: { kind: 'var', name: 'i' },
          cmp: '>=',
          right: { kind: 'lit', value: 2500 },
          targetLabel: 'end',
        },
        {
          op: 'ADD',
          target: 'i',
          left: { kind: 'var', name: 'i' },
          right: { kind: 'lit', value: 1 },
        },
        { op: 'JUMP', targetLabel: 'start' },
        { op: 'LABEL', label: 'end' },
        { op: 'OUT', value: { kind: 'var', name: 'i' } },
        { op: 'HLT' },
      ],
    };

    const t0 = performance.now();
    const res = runVm(loopProgram, [], { maxTicks: 10_500, keepHistory: false });
    const elapsedMs = performance.now() - t0;

    expect(res.snapshot.status).toBe('halted');
    expect(res.snapshot.outputs).toEqual([2500]);
    expect(res.durationTicks).toBeGreaterThanOrEqual(10_000);
    expect(elapsedMs).toBeLessThan(150);
  });

  it('property: rewind(step(s)) == s, determinism, and JSON serialization round-trip', () => {
    const arbInstr = fc.array(
      fc.oneof(
        fc.integer({ min: -50, max: 50 }).map(
          (n): BoardInstruction => ({
            op: 'SET',
            target: 'x',
            value: { kind: 'lit', value: n },
          })
        ),
        fc.integer({ min: -10, max: 10 }).map(
          (n): BoardInstruction => ({
            op: 'ADD',
            target: 'x',
            left: { kind: 'var', name: 'x' },
            right: { kind: 'lit', value: n },
          })
        ),
        fc.constant<BoardInstruction>({
          op: 'OUT',
          value: { kind: 'var', name: 'x' },
        })
      ),
      { minLength: 1, maxLength: 12 }
    );

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        arbInstr,
        (initVal, instrs) => {
          const program: VmProgram = {
            isaVersion: MIRZO_ISA_VERSION,
            mode: 'board',
            initialVars: { x: initVal },
            instructions: [...instrs, { op: 'HLT' }],
          };

          // 1. Determinism across independent runs
          const runA = runVm(program, [], { maxTicks: 100 });
          const runB = runVm(program, [], { maxTicks: 100 });
          expect(runA.snapshot).toEqual(runB.snapshot);

          // 2. Exact rewind invariant: rewind(step(h)).current == h.current
          let hist = createVmHistory(program, []);
          const steps = Math.min(8, program.instructions.length);
          for (let i = 0; i < steps; i += 1) {
            const before = JSON.parse(JSON.stringify(hist.current));
            const stepped = stepVmHistory(hist, program, 100);
            const rewound = rewindVmHistory(stepped);
            expect(rewound.current).toEqual(before);
            hist = stepped;
          }

          // 3. Snapshot JSON round-trip preserves exact step progression
          const s0 = createInitialSnapshot(program, []);
          const s0RoundTrip = JSON.parse(JSON.stringify(s0));
          expect(stepVm(s0, program, 100)).toEqual(stepVm(s0RoundTrip, program, 100));
        }
      ),
      { numRuns: 40 }
    );
  });
});
