/**
 * Mirzo Mashinasi Versioned Virtual Machine (`isaVersion: 'mirzo-v1'`, ADR-0002).
 * Pure, deterministic, serializable notional machine supporting:
 * - High-level Workshop Mode (`board`): variables, arithmetic, comparisons, loops,
 *   calls/returns, lists, inputs, outputs.
 * - Machine Architecture Mode (`register`): stored-program CPU with PC, IR, MAR, MDR, ACC
 *   and memory cells (`INP`, `OUT`, `LDA`, `STA`, `ADD`, `SUB`, `BRA`, `BRZ`, `BRP`, `HLT`, `DAT`).
 * - Exact snapshot serialization + O(1) rewind (`stepVm` / `rewindVm`) and runaway tick caps.
 */

export const MIRZO_ISA_VERSION = 'mirzo-v1' as const;
export const DEFAULT_MAX_TICKS = 10_000;
export const MAX_CALL_DEPTH = 32;
export const REGISTER_MEMORY_SIZE = 64;

export type VmMode = 'board' | 'register';

export type ValueOperand =
  | { kind: 'lit'; value: number }
  | { kind: 'var'; name: string }
  | { kind: 'input' };

export type CompareOp = '==' | '!=' | '<' | '<=' | '>' | '>=';

export type BoardInstruction =
  | { id?: string; op: 'LABEL'; label: string }
  | { id?: string; op: 'SET'; target: string; value: ValueOperand }
  | {
      id?: string;
      op: 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'MOD';
      target: string;
      left: ValueOperand;
      right: ValueOperand;
    }
  | { id?: string; op: 'LIST_SET'; list: string; items: number[] }
  | { id?: string; op: 'LIST_PUSH'; list: string; value: ValueOperand }
  | { id?: string; op: 'LIST_GET'; target: string; list: string; index: ValueOperand }
  | { id?: string; op: 'LIST_LEN'; target: string; list: string }
  | { id?: string; op: 'JUMP'; targetLabel: string }
  | {
      id?: string;
      op: 'JUMP_IF';
      left: ValueOperand;
      cmp: CompareOp;
      right: ValueOperand;
      targetLabel: string;
    }
  | { id?: string; op: 'CALL'; targetLabel: string }
  | { id?: string; op: 'RET' }
  | { id?: string; op: 'OUT'; value: ValueOperand }
  | { id?: string; op: 'HLT' };

export type RegisterOpcode =
  | 'INP'
  | 'OUT'
  | 'LDA'
  | 'STA'
  | 'ADD'
  | 'SUB'
  | 'BRA'
  | 'BRZ'
  | 'BRP'
  | 'HLT'
  | 'DAT';

export interface RegisterInstruction {
  id?: string;
  op: RegisterOpcode;
  operand?: number;
}

export type VmProgram =
  | {
      isaVersion: typeof MIRZO_ISA_VERSION;
      mode: 'board';
      instructions: readonly BoardInstruction[];
      initialVars?: Record<string, number>;
      initialLists?: Record<string, readonly number[]>;
    }
  | {
      isaVersion: typeof MIRZO_ISA_VERSION;
      mode: 'register';
      instructions: readonly RegisterInstruction[];
      memory?: readonly number[];
    };

export type VmStatus = 'ready' | 'running' | 'halted' | 'tick_limit' | 'error';

export type VmErrorCode =
  | 'tick_limit_exceeded'
  | 'division_by_zero'
  | 'unknown_label'
  | 'undefined_variable'
  | 'index_out_of_bounds'
  | 'input_exhausted'
  | 'call_stack_overflow'
  | 'return_without_call'
  | 'invalid_address'
  | 'invalid_instruction';

export interface VmTraceEntry {
  tick: number;
  pc: number;
  op: string;
  summary: string;
}

export interface VmSnapshot {
  isaVersion: typeof MIRZO_ISA_VERSION;
  mode: VmMode;
  pc: number;
  tick: number;
  status: VmStatus;
  errorCode: VmErrorCode | null;
  errorMessageKey: string | null;
  errorLineIndex: number | null;
  vars: Record<string, number>;
  lists: Record<string, number[]>;
  outputs: number[];
  inputs: number[];
  inputCursor: number;
  callStack: number[];
  memory: number[];
  acc: number;
  ir: string;
  mar: number;
  mdr: number;
  lastTrace: VmTraceEntry | null;
}

