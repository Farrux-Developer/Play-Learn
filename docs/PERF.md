# Performance Baseline & Tracking (`docs/PERF.md`)

**Budgets (Master Brief §9):**
- Mobile Lighthouse (Slow 4G, 4× CPU): LCP `<= 2.0 s`, INP `<= 150 ms`, CLS `<= 0.05`, TBT `<= 200 ms`, Perf `>= 95`, A11y `100`, BP `>= 95`, SEO `100`.
- First-load JS: Landing `<= 120 KB gz` · Lesson `<= 130 KB gz` · Game route `<= 250 KB gz`.
- Simulation: `10,000` ticks in Web Worker without blocking UI thread.

## Measured Baselines

| Metric | Phase 0 Baseline (2026-11-27) | Phase 1 Measured (2026-11-27) | Budget Target | Profile / Method |
|---|---|---|---|---|
| Landing `/` First-Load JS | **`260.4 KB gz`** *(over budget)* | **`119.5 KB gz`** *(PASS)* | `<= 120 KB gz` | `.next/app-build-manifest.json` + gzip |
| `/design-gallery` First-Load JS | `—` | **`109.0 KB gz`** *(PASS)* | `<= 250 KB gz` | `.next/app-build-manifest.json` + gzip |
| Landing `/` `app/page` chunk | `32.1 KB gz` | **`18.4 KB gz`** (`18.37 KB`) | `—` | `.next/static/chunks/app/page-*.js` |
| Shared runtime chunks on `/` | `228.3 KB gz` | **`101.1 KB gz`** (`webpack` + Next/React) | `<= 105 KB gz` | `.next/static/chunks` |
| First-Load CSS | `12.3 KB gz` | **`13.7 KB gz`** (`13.72 KB`) | `<= 25 KB gz` | `.next/static/css/*.css` |
| Local Fonts (raw) | `425.6 KB` (`3` families) | `425.6 KB` (`3` families) | `<= 2` families + mono | `@fontsource*` |
| Horizontal Overflow (`360×640` & `1440×900`) | `0 px` | **`0 px`** | `0 px` | Playwright Chromium |
| `axe-core` WCAG AA Violations (`/` & `/design-gallery`) | `—` | **`0`** (`/`: `0`, `/design-gallery`: `0`) | `0` | Playwright + `axe-core@4.14.1` |
| Runtime External Network Requests | `0` | **`0`** | `0` | Static export / zero external runtime calls |
| Lighthouse Mobile (Slow 4G, 4× CPU) | `NOT RUN` (`lighthouse` CLI absent) | `NOT RUN` (`lighthouse` CLI absent) | `Perf >= 95` | `lighthouse` CLI unavailable in container |

## Phase 2 Simulation & Bundle Measurements (2026-11-27)

- **Host Machine (Original Linux)**: `linux` (`x86_64`), `4` vCPUs, Node `v22.23.5` — `10,006`-tick `runVm`: `min 0.962 ms` / `median 1.187 ms` / `p95 4.258 ms`.
- **Host Machine (Windows Verified)**: `Windows`, `Intel(R) Core(TM) i5-5200U CPU @ 2.20GHz` (`2` cores / `4` logical processors), Node `v26.5.1` — `10,006`-tick `runVm`: `min 1.12 ms` / `median 2.457 ms` / `p95 40.896 ms`.
- **Bundle check on Windows (`npm run verify`) after ADR-0006 `GearTrain` SVG-only cleanup**:
  - Landing `/`: **`119.4 KB gz`** / `120.0 KB gz` (`PASS`)
  - `/design-gallery`: **`108.9 KB gz`** / `250.0 KB gz` (`PASS`)

