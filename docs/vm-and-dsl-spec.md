# Notional Machine, DSL & Sandbox Specification

This document defines the three executable runtimes powering **«Oʻyna va oʻrgan»**, keeping all execution 100% deterministic, client-side, offline-safe, and free of network calls.

---

## 1. `Mirzo mashinasi` (LMC-style Notional Machine)

Replaces the legacy 3-step `MACHINE_TICKS` demo with a real stored-program computer simulator while preserving the HUD mini-stepper preview.

### 1.1 Hardware Architecture
- **Memory (`mem`)**: `number[]` configurable `32` (beginner/HUD) or `100` (full `00..99`) decimal cells (`-999..999` or unsigned `0..999` encoding `op * 100 + addr`). Default in U2: `100` cells (`00..99`), compact 32-cell view available in HUD/small screens.
- **Registers**:
  - `PC` (Program Counter, `0..99`)
  - `IR` (Instruction Register — current decoded opcode & operand)
  - `MAR` / `MDR` (highlighted visibly during Fetch/Execute phases)
  - `ACC` (Accumulator, integer `-999..999`, overflow/clamp rules explicit)
- **I/O Trays**:
  - `inQueue: number[]` (pre-loaded input tape for deterministic tests & interactive prompts)
  - `outTray: number[]` (output log)
- **Execution Phase & Limits**:
  - Phases exposed to UI: `FETCH` (`PC -> MAR -> mem[PC] -> IR, PC+1`), `DECODE`, `EXECUTE`, `HALTED`, `ERROR`.
  - Default max cycle guard: `500` instructions (`STEP_LIMIT_EXCEEDED`) so infinite loops never freeze the browser.

### 1.2 Assembly Instruction Set
| Mnemonic | Opcode | Semantics | Notes |
|---|---|---|---|
| `INP` | `901` | Read next value from `inQueue` into `ACC` | Error if `inQueue` exhausted |
| `OUT` | `902` | Push `ACC` to `outTray` | — |
| `LDA x` | `5xx` | `ACC = mem[x]` | `x` may be numeric address or label |
| `STA x` | `3xx` | `mem[x] = ACC` | — |
| `ADD x` | `1xx` | `ACC = ACC + mem[x]` | Checks `-999..999` range |
| `SUB x` | `2xx` | `ACC = ACC - mem[x]` | Sets negative flag if `< 0` |
| `BRA x` | `6xx` | `PC = x` | Unconditional branch |
| `BRZ x` | `7xx` | `if (ACC === 0) PC = x` | Branch if zero |
| `BRP x` | `8xx` | `if (ACC >= 0) PC = x` | Branch if zero or positive |
| `HLT` | `000` | Stop machine cleanly (`HALTED`) | Required at program end |
| `DAT [n]` | `—` | Reserve data cell initialized to `n` (default `0`) | Supports symbolic labels (`SUM DAT 0`) |

### 1.3 Stepper & Debugging Controls
- **Immutable History Snapshots (`history: MachineSnapshot[]`)**: Every forward step pushes a snapshot (`pc, acc, ir, mar, mdr, mem, inIdx, outTray, activeSourceLine, phase, logUz`).
- **Controls**:
  - `Oldinga` (Step Forward 1 phase or 1 full instruction)
  - `Orqaga` (Step Back — pops snapshot in `O(1)` time!)
  - `Ishga tushir` / `Toʻxtat` with speed `0.5x`, `1x`, `2x`, `4x`
  - `Qayta oʻrnatish` (Reset to initial memory + input tape)
  - **Breakpoints**: Click line gutter to toggle breakpoint set; continuous run pauses right before executing breakpointed `PC`.
- **Legacy HUD Bridge**: The HUD widget runs a pre-loaded 3-line program or lets the user jump directly into the full `Mirzo mashinasi` workbench (`/mashina` or expandable workshop view).

### 1.4 Uzbek Error Messages (`Mirzo mashinasi`)
- Unknown mnemonic: `"Nomaʼlum buyruq: '{op}' ({line}-qator). Ruxsat etilganlar: INP, OUT, LDA, STA, ADD, SUB, BRA, BRZ, BRP, HLT, DAT."`
- Undefined label: `"'{label}' yorligʻi topilmadi ({line}-qator). Uni DAT yoki buyruq oldidan eʼlon qil."`
- Empty input queue: `"Kirish lentasi boʻsh: {line}-qatordagi INP uchun son qolmadi."`
- Step limit: `"Cheksiz sikl shubhasi: {limit} ta qadamdan oshib ketdi. HLT yoki sakrash shartini tekshir."`
- Memory out of bounds: `"Xotira manzili {addr} chegaradan tashqarida (0..{max})."`

---

## 2. `Mirzo-kod` (Uzbek Python-like Pseudocode DSL & Step Interpreter)

