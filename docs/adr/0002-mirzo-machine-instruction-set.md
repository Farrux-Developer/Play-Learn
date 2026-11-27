# ADR 0002 — Mirzo Mashinasi Versioned Instruction Set (`mirzo-v1`)

- **Status:** Proposed (Phase 0)
- **Context:** Currently `Mirzo mashinasi` is a 3-element static array (`MACHINE_TICKS` showing `ball = 5`, `ball = ball + 3`, `chopEt(ball)`). Master Brief §3, §5, §6 require a deterministic notional machine supporting variables, conditions, loops, functions, lists (`W5`), fetch–decode–execute (`W6`), and rewind (time travel).
- **Options:**
  1. Pure assembly LMC-only VM (`INP/OUT/LDA/STA/ADD/SUB/BRA/BRZ/BRP/HLT`) — great for `W6`, awkward for lists/functions/strings in `W5`.
  2. High-level AST-only interpreter — great for `W5`, hides `PC`, registers, and fetch–decode–execute in `W6`.
  3. **Dual-layer `mirzo-v1` VM (`BoardISA` + `RegisterISA`)** sharing one pure immutable snapshot & rewind core (`step`, `rewind`, `run`, `tickCap = 10_000`).
- **Decision:** Implement a versioned, pure TypeScript core (`isaVersion: 'mirzo-v1'`):
  - **High-level Workshop Mode (`W5`)**: Typed structured instructions (`SET`, `COPY`, `ADD`, `SUB`, `MUL`, `MOD`, `CMP`, `IF_JUMP`, `CALL`, `RET`, `LIST_PUSH`, `LIST_GET`, `OUT`, `HLT`) shown with Uzbek labels (`Qiymat ber`, `Qoʻsh`, `Shart tekshir`, `Takrorla`, `Chop et`) alongside canonical short codes so kids see live variable boxes (`ball`), call stack, and list slots.
  - **Machine Architecture Mode (`W6`)**: Classic 32–100 cell stored-program CPU (`PC`, `IR`, `MAR`, `MDR`, `ACC`, `IN`, `OUT`) with English mnemonics (`INP`, `OUT`, `LDA`, `STA`, `ADD`, `SUB`, `BRA`, `BRZ`, `BRP`, `HLT`, `DAT`) and Uzbek hover/chip descriptions (`Xotiradan yukla`, `Xotiraga saqla`, `Nol boʻlsa sakra`).
  - **Snapshots & Rewind**: Every tick returns a serializable `MachineSnapshot`; rewind pops `O(1)` from snapshot history (capped or delta-encoded for 10,000-tick runs).
- **Consequences:** Single pure test suite (`Vitest` + `fast-check`) validates determinism, tick caps, and exact rewind invariants across both `W5` and `W6`.