export interface VmHistory {
  past: VmSnapshot[];
  current: VmSnapshot;
}

export interface VmRunOptions {
  maxTicks?: number;
  keepHistory?: boolean;
  maxHistory?: number;
  trace?: boolean;
}

export interface VmRunResult {
  snapshot: VmSnapshot;
  history: VmSnapshot[];
  trace: VmTraceEntry[];
  durationTicks: number;
}

function cloneSnapshot(snap: VmSnapshot): VmSnapshot {
  const listsCopy: Record<string, number[]> = {};
  for (const [k, v] of Object.entries(snap.lists)) {
    listsCopy[k] = [...v];
  }
  return {
    ...snap,
    vars: { ...snap.vars },
    lists: listsCopy,
    outputs: [...snap.outputs],
    inputs: [...snap.inputs],
    callStack: [...snap.callStack],
    memory: [...snap.memory],
    lastTrace: snap.lastTrace ? { ...snap.lastTrace } : null,
  };
}

function buildLabelIndex(instructions: readonly BoardInstruction[]): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < instructions.length; i += 1) {
    const instr = instructions[i];
    if (instr && instr.op === 'LABEL') {
      map.set(instr.label, i);
    }
  }
  return map;
}

function failSnapshot(
  snap: VmSnapshot,
  code: VmErrorCode,
  messageKey: string,
  lineIndex: number | null
): VmSnapshot {
  return {
    ...snap,
    status: code === 'tick_limit_exceeded' ? 'tick_limit' : 'error',
    errorCode: code,
    errorMessageKey: messageKey,
    errorLineIndex: lineIndex,
    lastTrace: {
      tick: snap.tick + 1,
      pc: snap.pc,
      op: code.toUpperCase(),
      summary: messageKey,
    },
    tick: snap.tick + 1,
  };
}

function resolveOperand(
  operand: ValueOperand,
  vars: Record<string, number>,
  inputs: readonly number[],
  inputCursor: number
): { ok: true; value: number; nextCursor: number } | { ok: false; code: VmErrorCode; key: string } {
  if (operand.kind === 'lit') {
    return { ok: true, value: operand.value, nextCursor: inputCursor };
  }
  if (operand.kind === 'input') {
    const val = inputs[inputCursor];
    if (val === undefined) {
      return { ok: false, code: 'input_exhausted', key: 'vm.error.inputExhausted' };
    }
    return { ok: true, value: val, nextCursor: inputCursor + 1 };
  }
  const v = vars[operand.name];
  if (v === undefined) {
    return { ok: false, code: 'undefined_variable', key: 'vm.error.undefinedVariable' };
  }
  return { ok: true, value: v, nextCursor: inputCursor };
}

function evalCompare(left: number, cmp: CompareOp, right: number): boolean {
  switch (cmp) {
    case '==':
      return left === right;
    case '!=':
      return left !== right;
    case '<':
      return left < right;
    case '<=':
      return left <= right;
    case '>':
      return left > right;
    case '>=':
      return left >= right;
  }
}

