# Technical, Pedagogical & UX Audit (`docs/AUDIT.md`)

**Date:** 2026-11-27  
**Scope:** Phase 0 preflight verification of every assumption in `docs/PROJECT_BRIEF.md` Section 2 against actual source code, build output, and headless Chromium checks.

---

## 1. Build Fix & Preflight Check (Section 14.0.1)
- **Status of `simplex-noise`**: Already installed in `package.json` (`"simplex-noise": "^4.0.3"`).
- **Noise instantiation fix applied**: In `components/NetworkBackdrop.tsx`, `createNoise2D()` was previously invoked inside `useEffect` on `surfaceMode`/`tier`/`motionPaused` changes. Moved to module scope (`const sharedNoise2D = createNoise2D()`) so the noise table is constructed **once** per module load (never per frame or effect re-run).
- **Build & Checks**: `npx tsc --noEmit` (pass), `npm run lint` (pass, 0 errors), `npx tsx --test` (8/8 pass), `npm run build` (`compile_applet` pass).

---

## 2. Verification of Section 2 Snapshot Hypotheses

| Brief Hypothesis | Actual Codebase Fact | Status |
|---|---|---|
| Audience: 5th–6th graders (10–12 y.o.) | Confirmed across `metadata.json`, `app/layout.tsx`, `HeroSection`, `TamoyillarSection` footer, `TEACHER_REVIEW.md` | **Verified** |
| Stack: Next.js App Router, React, TS, `@/` alias | Next.js `15.4.9` (`output: 'standalone'`), React `19.2.1`, TypeScript `5.9.3` (`strict: true`, **note:** `noUncheckedIndexedAccess` not yet enabled) | **Verified (gap noted)** |
| `lib/engine/store` exports `SurfaceMode` | Exports `SurfaceMode = 'paper' \| 'blueprint'`, `WorkshopId`, `WorkshopState`, `localStorage` key `'oyna_organ_workshop_v1'` | **Verified** |
| `lib/motion/core` exports `QualityTier` | Exports `motionCore`, `QualityTier = 'high' \| 'mid' \| 'lite'`, 11-event bus, p75 governor, single GSAP/rAF ticker | **Verified** |
| Nav: Darslar / Xarita / Oʻyinlar / Tamoyillar / Boshlash | Currently anchor scroll on single `'use client'` `app/page.tsx` (`#darslar`, `#xarita`, `#oyinlar`, `#tamoyillar`); **no** SSG `/learn`, `/glossary`, `/play`, `/map`, `/principles` routes exist yet | **Partial (single SPA page)** |
| Dual surface (`Paper` vs `Blueprint`) | Fully modeled in `app/tokens.css`, `app/globals.css`, and View Transitions (`switchSurface`), generated via `scripts/generate-tokens.mjs` (Culori OKLCH + WCAG AA check) | **Verified** |
| Uzbek apostrophe defect (`O'yna` vs `o‘zing`) | Grep audit found `0` straight `'`, `0` `‘`, `0` `’` in UI/data strings: repo already uses `ʻ` (`U+02BB`) and `ʼ` (`U+02BC`). However, `PROJECT_BRIEF.md` text & `normalizeUzbekInput()` exist, and no CI lint enforces apostrophes yet | **Already clean; needs CI lint** |

---

## 3. Framework, Dependencies & Font Coverage

### 3.1 Installed Packages (`package.json`)
- **Runtime**: `next@15.4.9`, `react@19.2.1`, `react-dom@19.2.1`, `@base-ui/react@1.9.0`, `motion@14.14.0`, `gsap@3.15.1`, `three@0.187.0`, `canvas-confetti@1.9.4`, `roughjs@4.6.6` (used in build script), `culori@4.0.2` (used in build script), `simplex-noise@4.0.3`, `@phosphor-icons/react@2.1.10`, `@fontsource-variable/onest`, `@fontsource-variable/lexend`, `@fontsource/jetbrains-mono`.
- **Missing test/validation packages for Master Brief**: `zod`, `vitest` (currently using `node:test` via `tsx`), `fast-check`, `@playwright/test` / `@axe-core/playwright`, `idb` (or Dexie), `next-intl` (if chosen in ADR-0004). No heavy UI kits or lodash/moment exist.
- **Dependencies review**:
  - `three` + `RoomEnvironment` (`~187 KB gz` across lazy chunks `bd904a5c` + `b536a0f1`) is only used for decorative background gears behind Mirzo on `tier === 'high'` (`GearTrain.tsx`). Under Master Brief §8 ("No WebGL or three.js unless an ADR proves it is needed"), evaluate removing or isolating in ADR-0006.
  - `gsap` (`88.6 KB gz` chunk `580` + plugins) is loaded dynamically for DrawSVG/MorphSVG/SplitText/MotionPath, though `motion` is also in initial bundle.

### 3.2 Fonts (`app/layout.tsx`, `app/globals.css`)
- Self-hosted via `@fontsource-variable/onest` (Display), `@fontsource-variable/lexend` (Body), `@fontsource/jetbrains-mono` (Code). Total raw font assets: `425.6 KB` (`0` runtime external font calls).
- Verified loaded in Chromium (`document.fonts`): `Onest Variable`, `Lexend Variable`, `JetBrains Mono`. Needs explicit character-glyph test for `U+02BB` (`ʻ`), `U+02BC` (`ʼ`), and Cyrillic `ў қ ғ ҳ` in Phase 1 before adding `ru`/`uz-Cyrl`.

