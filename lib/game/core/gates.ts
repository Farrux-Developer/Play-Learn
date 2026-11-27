/**
 * Pure Logic Gate Circuit Evaluator (`W4 Mantiq` & Capstone `Kompyuter yasa`).
 * Evaluates DAG boolean circuits (`INPUT`, `CONST`, `NOT`, `AND`, `OR`, `XOR`, `NAND`, `OUTPUT`)
 * with cycle detection and full truth-table verification.
 */

export type GateKind = 'INPUT' | 'CONST' | 'NOT' | 'AND' | 'OR' | 'XOR' | 'NAND' | 'OUTPUT';

export interface GateNode {
  id: string;
  kind: GateKind;
  name?: string;
  constValue?: boolean;
}

export interface GateWire {
  from: string;
  to: string;
  toPin?: number;
}

export interface LogicCircuit {
  nodes: readonly GateNode[];
  wires: readonly GateWire[];
}

export type CircuitStatus = 'ok' | 'combinational_cycle' | 'missing_wire' | 'unknown_node';

export interface CircuitEvalResult {
  status: CircuitStatus;
  outputs: Record<string, boolean>;
  nodeValues: Record<string, boolean>;
  order: string[];
  errorMessageKey?: string;
}

export interface TruthTableRow {
  inputs: Record<string, boolean>;
  expected: Record<string, boolean>;
}

export interface TruthTableFailure {
  rowIndex: number;
  inputs: Record<string, boolean>;
  expected: Record<string, boolean>;
  actual: Record<string, boolean>;
}

export interface TruthTableResult {
  passed: boolean;
  totalRows: number;
  passedRows: number;
  failures: TruthTableFailure[];
  status: CircuitStatus;
}

function evalGate(kind: GateKind, ins: boolean[], constVal = false): boolean {
  switch (kind) {
    case 'INPUT':
      return Boolean(ins[0]);
    case 'CONST':
      return constVal;
    case 'NOT':
      return !(ins[0] ?? false);
    case 'AND':
      return ins.length >= 2 && ins.every(Boolean);
    case 'OR':
      return ins.some(Boolean);
    case 'XOR':
      return ins.reduce((acc, v) => acc !== v, false);
    case 'NAND':
      return !(ins.length >= 2 && ins.every(Boolean));
    case 'OUTPUT':
      return Boolean(ins[0]);
  }
}

export function evaluateCircuit(
  circuit: LogicCircuit,
  inputs: Record<string, boolean>
): CircuitEvalResult {
  const nodeMap = new Map<string, GateNode>();
  for (const node of circuit.nodes) {
    nodeMap.set(node.id, node);
  }

  const incoming = new Map<string, GateWire[]>();
  const outgoing = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of circuit.nodes) {
    incoming.set(node.id, []);
    outgoing.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const wire of circuit.wires) {
    if (!nodeMap.has(wire.from) || !nodeMap.has(wire.to)) {
      return {
        status: 'unknown_node',
        outputs: {},
        nodeValues: {},
        order: [],
        errorMessageKey: 'gates.error.unknownNode',
      };
    }
    incoming.get(wire.to)?.push(wire);
    outgoing.get(wire.from)?.push(wire.to);
    inDegree.set(wire.to, (inDegree.get(wire.to) ?? 0) + 1);
  }

  // Kahn's topological sort for DAG verification
  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift();
    if (id === undefined) break;
    order.push(id);
    for (const target of outgoing.get(id) ?? []) {
      const nextDeg = (inDegree.get(target) ?? 0) - 1;
      inDegree.set(target, nextDeg);
      if (nextDeg === 0) queue.push(target);
    }
  }

  if (order.length !== circuit.nodes.length) {
    return {
      status: 'combinational_cycle',
      outputs: {},
      nodeValues: {},
      order,
      errorMessageKey: 'gates.error.combinationalCycle',
    };
  }

  const nodeValues: Record<string, boolean> = {};
  const outputs: Record<string, boolean> = {};

  for (const id of order) {
    const node = nodeMap.get(id);
    if (!node) continue;

    if (node.kind === 'INPUT') {
      const key = node.name ?? node.id;
      nodeValues[id] = Boolean(inputs[key]);
      continue;
    }

    if (node.kind === 'CONST') {
      nodeValues[id] = Boolean(node.constValue);
      continue;
    }

    const wiresIn = [...(incoming.get(id) ?? [])].sort(
      (a, b) => (a.toPin ?? 0) - (b.toPin ?? 0)
    );
    const minExpected =
      node.kind === 'NOT' || node.kind === 'OUTPUT' ? 1 : 2;
    if (wiresIn.length < minExpected) {
      return {
        status: 'missing_wire',
        outputs: {},
        nodeValues,
        order,
        errorMessageKey: 'gates.error.missingWire',
      };
    }

    const pinValues = wiresIn.map((w) => Boolean(nodeValues[w.from]));
    const val = evalGate(node.kind, pinValues, node.constValue);
    nodeValues[id] = val;

    if (node.kind === 'OUTPUT') {
      const outName = node.name ?? node.id;
      outputs[outName] = val;
    }
  }

  return {
    status: 'ok',
    outputs,
    nodeValues,
    order,
  };
}

export function evaluateTruthTable(
  circuit: LogicCircuit,
  rows: readonly TruthTableRow[]
): TruthTableResult {
  const failures: TruthTableFailure[] = [];
  let lastStatus: CircuitStatus = 'ok';

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row) continue;
    const res = evaluateCircuit(circuit, row.inputs);
    if (res.status !== 'ok') {
      lastStatus = res.status;
      failures.push({
        rowIndex: i,
        inputs: row.inputs,
        expected: row.expected,
        actual: res.outputs,
      });
      continue;
    }

    let mismatch = false;
    for (const [k, exp] of Object.entries(row.expected)) {
      if (res.outputs[k] !== exp) {
        mismatch = true;
        break;
      }
    }
    if (mismatch) {
      failures.push({
        rowIndex: i,
        inputs: row.inputs,
        expected: row.expected,
        actual: res.outputs,
      });
    }
  }

  return {
    passed: lastStatus === 'ok' && failures.length === 0,
    totalRows: rows.length,
    passedRows: rows.length - failures.length,
    failures,
    status: lastStatus,
  };
}