export function createInitialSnapshot(
  program: VmProgram,
  inputs: readonly number[] = []
): VmSnapshot {
  if (program.mode === 'board') {
    const lists: Record<string, number[]> = {};
    if (program.initialLists) {
      for (const [k, arr] of Object.entries(program.initialLists)) {
        lists[k] = [...arr];
      }
    }
    return {
      isaVersion: MIRZO_ISA_VERSION,
      mode: 'board',
      pc: 0,
      tick: 0,
      status: program.instructions.length === 0 ? 'halted' : 'ready',
      errorCode: null,
      errorMessageKey: null,
      errorLineIndex: null,
      vars: program.initialVars ? { ...program.initialVars } : {},
      lists,
      outputs: [],
      inputs: [...inputs],
      inputCursor: 0,
      callStack: [],
      memory: [],
      acc: 0,
      ir: '',
      mar: 0,
      mdr: 0,
      lastTrace: null,
    };
  }

  const mem = new Array<number>(REGISTER_MEMORY_SIZE).fill(0);
  if (program.memory) {
    for (let i = 0; i < Math.min(program.memory.length, REGISTER_MEMORY_SIZE); i += 1) {
      const cell = program.memory[i];
      if (cell !== undefined) mem[i] = cell;
    }
  }
  // Pre-seed DAT cells into RAM matching instruction slot when explicit DAT provided
  for (let i = 0; i < Math.min(program.instructions.length, REGISTER_MEMORY_SIZE); i += 1) {
    const instr = program.instructions[i];
    if (instr?.op === 'DAT' && instr.operand !== undefined) {
      mem[i] = instr.operand;
    }
  }

  return {
    isaVersion: MIRZO_ISA_VERSION,
    mode: 'register',
    pc: 0,
    tick: 0,
    status: program.instructions.length === 0 ? 'halted' : 'ready',
    errorCode: null,
    errorMessageKey: null,
    errorLineIndex: null,
    vars: {},
    lists: {},
    outputs: [],
    inputs: [...inputs],
    inputCursor: 0,
    callStack: [],
    memory: mem,
    acc: 0,
    ir: '',
    mar: 0,
    mdr: 0,
    lastTrace: null,
  };
}