---

## 4. What Exists Today: Engine, Workshops & Mirzo Mashinasi

### 4.1 `Mirzo mashinasi` (`WorkshopHud.tsx` + `lib/data/workshop.ts`)
- **Current implementation**: Static 3-element array `MACHINE_TICKS`:
  1. `line 1`: `ball = 5`, `boxX: '5'`, `output: '—'`
  2. `line 2`: `ball = ball + 3`, `boxX: '8'`, `output: '—'`
  3. `line 3`: `chopEt(ball)`, `boxX: '8'`, `output: '8'`
- **State shape**: `machineTick: number` (cycles `0 -> 1 -> 2 -> 0` on `"1 takt bos"` click).
- **Gap**: Zero instruction set, zero memory array, zero registers (`PC`/`ACC`), zero rewind, zero editable parts, zero Web Worker simulation.

### 4.2 Three Existing Workshops (`WORKSHOPS` in `lib/data/workshop.ts`, `GamesSection.tsx`)
1. `algoritmlar` (`0 XP`): 2 MCQs (`alg-1`, `alg-2`) — order of steps & finding broken recipe line.
2. `mantiq` (`60 XP`): 1 MCQ (`man-1`) — strict `>` vs `>=` condition (`yosh = 11`).
3. `sikllar` (`120 XP`): 1 MCQ (`sik-1`) — loop count `1 dan 4 gacha`.
- **Gap**: Every workshop renders identical 3-choice `ChoiceTile` MCQ UI. Not a real game (fails §4 Principle 1 "Intrinsic integration").

### 4.3 Lessons (`LESSONS`), Map (`MAP_NODES`), Diagnostic (`DiagnosticModal`)
- `LESSONS`: 4 static predict-MCQ cards (`L1`–`L4`: order, variable overwrite, `if/else`, `for` sum). `+20 XP` once.
- `MAP_NODES`: 3 static city cards (`Samarqand` `0 XP`, `Buxoro` `60 XP`, `Toshkent` `120 XP`) unlocked linearly by XP.
- `DiagnosticModal`: 3 fixed MCQs (`diag-1..3`). **Bug found**: Completing it awards `10 + correctCount * 5` XP without deduplication, allowing infinite XP farming.

---

## 5. Accessibility, Performance & Bundle Baseline

### 5.1 Bundle Analysis (`.next` production build, measured 2026-11-27)
- **Landing `/` First-Load JS**: **`260.4 KB gz`** (`chunks/580` `88.6 KB` + `4bd1b696` `53.1 KB` + `255` `45.6 KB` + `polyfills` `38.7 KB` + `app/page` `32.1 KB` + runtime `2.3 KB`). **Exceeds §9 budget (`<= 120 KB gz`) by `+140.4 KB gz`** because `app/page.tsx` is a monolithic `'use client'` tree importing `motion`, `@base-ui/react`, and `@phosphor-icons/react` eagerly on initial load.
- **First-Load CSS**: `12.3 KB gz`.
- **Total JS across all chunks (incl. lazy)**: `605.7 KB gz` (`lazyOnly`: `345.4 KB gz`).

### 5.2 Headless Chromium & Accessibility Scan (dev mode, `http://localhost:3000`)
- **Viewports checked**: `360×640` mobile & `1366×768` desktop → **`0 px` horizontal overflow** on both; `0` console errors; `0` external network requests; `0` images missing `alt`; `1` `h1`; proper semantic landmarks (`header`, `nav`, `main`, `footer`).
- **Tap target scan (`< 44 px` or `< 48 px` target)**: Found `DEV · mid · 60fps` at `40 px` (dev-only) and secondary buttons using `min-h-[44px]` (`44 px`), below §12's `>= 48 px` guideline for children.
- **Paint baseline (dev server)**: FCP `576 ms`, DOMContentLoaded `487 ms` (production Lighthouse mobile preset `Slow 4G / 4x CPU` not yet run — `lighthouse` CLI is not installed in container).
- **Offline / PWA**: `manifestLink: false`, `swCount: 0` — zero offline caching after reload.

---

## 6. Tech Debt & Prioritized Risks
1. **[P0 — Landing JS Budget]**: `260.4 KB gz` first-load JS violates `<= 120 KB gz`. Fix via Server-Component-first routing (`app/[locale]/...`) + dynamic islands behind static posters (`Phase 1` & `Phase 3`).
2. **[P0 — Not a Real Game Yet]**: All 3 workshops are MCQs; no deterministic core VM, no Web Worker, no intrinsic mechanics (`Phase 2` & `Phase 3`).
3. **[P0 — Zero SEO Architecture]**: Single client page with no indexable HTML `/learn` or `/glossary` routes, no sitemap/robots/hreflang/JSON-LD (`Phase 3–4`).
4. **[P1 — Durable Storage & Migration]**: `localStorage` only, no IndexedDB, no export/import, and repeatable XP exploit in `DiagnosticModal` (`Phase 1`).
5. **[P1 — Missing PWA & Update Safety]**: No Service Worker or manifest (`Phase 1`/`Phase 3`).
6. **[P2 — Tooling Gaps]**: `lighthouse` CLI absent in container; `noUncheckedIndexedAccess` not enabled in `tsconfig.json`; `.git` not initialized yet.
