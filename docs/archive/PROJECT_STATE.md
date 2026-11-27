# PROJECT_STATE — «Oʻyna va oʻrgan» (Algoritm Ustaxonasi)

Last updated: 2026-11-25
Current phase: **PHASE 2 COMPLETE (Design & Curriculum Docs only; app code untouched)**
Next step: **PHASE 3 — Platform Engine (Data Models, IndexedDB, Migration, Mastery/SRS, i18n, Mirzo mashinasi, Mirzo-kod, JS Worker Sandbox, PWA)** (awaiting user `"ок"`)

---

## 1. Content & Platform Counters

| Metric | Current Codebase | Designed Target (Phase 2 Specs) |
|---|---|---|
| Units (`U0`–`U10`) | 0 formal | 11 (`U0`–`U10`) |
| Lessons | 4 (`L1`–`L4`) | 71 (mapped in `/docs/curriculum.md`) |
| Skills in skill graph | 0 formal | 154 (`S001`–`S154` in `/docs/skill-graph.md`) |
| Authored + procedural tasks | 4 + 3 diag | ~680 across `Sinov` / `Tuzatish` / `Qurish` & bosses |
| Intrinsic-integration games (`>= 15` levels) | 0 | 14 (`G01`–`G14` in `/docs/games/G01..G14.md`) |
| Executable VMs / Interpreters | 0 (3-tick static array) | 3 (`Mirzo mashinasi`, `Mirzo-kod`, Web Worker JS) |
| Storage & Offline PWA | `localStorage` only, no SW | IndexedDB + migration + export/import + Manifest + SW |
| Hero copy options (15–35 audience) | Still `5–6-sinf` (locked until Phase 3/user choice) | 3 variants documented in `/docs/hero-copy-options.md` |

---

## 2. Completed Work

- **Phase 1**: Full repository, bundle, runtime, and coverage audit completed (`8/8` tests, `eslint` clean, `compile_applet` pass).
- **Phase 2**: Authored complete design documentation (zero application code modified):
  - `/docs/curriculum.md` — 11 units (`U0`–`U10`), 71 lessons, PRIMM structure, mastery (`>=80%` on last 5 hint-free), SRS (`Leitner-6` / `FSRS-lite`), legacy ID preservation (`L1`–`L4`, `alg-1/2`, `man-1`, `sik-1`).
  - `/docs/skill-graph.md` — 154-skill DAG (`S001`–`S154`) with prerequisites, lessons, practice modes, and linked games.
  - `/docs/vm-and-dsl-spec.md` — `Mirzo mashinasi` (32/100-cell LMC VM, step forward/back, breakpoints, Uzbek errors), `Mirzo-kod` (pure TS recursive-descent parser & step tracer), Web Worker JS sandbox (`<= 2s` timeout), and opt-in P2 Pyodide notes.
  - `/docs/games/G01.md`..`G14.md` — 14 intrinsic-integration GDDs (each with keyboard accessibility, `>= 15` levels via 5 authored + seeded procedural generator + solver, `<= 60 KB gz` chunk budget).
  - `/docs/uzbek-style-guide.md` — ages 15–35 mentor voice, `ʻ` (`U+02BB`) / `ʼ` (`U+02BC`) orthography rules, 52-term standardized CS glossary (`uz`/`en`/`ru`).
  - `/docs/hero-copy-options.md` — 3 Uzbek Hero & Metadata replacement variants for ages 15–35.

---

## 3. Architectural Decisions (Phase 2)

1. **Skill DAG size**: Fixed at **154 skills** (`S001`–`S154`) across **71 lessons** (`U0`–`U10`) — cleanly inside target `140–180` skills and `~71` lessons.
2. **Game Portfolio**: Selected **14** distinct intrinsic-integration games (`G01`–`G14`, exceeding `>= 12`), prioritizing `G02` (`Mantiq darvozalari`) + `G03` (`Xotira qutilari va iz`) + `G07` (`Parsons ustaxonasi`) for Phase 4's `U4` vertical slice (`G02` & `G03` required explicitly by prompt, `G07` bridges U4 Parsons practice).
3. **Hero Copy**: Recommended **Variant A** (`"Kodni yodlama — ichidan tushun, oʻynab mustahkamla"`) for ages 15–35; code remains untouched until user approves / selects preferred variant.
4. **Script & i18n**: Canonical Uzbek Latin (`U+02BB` `ʻ`, `U+02BC` `ʼ`) as primary UI language + `ru` and `en` UI dictionary keys starting in Phase 3.

---

## 4. Next Step

Await user **`"ок"`** (and optional choice of Hero Variant A/B/C) to begin **Phase 3 — Platform Engine** (`types`, `IndexedDB` + `localStorage` migration + JSON export/import, `SkillGraph` + mastery + `Leitner-6/FSRS` SRS, `Placement`, `i18n`, `Mirzo mashinasi` LMC VM, `Mirzo-kod` AST interpreter, Web Worker JS sandbox, PWA Manifest & SW, Uzbek & DAG validators, and unit tests).
