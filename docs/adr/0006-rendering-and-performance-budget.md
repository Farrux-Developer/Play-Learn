# ADR 0006 — Board Rendering & Performance Budget Recovery (`<= 120 KB gz`)

- **Status:** Proposed (Phase 0)
- **Context:** Phase 0 measured Landing `/` First-Load JS at **`260.4 KB gz`** — more than double the **`<= 120 KB gz`** budget (§9). Major contributors on `/` are `app/page.tsx` being `'use client'` and eagerly importing `motion` (~50 KB gz), `@base-ui/react`, `@phosphor-icons/react`, and `NetworkBackdrop`. Additionally, `GearTrain.tsx` lazy-loads `three.js` (`~187 KB gz`) just for 3 spinning background gears, whereas §8 specifies *"SVG/DOM for boards ... No WebGL or three.js unless an ADR proves it is needed"*.
- **Options:**
  1. Keep monolithic `'use client'` landing + `three.js` + `motion` everywhere → fails `<= 120 KB gz` budget permanently.
  2. **Server-Component-first Landing + SVG-only `GearTrain` + CSS/WAAPI & `motionCore` for landing** (keeping dynamic `next/dynamic` islands for interactive `MirzoHud` / `GameIsland`).
- **Decision:**
  1. **Remove `three` (`three.js`)** from `GearTrain.tsx` in Phase 1/3 in favor of the already-built crisp, zero-WebGL SVG 24/36/18 gear train driven by `motionCore` (eliminates `~187 KB gz` lazy chunks, WebGL SwiftShader flakiness on school PCs, and extra dependencies).
  2. **Convert `app/[locale]/page.tsx` to a Server Component**: Render hero copy, trust badges, navigation structure, and section shells as pure HTML/CSS with inline custom workshop SVGs (no eager `@phosphor-icons/react` or `motion` runtime on initial paint!). Hydrate interactive `MirzoHudIsland` / demo preview via `next/dynamic` behind a zero-CLS static poster.
  3. **Game Boards**: Build all interactive boards (`Mirzo mashinasi`, Logic Gates, Bit Lamps, Packet Router) in accessible **SVG + DOM** (WCAG 2.2 AA, keyboard-navigable, text-mode synced), reserving Canvas 2D strictly for `NetworkBackdrop` and `canvas-confetti` bursts.
- **Consequences:** Cuts landing First-Load JS from `260.4 KB gz` down well under `120 KB gz`, unlocks Lighthouse Performance `>= 95`, and aligns 100% with §8 ("No WebGL or three.js unless an ADR proves it is needed").