function stepBoard(
  prev: VmSnapshot,
  instructions: readonly BoardInstruction[],
  labels: Map<string, number>,
  maxTicks: number
): VmSnapshot {
  if (prev.status === 'halted' || prev.status === 'tick_limit' || prev.status === 'error') {
    return prev;
  }
  if (prev.tick >= maxTicks) {
    return failSnapshot(prev, 'tick_limit_exceeded', 'vm.error.tickLimit', prev.pc);
  }
  const instr = instructions[prev.pc];
  if (!instr) {
    return {
      ...prev,
      status: 'halted',
      tick: prev.tick + 1,
      lastTrace: { tick: prev.tick + 1, pc: prev.pc, op: 'HLT', summary: 'end_of_program' },
    };
  }

  const next = cloneSnapshot(prev);
  next.status = 'running';
  next.tick = prev.tick + 1;
  const line = prev.pc;

  switch (instr.op) {
    case 'LABEL': {
      next.pc = line + 1;
      next.ir = `LABEL ${instr.label}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'LABEL', summary: instr.label };
      break;
    }
    case 'SET': {
      const res = resolveOperand(instr.value, next.vars, next.inputs, next.inputCursor);
      if (!res.ok) return failSnapshot(prev, res.code, res.key, line);
      next.inputCursor = res.nextCursor;
      next.vars[instr.target] = res.value;
      next.pc = line + 1;
      next.ir = `SET ${instr.target} = ${res.value}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'SET', summary: next.ir };
      break;
    }
    case 'ADD':
    case 'SUB':
    case 'MUL':
    case 'DIV':
    case 'MOD': {
      const l = resolveOperand(instr.left, next.vars, next.inputs, next.inputCursor);
      if (!l.ok) return failSnapshot(prev, l.code, l.key, line);
      const r = resolveOperand(instr.right, next.vars, next.inputs, l.nextCursor);
      if (!r.ok) return failSnapshot(prev, r.code, r.key, line);
      if ((instr.op === 'DIV' || instr.op === 'MOD') && r.value === 0) {
        return failSnapshot(prev, 'division_by_zero', 'vm.error.divisionByZero', line);
      }
      next.inputCursor = r.nextCursor;
      let val = 0;
      if (instr.op === 'ADD') val = l.value + r.value;
      else if (instr.op === 'SUB') val = l.value - r.value;
      else if (instr.op === 'MUL') val = l.value * r.value;
      else if (instr.op === 'DIV') val = Math.trunc(l.value / r.value);
      else val = l.value % r.value;
      next.vars[instr.target] = val;
      next.pc = line + 1;
      next.ir = `${instr.op} ${instr.target} = ${val}`;
      next.lastTrace = { tick: next.tick, pc: line, op: instr.op, summary: next.ir };
      break;
    }
    case 'LIST_SET': {
      next.lists[instr.list] = [...instr.items];
      next.pc = line + 1;
      next.ir = `LIST_SET ${instr.list}[${instr.items.length}]`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'LIST_SET', summary: next.ir };
      break;
    }
    case 'LIST_PUSH': {
      const v = resolveOperand(instr.value, next.vars, next.inputs, next.inputCursor);
      if (!v.ok) return failSnapshot(prev, v.code, v.key, line);
      next.inputCursor = v.nextCursor;
      const existing = next.lists[instr.list] ?? [];
      next.lists[instr.list] = [...existing, v.value];
      next.pc = line + 1;
      next.ir = `LIST_PUSH ${instr.list} <- ${v.value}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'LIST_PUSH', summary: next.ir };
      break;
    }
    case 'LIST_GET': {
      const idxRes = resolveOperand(instr.index, next.vars, next.inputs, next.inputCursor);
      if (!idxRes.ok) return failSnapshot(prev, idxRes.code, idxRes.key, line);
      next.inputCursor = idxRes.nextCursor;
      const arr = next.lists[instr.list];
      const item = arr ? arr[idxRes.value] : undefined;
      if (item === undefined) {
        return failSnapshot(prev, 'index_out_of_bounds', 'vm.error.indexOutOfBounds', line);
      }
      next.vars[instr.target] = item;
      next.pc = line + 1;
      next.ir = `LIST_GET ${instr.target} = ${instr.list}[${idxRes.value}] (${item})`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'LIST_GET', summary: next.ir };
      break;
    }
    case 'LIST_LEN': {
      const arr = next.lists[instr.list] ?? [];
      next.vars[instr.target] = arr.length;
      next.pc = line + 1;
      next.ir = `LIST_LEN ${instr.target} = ${arr.length}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'LIST_LEN', summary: next.ir };
      break;
    }
    case 'JUMP': {
      const targetPc = labels.get(instr.targetLabel);
      if (targetPc === undefined) {
        return failSnapshot(prev, 'unknown_label', 'vm.error.unknownLabel', line);
      }
      next.pc = targetPc;
      next.ir = `JUMP ${instr.targetLabel}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'JUMP', summary: next.ir };
      break;
    }
    case 'JUMP_IF': {
      const l = resolveOperand(instr.left, next.vars, next.inputs, next.inputCursor);
      if (!l.ok) return failSnapshot(prev, l.code, l.key, line);
      const r = resolveOperand(instr.right, next.vars, next.inputs, l.nextCursor);
      if (!r.ok) return failSnapshot(prev, r.code, r.key, line);
      next.inputCursor = r.nextCursor;
      const cond = evalCompare(l.value, instr.cmp, r.value);
      if (cond) {
        const targetPc = labels.get(instr.targetLabel);
        if (targetPc === undefined) {
          return failSnapshot(prev, 'unknown_label', 'vm.error.unknownLabel', line);
        }
        next.pc = targetPc;
      } else {
        next.pc = line + 1;
      }
      next.ir = `JUMP_IF (${l.value} ${instr.cmp} ${r.value}) -> ${cond ? instr.targetLabel : 'next'}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'JUMP_IF', summary: next.ir };
      break;
    }
    case 'CALL': {
      if (next.callStack.length >= MAX_CALL_DEPTH) {
        return failSnapshot(prev, 'call_stack_overflow', 'vm.error.callStackOverflow', line);
      }
      const targetPc = labels.get(instr.targetLabel);
      if (targetPc === undefined) {
        return failSnapshot(prev, 'unknown_label', 'vm.error.unknownLabel', line);
      }
      next.callStack.push(line + 1);
      next.pc = targetPc;
      next.ir = `CALL ${instr.targetLabel}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'CALL', summary: next.ir };
      break;
    }
    case 'RET': {
      const retPc = next.callStack.pop();
      if (retPc === undefined) {
        return failSnapshot(prev, 'return_without_call', 'vm.error.returnWithoutCall', line);
      }
      next.pc = retPc;
      next.ir = `RET -> ${retPc}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'RET', summary: next.ir };
      break;
    }
    case 'OUT': {
      const v = resolveOperand(instr.value, next.vars, next.inputs, next.inputCursor);
      if (!v.ok) return failSnapshot(prev, v.code, v.key, line);
      next.inputCursor = v.nextCursor;
      next.outputs.push(v.value);
      next.pc = line + 1;
      next.ir = `OUT ${v.value}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'OUT', summary: next.ir };
      break;
    }
    case 'HLT': {
      next.status = 'halted';
      next.ir = 'HLT';
      next.lastTrace = { tick: next.tick, pc: line, op: 'HLT', summary: 'HLT' };
      break;
    }
  }

  if (next.status === 'running' && next.pc >= instructions.length) {
    next.status = 'halted';
  }
  return next;
}

function stepRegister(
  prev: VmSnapshot,
  instructions: readonly RegisterInstruction[],
  maxTicks: number
): VmSnapshot {
  if (prev.status === 'halted' || prev.status === 'tick_limit' || prev.status === 'error') {
    return prev;
  }
  if (prev.tick >= maxTicks) {
    return failSnapshot(prev, 'tick_limit_exceeded', 'vm.error.tickLimit', prev.pc);
  }
  const instr = instructions[prev.pc];
  if (!instr) {
    return {
      ...prev,
      status: 'halted',
      tick: prev.tick + 1,
      lastTrace: { tick: prev.tick + 1, pc: prev.pc, op: 'HLT', summary: 'end_of_memory' },
    };
  }

  const next = cloneSnapshot(prev);
  next.status = 'running';
  next.tick = prev.tick + 1;
  const line = prev.pc;
  const operand = instr.operand ?? 0;

  const readMem = (addr: number): number | null => {
    if (addr < 0 || addr >= next.memory.length) return null;
    const val = next.memory[addr];
    return val ?? 0;
  };

  switch (instr.op) {
    case 'INP': {
      const v = next.inputs[next.inputCursor];
      if (v === undefined) {
        return failSnapshot(prev, 'input_exhausted', 'vm.error.inputExhausted', line);
      }
      next.inputCursor += 1;
      next.acc = v;
      next.pc = line + 1;
      next.ir = 'INP';
      next.lastTrace = { tick: next.tick, pc: line, op: 'INP', summary: `ACC <- ${v}` };
      break;
    }
    case 'OUT': {
      next.outputs.push(next.acc);
      next.pc = line + 1;
      next.ir = 'OUT';
      next.lastTrace = { tick: next.tick, pc: line, op: 'OUT', summary: `OUT <- ${next.acc}` };
      break;
    }
    case 'LDA': {
      const m = readMem(operand);
      if (m === null) return failSnapshot(prev, 'invalid_address', 'vm.error.invalidAddress', line);
      next.mar = operand;
      next.mdr = m;
      next.acc = m;
      next.pc = line + 1;
      next.ir = `LDA ${operand}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'LDA', summary: `ACC = RAM[${operand}] (${m})` };
      break;
    }
    case 'STA': {
      if (operand < 0 || operand >= next.memory.length) {
        return failSnapshot(prev, 'invalid_address', 'vm.error.invalidAddress', line);
      }
      next.mar = operand;
      next.mdr = next.acc;
      next.memory[operand] = next.acc;
      next.pc = line + 1;
      next.ir = `STA ${operand}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'STA', summary: `RAM[${operand}] = ${next.acc}` };
      break;
    }
    case 'ADD': {
      const m = readMem(operand);
      if (m === null) return failSnapshot(prev, 'invalid_address', 'vm.error.invalidAddress', line);
      next.mar = operand;
      next.mdr = m;
      next.acc += m;
      next.pc = line + 1;
      next.ir = `ADD ${operand}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'ADD', summary: `ACC = ${next.acc}` };
      break;
    }
    case 'SUB': {
      const m = readMem(operand);
      if (m === null) return failSnapshot(prev, 'invalid_address', 'vm.error.invalidAddress', line);
      next.mar = operand;
      next.mdr = m;
      next.acc -= m;
      next.pc = line + 1;
      next.ir = `SUB ${operand}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'SUB', summary: `ACC = ${next.acc}` };
      break;
    }
    case 'BRA': {
      if (operand < 0 || operand >= instructions.length) {
        return failSnapshot(prev, 'invalid_address', 'vm.error.invalidAddress', line);
      }
      next.pc = operand;
      next.ir = `BRA ${operand}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'BRA', summary: `PC <- ${operand}` };
      break;
    }
    case 'BRZ': {
      if (operand < 0 || operand >= instructions.length) {
        return failSnapshot(prev, 'invalid_address', 'vm.error.invalidAddress', line);
      }
      next.pc = next.acc === 0 ? operand : line + 1;
      next.ir = `BRZ ${operand}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'BRZ', summary: `ACC=${next.acc} -> PC=${next.pc}` };
      break;
    }
    case 'BRP': {
      if (operand < 0 || operand >= instructions.length) {
        return failSnapshot(prev, 'invalid_address', 'vm.error.invalidAddress', line);
      }
      next.pc = next.acc >= 0 ? operand : line + 1;
      next.ir = `BRP ${operand}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'BRP', summary: `ACC=${next.acc} -> PC=${next.pc}` };
      break;
    }
    case 'DAT': {
      next.pc = line + 1;
      next.ir = `DAT ${operand}`;
      next.lastTrace = { tick: next.tick, pc: line, op: 'DAT', summary: `DAT ${operand}` };
      break;
    }
    case 'HLT': {
      next.status = 'halted';
      next.ir = 'HLT';
      next.lastTrace = { tick: next.tick, pc: line, op: 'HLT', summary: 'HLT' };
      break;
    }
  }

  if (next.status === 'running' && next.pc >= instructions.length) {
    next.status = 'halted';
  }
  return next;
}