Pure TypeScript Lexer → Recursive-Descent Parser → AST Stepper/Evaluator (`no eval`, `no Function()`, 100% safe and deterministic).

### 2.1 Syntax & Grammar (Core Constructs)
- **Variables & Assignment**: `x = 5`, `ism = "Aziza"`, `faol = rost` (`rost` / `yolgʻon`, also accepts `true` / `false`)
- **I/O**: `chopEt(ifoda, ...)`, `kirit(sorov?)` (pulls from deterministic `inputQueue`)
- **Operators**:
  - Arithmetic: `+`, `-`, `*`, `/`, `//` (integer floor div), `%`, `**`
  - Comparison: `==`, `!=`, `<`, `<=`, `>`, `>=`
  - Boolean: `va` (`&&`), `yoki` (`||`), `emas` (`!`)
- **Conditionals**:
  ```
  agar (ball >= 80) {
    chopEt("Aʼlo")
  } aks holda agar (ball >= 60) {
    chopEt("Yaxshi")
  } aks holda {
    chopEt("Qayta urinib koʻr")
  }
  ```
- **Loops**:
  - `uchun i = 1 dan 5 gacha { ... }` (inclusive `1..5`, optional `qadam 2`)
  - `uchun el ichida royxat { ... }` (iterate list elements)
  - `toki (shart) { ... }` (`while`)
  - `toʻxta` (`break`), `keyingisi` (`continue`)
- **Functions & Return**:
  ```
  funksiya kvadrat(n) {
    qaytar n * n
  }
  ```
- **Data Structures**:
  - Lists: `sonlar = [3, 7, 2]`, `sonlar[0]`, `uzunlik(sonlar)`, `qosh(sonlar, 9)`
  - Dicts: `talaba = {"ism": "Dilnoza", "ball": 90}`, `talaba["ball"]`, `bormi(talaba, "ball")`

### 2.2 Step Execution Snapshots
Each executed AST statement emits a `TraceFrame`:
- `stepIndex`, `line`, `col`
- `callStack: { fnName: string; line: number; locals: Record<string, RuntimeValue> }[]`
- `globals: Record<string, RuntimeValue>`
- `changedVars: string[]` (so UI highlights updated memory boxes!)
- `output: string[]`
- `explanationUz: string` (one-line human explanation of what just happened on that line)
- Hard guards: `MAX_STEPS = 2000`, `MAX_CALL_DEPTH = 64`.

### 2.3 Uzbek Syntax & Runtime Errors
All parser and runtime errors return `{ line, col, code, messageUz, hintUz }`:
- Syntax: `"{line}-qator, {col}-ustunda kutilmagan belgi '{tok}'. Qavs yoki '{expected}' unutilmadimi?"`
- Undefined variable: `"{line}-qator: '{name}' oʻzgaruvchisi hali yaratilmagan. Avval unga qiymat ber."`
- Type mismatch: `"{line}-qator: Matn va sonni toʻgʻridan-toʻgʻri qoʻshib boʻlmaydi (son() yoki matn() dan foydalan)."`
- Index error: `"{line}-qator: Indeks {idx} roʻyxat chegarasidan tashqarida (ruxsat etilgan: 0..{len-1})."`
- Zero division: `"{line}-qator: Nolga boʻlish mumkin emas."`

---

## 3. Isolated Web Worker JS Sandbox (U4–U10 Real Code Mode)

Used when the learner switches from `Mirzo-kod` to real **JavaScript** (available from U4 onward) or solves coding challenges in U6–U10.

### 3.1 Security & Isolation
- Runs inside a dedicated module `Worker` (`Blob` or bundled static worker).
- Before user code executes inside the worker, the preamble shadows/disables dangerous globals (`fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `importScripts`, `navigator`, `indexedDB`, `localStorage`).
- **Timeout Guard**: Host starts a `2000 ms` watchdog timer; if not resolved in `<= 2s`, calls `worker.terminate()` immediately and reports Uzbek timeout error (`"Dastur 2 soniyadan koʻp ishladi (cheksiz sikl boʻlishi mumkin) va toʻxtatildi."`).
- **Test Runner Protocol**:
  - Host posts `{ id, code, tests: TestCase[] }`.
  - Worker executes user function against each test case inside `try/catch`, captures `console.log` lines (capped at `200` lines), and returns `{ ok, results: TestResult[], logs, durationMs, error? }`.

### 3.2 Optional Python Mode (P2 — Opt-in Pyodide)
- **Default**: Disabled, zero network traffic on boot or during normal use.
- **Opt-in UX**: Explicit toggle `"Python (Pyodide) yuklash (~12 MB)"` only for users who explicitly want native CPython execution offline/online; all lessons and games work 100% without it using `Mirzo-kod` + JS Worker.
