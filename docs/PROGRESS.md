# Progress Log (`docs/PROGRESS.md`)

**Active Plan:** `docs/PROJECT_BRIEF.md` (Master Brief v1)  
**Current Status:** **Phase 2 Complete — Awaiting user `"go"` for Phase 3**

---

## Phase Log

### Phase 0 — Preflight and Audit (`2026-11-27`) — DONE
- **Build & Code Fix**: Confirmed `simplex-noise@^4.0.3` installed; moved `createNoise2D()` in `components/NetworkBackdrop.tsx` to module scope (`sharedNoise2D`) so noise setup runs once rather than per effect/frame. Verified green `tsc --noEmit`, `eslint .`, `8/8` unit tests, and `next build`.
- **Audit (`docs/AUDIT.md`)**: Verified all Section 2 snapshot assumptions. Discovered landing First-Load JS is **`260.4 KB gz`** (vs `<= 120 KB gz` budget) due to monolithic `'use client'` `app/page.tsx` + `motion`/`base-ui`/`phosphor`; noted `DiagnosticModal` repeatable XP exploit; confirmed Uzbek apostrophes are currently consistent (`ʻ` `U+02BB` / `ʼ` `U+02BC`) in UI code; confirmed `lighthouse` CLI absent in container.
- **Competitive Scan (`docs/COMPETITIVE.md`)**: Benchmarked 10 EdTech/programming games (explicitly marked unverified/from memory).
- **ADRs Proposed (`docs/adr/0001`–`0006`)**: Workshop order & legacy mapping, `Mirzo mashinasi` versioned ISA, `idb` + `Leitner-6` scheduler, custom lightweight ICU i18n + `[locale]` SSG, Workbox/custom SW offline strategy, SVG-first board rendering + trimming `three.js` for bundle budgets.
- **Baselines Recorded**: `docs/PERF.md`, `docs/SEO.md`, `docs/BACKLOG.md`, `docs/CREDITS.md`, `AGENTS.md`.

### Phase 1 — Foundations (`2026-11-27`) — DONE
- **Strict TypeScript & Architecture Boundaries**: Enabled `noUncheckedIndexedAccess` + `noImplicitAny`; guarded indexed lookups across UI and engine files (`0` `tsc --noEmit` errors). Configured `eslint-plugin-boundaries` v7 `boundaries/dependencies` rules (`0` ESLint errors/warnings).
- **Design Tokens, UI Primitives & Gallery**: Consolidated semantic AA ink tokens, accessibility contrast fix on `Button` `danger` (`#BA2F0C` / `#FFFFFF`), `design-gallery` `<main>` landmark, and `/design-gallery` showcase verified with `0` `axe-core` violations.
- **Landing First-Load JS Budget (`260.4 KB gz` → `119.5 KB gz`)**: Split `app/page.tsx` into Server Components + dynamic islands (`WorkshopClientShell`, `SectionIcons`, `HeroPaperHeader`, `heroMeta`, `heroStrings`, `lib/engine/xp.ts`, CSS-driven header/HUD switches, SSR-enabled dynamic `GearTrain`, lazy `three.js` / `gsap` / `confetti`), bringing `/` from `260.4 KB gz` to **`119.5 KB gz`** (`<= 120 KB gz` budget PASS) with zero visual regression.
- **i18n, Content Validation, Storage & Mastery**: Verified `uz`/`ru`/`en` i18n (`52` keys parity, `scripts/content-check.ts` Zod validator), `idb` storage + migrations + CRC32 backup, and `Leitner-5` mastery model (with repeat-kind diminishing returns) across Vitest (`16/16` incl. `fast-check` & `axe-core`) and `node:test` (`8/8`).
- **Live Browser & A11y Audit**: Verified `/` (`1440×900` & `360×640`) and `/design-gallery` in headless Chromium (`playwright-cli` + `axe-core`): `0` console errors, `0` hydration mismatches, `0 px` horizontal overflow, `0` `axe-core` violations, and `DiagnosticModal` repeatable XP guarded (`localStorage` `'oyna_diag_done_v1'`).

### Phase 2 — Game Core (`2026-11-27`) — DONE
- **Pure TypeScript Core (`lib/game/core/`)**: Implemented zero-DOM, zero-`Math.random()` engines behind `eslint-plugin-boundaries` + `no-restricted-globals`:
  - `rng.ts`: Deterministic `mulberry32` seeded PRNG (`createSeededRng`, `nextInt`, `nextBool`, `pick`, `shuffle`).
  - `vm.ts`: Versioned `mirzo-v1` VM (`BoardISA` for `W5` + `RegisterISA` for `W6`), `createInitialSnapshot`, `stepVm`, `createVmHistory` / `stepVmHistory` / `rewindVmHistory` (`O(1)` rewind), and `runVm` with `DEFAULT_MAX_TICKS = 10_000` (`status: 'tick_limit'`, `errorCode: 'tick_limit_exceeded'`).
  - `gates.ts`: Logic-gate DAG evaluator (`INPUT`, `CONST`, `NOT`, `AND`, `OR`, `XOR`, `NAND`, `OUTPUT`) with Kahn topological cycle detection (`combinational_cycle`), `missing_wire` checks, and `evaluateTruthTable`.
  - `packets.ts`: Discrete-tick packet-network simulator skeleton (`client`, `router`, `dns`, `server`), routing tables, link latency countdown, DNS lookup, and `TTL` drop (`dropped_ttl`).
  - `scoring.ts` & `runner.ts`: `0–3` star scorer, misconception `feedbackRules` matcher, deterministic seeded test generators (`vm-add`, `vm-max2`, `vm-sum-n`), and `verifyReferenceSolution` CI harness.
- **Web Worker Simulation Runner (`lib/game/worker/`)**: `protocol.ts`, `sim.worker.ts`, and Promise client (`client.ts`: `runVmInWorker`, `runLevelTestsInWorker`, `runNetworkInWorker`) with wall-clock timeout termination (`2000 ms`) and deterministic Node/SSR fallback.
- **Schema & Content Harness (`lib/game/content/schemas.ts`, `scripts/content-check.ts`, `scripts/content-new.ts`)**: Extended `LevelSchema` with `SeededGeneratorSchema` + `LevelSolutionCandidateSchema` and added 3 validated fixtures (`w5-var-add`, `w5-loop-guard`, `w4-half-adder`).
- **Verification & 10,000-tick Benchmark**: `tsc`, `eslint .`, `node:test` (`8/8`), `vitest` (`33/33` across `9` files including `fast-check` determinism/rewind/round-trip property tests), `content:check` (`3` verified levels), `next build`, and `budget:check` (`119.5 KB gz / 120 KB gz`) all PASS. `10,006`-tick `runVm` benchmark measured **`0.962 ms` min / `1.187 ms` median / `4.258 ms` p95** (`20` runs after warmup) on `linux x86_64` (`4` vCPUs, CPU model `unknown`, Node `v22.23.5`).

### Next Gate
- **Phase 3 — Vertical Slice (`W5 Algoritm`)**: Full `W5 Algoritm` workshop (`>= 8` levels across `build`, `predict`, `debug`, `modify` + boss + free workshop sandbox), Mirzo step/rewind visual board, hints, misconception feedback, server-rendered lesson + glossary pages, mastery-map integration, offline support, keyboard/touch/text modes, and playtest readiness.
- **STOP**: Wait for user `"go"`.