export function stepVm(
  prev: VmSnapshot,
  program: VmProgram,
  maxTicks = DEFAULT_MAX_TICKS
): VmSnapshot {
  if (program.mode === 'board') {
    const labels = buildLabelIndex(program.instructions);
    return stepBoard(prev, program.instructions, labels, maxTicks);
  }
  return stepRegister(prev, program.instructions, maxTicks);
}

export function createVmHistory(
  program: VmProgram,
  inputs: readonly number[] = []
): VmHistory {
  return {
    past: [],
    current: createInitialSnapshot(program, inputs),
  };
}

export function stepVmHistory(
  history: VmHistory,
  program: VmProgram,
  maxTicks = DEFAULT_MAX_TICKS
): VmHistory {
  const next = stepVm(history.current, program, maxTicks);
  if (next === history.current) return history;
  return {
    past: [...history.past, history.current],
    current: next,
  };
}

export function rewindVmHistory(history: VmHistory): VmHistory {
  if (history.past.length === 0) return history;
  const prev = history.past[history.past.length - 1];
  if (!prev) return history;
  return {
    past: history.past.slice(0, -1),
    current: prev,
  };
}

/**
 * High-speed deterministic batch execution without per-tick cloning when `keepHistory` is false.
 * Executes 10,000+ ticks in a few milliseconds for Web Worker simulations.
 */
