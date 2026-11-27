import { describe, expect, it } from 'vitest';
import {
  evaluateCircuit,
  evaluateTruthTable,
  type LogicCircuit,
} from './gates';

describe('Logic Gate Circuit Evaluator (W4)', () => {
  const halfAdder: LogicCircuit = {
    nodes: [
      { id: 'A', kind: 'INPUT', name: 'A' },
      { id: 'B', kind: 'INPUT', name: 'B' },
      { id: 'xor1', kind: 'XOR' },
      { id: 'and1', kind: 'AND' },
      { id: 'S', kind: 'OUTPUT', name: 'S' },
      { id: 'C', kind: 'OUTPUT', name: 'C' },
    ],
    wires: [
      { from: 'A', to: 'xor1', toPin: 0 },
      { from: 'B', to: 'xor1', toPin: 1 },
      { from: 'A', to: 'and1', toPin: 0 },
      { from: 'B', to: 'and1', toPin: 1 },
      { from: 'xor1', to: 'S' },
      { from: 'and1', to: 'C' },
    ],
  };

  it('verifies full 4-row half-adder truth table cleanly', () => {
    const table = evaluateTruthTable(halfAdder, [
      { inputs: { A: false, B: false }, expected: { S: false, C: false } },
      { inputs: { A: false, B: true }, expected: { S: true, C: false } },
      { inputs: { A: true, B: false }, expected: { S: true, C: false } },
      { inputs: { A: true, B: true }, expected: { S: false, C: true } },
    ]);
    expect(table.passed).toBe(true);
    expect(table.passedRows).toBe(4);
    expect(table.failures).toHaveLength(0);
  });

  it('detects combinational cycles without infinite loops', () => {
    const cyclic: LogicCircuit = {
      nodes: [
        { id: 'a', kind: 'NOT' },
        { id: 'b', kind: 'NOT' },
        { id: 'out', kind: 'OUTPUT', name: 'Q' },
      ],
      wires: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'a' },
        { from: 'b', to: 'out' },
      ],
    };

    const res = evaluateCircuit(cyclic, {});
    expect(res.status).toBe('combinational_cycle');
  });

  it('reports missing_wire when gate inputs are unconnected', () => {
    const broken: LogicCircuit = {
      nodes: [
        { id: 'A', kind: 'INPUT', name: 'A' },
        { id: 'g', kind: 'AND' },
        { id: 'out', kind: 'OUTPUT', name: 'Q' },
      ],
      wires: [
        { from: 'A', to: 'g' },
        { from: 'g', to: 'out' },
      ],
    };
    const res = evaluateCircuit(broken, { A: true });
    expect(res.status).toBe('missing_wire');
  });
});