export function runVm(
  program: VmProgram,
  inputs: readonly number[] = [],
  options: VmRunOptions = {}
): VmRunResult {
  const maxTicks = Math.max(1, options.maxTicks ?? DEFAULT_MAX_TICKS);
  const keepHistory = options.keepHistory ?? false;
  const maxHistory = options.maxHistory ?? 512;
  const recordTrace = options.trace ?? false;

  const initial = createInitialSnapshot(program, inputs);
  const history: VmSnapshot[] = keepHistory ? [initial] : [];
  const trace: VmTraceEntry[] = [];

  if (program.mode === 'register') {
    let cur = initial;
    while (cur.status === 'ready' || cur.status === 'running') {
      const next = stepRegister(cur, program.instructions, maxTicks);
      if (recordTrace && next.lastTrace) trace.push(next.lastTrace);
      if (keepHistory) {
        if (history.length >= maxHistory) history.shift();
        history.push(next);
      }
      cur = next;
      if (cur.status === 'halted' || cur.status === 'error' || cur.status === 'tick_limit') break;
    }
    return {
      snapshot: cur,
      history,
      trace,
      durationTicks: cur.tick,
    };
  }

  // Fast-path mutable interpreter inside local closure for 10,000-tick runs when keepHistory=false
  const labels = buildLabelIndex(program.instructions);
  if (keepHistory) {
    let cur = initial;
    while (cur.status === 'ready' || cur.status === 'running') {
      const next = stepBoard(cur, program.instructions, labels, maxTicks);
      if (recordTrace && next.lastTrace) trace.push(next.lastTrace);
      if (history.length >= maxHistory) history.shift();
      history.push(next);
      cur = next;
      if (cur.status === 'halted' || cur.status === 'error' || cur.status === 'tick_limit') break;
    }
    return {
      snapshot: cur,
      history,
      trace,
      durationTicks: cur.tick,
    };
  }

  // Mutate strictly internal scratch state and emit immutable VmSnapshot at termination
  const state = cloneSnapshot(initial);
  const instrs = program.instructions;
  while (state.status === 'ready' || state.status === 'running') {
    if (state.tick >= maxTicks) {
      const ended = failSnapshot(state, 'tick_limit_exceeded', 'vm.error.tickLimit', state.pc);
      if (recordTrace && ended.lastTrace) trace.push(ended.lastTrace);
      return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
    }
    const instr = instrs[state.pc];
    if (!instr) {
      state.status = 'halted';
      state.tick += 1;
      break;
    }
    state.status = 'running';
    state.tick += 1;
    const line = state.pc;

    if (instr.op === 'LABEL') {
      state.pc = line + 1;
      state.ir = `LABEL ${instr.label}`;
    } else if (instr.op === 'SET') {
      const res = resolveOperand(instr.value, state.vars, state.inputs, state.inputCursor);
      if (!res.ok) {
        state.tick -= 1;
        const ended = failSnapshot(state, res.code, res.key, line);
        return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
      }
      state.inputCursor = res.nextCursor;
      state.vars[instr.target] = res.value;
      state.pc = line + 1;
      state.ir = `SET ${instr.target} = ${res.value}`;
    } else if (
      instr.op === 'ADD' ||
      instr.op === 'SUB' ||
      instr.op === 'MUL' ||
      instr.op === 'DIV' ||
      instr.op === 'MOD'
    ) {
      const l = resolveOperand(instr.left, state.vars, state.inputs, state.inputCursor);
      if (!l.ok) {
        state.tick -= 1;
        const ended = failSnapshot(state, l.code, l.key, line);
        return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
      }
      const r = resolveOperand(instr.right, state.vars, state.inputs, l.nextCursor);
      if (!r.ok) {
        state.tick -= 1;
        const ended = failSnapshot(state, r.code, r.key, line);
        return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
      }
      if ((instr.op === 'DIV' || instr.op === 'MOD') && r.value === 0) {
        state.tick -= 1;
        const ended = failSnapshot(state, 'division_by_zero', 'vm.error.divisionByZero', line);
        return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
      }
      state.inputCursor = r.nextCursor;
      let val = 0;
      if (instr.op === 'ADD') val = l.value + r.value;
      else if (instr.op === 'SUB') val = l.value - r.value;
      else if (instr.op === 'MUL') val = l.value * r.value;
      else if (instr.op === 'DIV') val = Math.trunc(l.value / r.value);
      else val = l.value % r.value;
      state.vars[instr.target] = val;
      state.pc = line + 1;
      state.ir = `${instr.op} ${instr.target} = ${val}`;
    } else if (instr.op === 'LIST_SET') {
      state.lists[instr.list] = [...instr.items];
      state.pc = line + 1;
      state.ir = `LIST_SET ${instr.list}`;
    } else if (instr.op === 'LIST_PUSH') {
      const v = resolveOperand(instr.value, state.vars, state.inputs, state.inputCursor);
      if (!v.ok) {
        state.tick -= 1;
        const ended = failSnapshot(state, v.code, v.key, line);
        return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
      }
      state.inputCursor = v.nextCursor;
      const arr = state.lists[instr.list];
      if (arr) arr.push(v.value);
      else state.lists[instr.list] = [v.value];
      state.pc = line + 1;
      state.ir = `LIST_PUSH ${instr.list}`;
    } else if (instr.op === 'LIST_GET') {
      const idxRes = resolveOperand(instr.index, state.vars, state.inputs, state.inputCursor);
      if (!idxRes.ok) {
        state.tick -= 1;
        const ended = failSnapshot(state, idxRes.code, idxRes.key, line);
        return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
      }
      state.inputCursor = idxRes.nextCursor;
      const arr = state.lists[instr.list];
      const item = arr ? arr[idxRes.value] : undefined;
      if (item === undefined) {
        state.tick -= 1;
        const ended = failSnapshot(state, 'index_out_of_bounds', 'vm.error.indexOutOfBounds', line);
        return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
      }
      state.vars[instr.target] = item;
      state.pc = line + 1;
      state.ir = `LIST_GET ${instr.target}`;
    } else if (instr.op === 'LIST_LEN') {
      const arr = state.lists[instr.list] ?? [];
      state.vars[instr.target] = arr.length;
      state.pc = line + 1;
      state.ir = `LIST_LEN ${instr.target}`;
    } else if (instr.op === 'JUMP') {
      const targetPc = labels.get(instr.targetLabel);
      if (targetPc === undefined) {
        state.tick -= 1;
        const ended = failSnapshot(state, 'unknown_label', 'vm.error.unknownLabel', line);
        return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
      }
      state.pc = targetPc;
      state.ir = `JUMP ${instr.targetLabel}`;
    } else if (instr.op === 'JUMP_IF') {
      const l = resolveOperand(instr.left, state.vars, state.inputs, state.inputCursor);
      if (!l.ok) {
        state.tick -= 1;
        const ended = failSnapshot(state, l.code, l.key, line);
        return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
      }
      const r = resolveOperand(instr.right, state.vars, state.inputs, l.nextCursor);
      if (!r.ok) {
        state.tick -= 1;
        const ended = failSnapshot(state, r.code, r.key, line);
        return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
      }
      state.inputCursor = r.nextCursor;
      const cond = evalCompare(l.value, instr.cmp, r.value);
      if (cond) {
        const targetPc = labels.get(instr.targetLabel);
        if (targetPc === undefined) {
          state.tick -= 1;
          const ended = failSnapshot(state, 'unknown_label', 'vm.error.unknownLabel', line);
          return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
        }
        state.pc = targetPc;
      } else {
        state.pc = line + 1;
      }
      state.ir = `JUMP_IF ${instr.targetLabel}`;
    } else if (instr.op === 'CALL') {
      if (state.callStack.length >= MAX_CALL_DEPTH) {
        state.tick -= 1;
        const ended = failSnapshot(state, 'call_stack_overflow', 'vm.error.callStackOverflow', line);
        return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
      }
      const targetPc = labels.get(instr.targetLabel);
      if (targetPc === undefined) {
        state.tick -= 1;
        const ended = failSnapshot(state, 'unknown_label', 'vm.error.unknownLabel', line);
        return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
      }
      state.callStack.push(line + 1);
      state.pc = targetPc;
      state.ir = `CALL ${instr.targetLabel}`;
    } else if (instr.op === 'RET') {
      const retPc = state.callStack.pop();
      if (retPc === undefined) {
        state.tick -= 1;
        const ended = failSnapshot(state, 'return_without_call', 'vm.error.returnWithoutCall', line);
        return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
      }
      state.pc = retPc;
      state.ir = `RET -> ${retPc}`;
    } else if (instr.op === 'OUT') {
      const v = resolveOperand(instr.value, state.vars, state.inputs, state.inputCursor);
      if (!v.ok) {
        state.tick -= 1;
        const ended = failSnapshot(state, v.code, v.key, line);
        return { snapshot: ended, history: [], trace, durationTicks: ended.tick };
      }
      state.inputCursor = v.nextCursor;
      state.outputs.push(v.value);
      state.pc = line + 1;
      state.ir = `OUT ${v.value}`;
    } else if (instr.op === 'HLT') {
      state.status = 'halted';
      state.ir = 'HLT';
    }

    if (recordTrace) {
      trace.push({ tick: state.tick, pc: line, op: instr.op, summary: state.ir });
    }
    if (state.status === 'running' && state.pc >= instrs.length) {
      state.status = 'halted';
    }
  }

  state.lastTrace = trace[trace.length - 1] ?? {
    tick: state.tick,
    pc: state.pc,
    op: state.ir || 'HLT',
    summary: state.status,
  };

  return {
    snapshot: state,
    history: [],
    trace,
    durationTicks: state.tick,
  };
}
