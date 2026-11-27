# O'yna va o'rgan — Master Brief v1

**Mission:** add a real, deep, playable IT-fundamentals game ("Mirzo Ustaxonasi") to the existing project, and make the whole product best-in-class in design, architecture, SEO and performance.

Read this whole brief before touching code. Work phase by phase (Section 14) and stop at every STOP.

---

## 1. Role and rules of engagement

You are four experts in one: (1) principal engineer (Next.js, React, TypeScript, performance, SEO, testing); (2) game designer for 10–12-year-olds; (3) learning scientist (K–6 computing education, mastery learning); (4) product designer (UI, motion, accessibility).

- **Phases and stops.** Finish one phase, report, then STOP. Do not start the next phase until I reply "go".
- **Persistent memory.** Save this brief as `docs/PROJECT_BRIEF.md` and reference it from `CLAUDE.md`, `AGENTS.md` or `.cursor/rules` (whichever your tool uses). At the start of every session read it and `docs/PROGRESS.md`; at the end update `PROGRESS.md`.
- **Verify, never assume.** Before saying "done", run typecheck, lint, tests and build, and show the real output. Never state a Lighthouse score, bundle size or timing you did not measure.
- **Questions.** Ask at most 5 blocking questions in one message. For anything else, write your assumption in one line and continue.
- **Trade-off order** when requirements conflict: learning correctness → child safety and accessibility → performance → SEO → visual polish → feature breadth.
- **Dependencies.** Before adding one, state why, its measured size impact, the alternative you rejected and its license. For small jobs prefer a few lines of code over a library. Keep the project's existing package manager.
- **Existing code.** Extend before rewriting. Rewriting anything that works needs an ADR first (`docs/adr/NNNN-title.md`: context, options, decision, consequences).
- **Commits.** Small, reviewable, Conventional Commits. Never leave the main branch broken.
- **No fakes.** No lorem ipsum, no invented data presented as real, no TODO without a reason and an owner.

---

## 2. Project snapshot (hypotheses — verify every line in Phase 0)

This section was written from a screenshot of the landing page and one build error, not from the code.

- **Product:** "O'yna va o'rgan" ("Play and learn"), a free, Uzbek-first web app that teaches computer and IT fundamentals to 5th–6th graders (about 10–12 years old) through short lessons and puzzle games. Promise: *"Avval tushun, keyin o'yna va kodni o'zing boshqar"* (understand first, then play, then control the code yourself), shown as three steps: Tushun → O'yna → Boshqar.
- **Probable stack:** Next.js App Router, React, TypeScript, `@/` import alias. Known modules to respect: `lib/engine/store` (global store, exports `SurfaceMode`), `lib/motion/core` (motion engine with adaptive `QualityTier`), `components/NetworkBackdrop.tsx` (canvas background using `simplex-noise`).
- **Navigation → feature map:** Darslar (lessons) = lesson library and SEO pages; Xarita (map) = mastery map; O'yinlar (games) = game hub; Tamoyillar (principles) = pedagogy, privacy and review process (the trust page); Boshlash (start) = start, or resume where the learner left off.
- **What exists on screen:** hero with the 3-step promise; HUD card with level, streak ("2 ta ketma-ket"), XP flask (65/120), mascot **Mirzo** (boy in a doppi cap) with a speech bubble, the **Mirzo mashinasi** (a tiny machine showing a variable `ball`, with a "1 takt bos" button = advance one clock tick), three workshops (**ustaxona**; the third is locked until the next XP level), sound toggle (off), subtitles toggle (on); trust badges (no sign-up, saved in the browser, no internet needed); a light "Tushunish varag'i" (understanding sheet) section under the dark hero.
- **Design identity to keep and elevate:** "blueprint workshop": deep-navy grid paper, amber primary buttons with tactile pressed depth, teal for progress and success, chamfered panel corners, faint four-point-star ornaments (Central Asian motif). Dark blueprint = **Play** surfaces; light cream paper = **Learn** surfaces. Check whether `SurfaceMode` already models this.
- **Hard constraints:** no backend, no accounts, no ads, no third-party trackers; progress stored on the device; fully usable offline after the first load; Uzbek (Latin script) first, then Russian and English.
- **Known defect:** Uzbek apostrophes are inconsistent in the UI (`O'yna` with a straight `'` next to `o‘zing` with `‘`). Fix site-wide (rule in Section 12).

---

## 3. Mission and the meaning of "learned fully"

Add a **real game, not a quiz in a costume**. A child plays through a complete IT-fundamentals path and truly masters it: they can explain it and do it, not just recognize it. Then make the product the best in its niche (Uzbek-language, grades 5–6, computing fundamentals) for design polish, depth of learning, speed and offline use.

A learner who finishes the core path can, without hints:
1. convert between binary and decimal, and explain how text and images are stored;
2. build simple logic circuits from AND, OR and NOT;
3. write and debug programs with variables, conditions, loops, functions and lists on the Mirzo machine;
4. explain fetch–decode–execute and how a CPU uses memory;
5. trace how a web page travels across the internet;
6. apply safe-online rules, explain simple encryption and spot phishing;
7. explain in plain words what data is and what an AI learns from it.

Each outcome is verified by a hidden-test Boss Exam (for "explain" outcomes: choose-the-best-explanation and fix-the-wrong-explanation tasks), never by self-report.

---

## 4. Non-negotiable principles

1. **Intrinsic integration.** The concept *is* the mechanic: the learner needs the idea to progress (Habgood & Ainsworth, 2011). Never "answer a quiz question to unlock the fun part". Test: if removing the game layer leaves a quiz, redesign.
2. **See it, predict it, do it, break it, fix it, make it.** (PRIMM and Use → Modify → Create.) Every concept is shown through the Mirzo machine's visible, step-by-step execution — a *notional machine*. Every action has a visible, explainable effect.
3. **Mastery over time-on-task.** Progress is gated by demonstrated skill. XP follows mastery gains, never minutes or grinding. Old skills return through spaced, interleaved review.
4. **Cheap, fast, explained failure.** Feedback within 100 ms of any action. Failing costs seconds, never progress. Every wrong result gets misconception-specific feedback ("you changed `ball` but never read it"), not "Wrong".
5. **Cognitive load first.** One new idea per level. Worked example → faded scaffolding. Plain Uzbek, short sentences (about 14 words or fewer on average), a tap-to-define term chip for every new word, at most 2 short sentences per speech bubble.
6. **Kind by design.** No shaming, no manipulative streak pressure (use streak freezes and forgiveness), no countdown pressure on learning tasks, no rankings of children, no chat, no user content visible to others.
7. **Inclusive.** WCAG 2.2 AA, color never the only signal, everything playable by keyboard and by touch, low-end hardware supported.
8. **Honest.** Facts are correct, Uzbek is natural and teacher-reviewed, claims about performance and learning are measured.

---

## 5. The game: "Mirzo Ustaxonasi" (Mirzo's Workshops)

**Fantasy.** The learner is Mirzo's apprentice in a blueprint workshop. Townspeople bring *buyurtmalar* (orders). The learner builds and repairs machines that fulfil them. Each machine is a faithful miniature of a real computing idea, from bit → gate → program → CPU → network. The learner picks an apprentice avatar (boy, girl or neutral; stored locally with an optional nickname).

**The level loop (a "buyurtma"):**
1. **Order** — a customer states a goal with 2–3 visible example cases.
2. **Watch** (≤ 30 s, skippable) — Mirzo demonstrates a worked example on the machine, tick by tick, one or two short sentences per tick (subtitles on by default).
3. **Predict** — before running, the learner commits to a prediction ("what will `ball` be after 3 ticks?"). Wrong predictions are the best learning moments: show predicted vs actual side by side.
4. **Build** — assemble the solution on the board with unlocked parts (instructions, gates, wires, packets). Drag, tap-to-place and keyboard all work.
5. **Run** — Step (1 takt), Play, Fast-forward and **Rewind** (time travel). All state is visible: registers, memory cells, wires, packets, plus a plain-language trace log.
6. **Test** — run visible and hidden test cases (seeded generators). On failure show the exact failing case and the machine state at that moment.
7. **Reflect** — only after success: one "why does it work?" question (pick the best explanation).
8. **Reward** — stars (★ works · ★★ no hints · ★★★ also efficient versus a par), XP from *mastery gain*, mascot reaction, unlocks.

**Level kinds:** `build`, `arrange` (Parsons-style: put shuffled blocks in order), `predict` (trace only), `debug` ("Xatoni top": starts broken), `modify` (change a working machine for a new order), `boss` (Imtihon), `sandbox`.

**Systems:**
- **Toolbox grows with understanding.** Parts unlock only after their concept is learned.
- **Hints in 3 tiers:** nudge → concept reminder → show the next step. Hints lower stars slightly and never block progress.
- **Runaway protection.** Tick cap per run, with a friendly teaching moment ("Mirzo's machine is going in circles — what stops the loop?"). Simulations run in a Web Worker so the UI never freezes.
- **Diagnostic start.** A ~5-minute placement so learners can skip what they already know (skipping requires passing a short challenge).
- **Boss Exam (Imtihon)** at the end of each workshop: mixed, no hints, interleaved with earlier workshops.
- **Repair Day (Ta'mirlash kuni):** a daily 5-minute spaced-review session built from the mastery model.
- **Free Workshop (Erkin ustaxona):** a sandbox after each workshop. Creations can be shared as a URL (state compressed into the hash, no backend, `noindex`, contains game state only, never personal data).
- **Capstone "Kompyuter yasa" (Build a computer):** NAND → gates → adder → memory → ALU → tiny CPU → run your own program. Unlocks after the core path. This is the "till full" part.
- **Mastery Map** (the Xarita tab): the skill graph with mastery rings; every node links to its lesson, its game levels and its review.
- **Certificate:** a printable page (CSS print styles) once all core skills are *Mastered*. State clearly that it is not an official credential.

All names above are working names; have a native Uzbek speaker confirm them.

---

## 6. Curriculum — the core path

Map the three existing workshops onto this path in Phase 0 and propose the final order in an ADR. Pedagogical order matters more than my numbering. Map every lesson to a grade 5–6 informatics curriculum topic via a nullable `curriculumRef` field until a teacher validates it. Weave basic digital literacy (files and folders, safe searching) into Workshops 1 and 8 as side quests.

| # | Workshop | Big ideas | Core mechanic | Misconceptions to design against |
|---|----------|-----------|---------------|----------------------------------|
| 1 | Kompyuter ichida (Inside a computer) | input → process → output → storage; hardware vs software; roles of CPU, RAM, storage, OS | Assemble a computer for an order; trace where data flows | RAM vs storage; "the CPU stores my files"; software is a part you can touch |
| 2 | Bit va bayt (Bits and bytes) | binary counting, place value, bytes, units | Bit-lamp panels: set lamps to encode and decode numbers | "binary is just another alphabet"; reading place value backwards |
| 3 | Matn va rasm (Text and images) | text encoding (ASCII/Unicode, including Uzbek oʻ and gʻ), pixels, RGB, why files get big, idea of compression | Decode secret messages; pixel-art orders | "computers store letters as letters"; one byte is always one character |
| 4 | Mantiq (Logic) | Boolean values, AND/OR/NOT, truth tables, gates → half adder | Wire circuits to satisfy truth tables | "OR means exactly one"; confusing NOT with "false" |
| 5 | Algoritm (Algorithms and code) | sequence, conditions, loops, variables, functions, lists, debugging, counting steps, search and sort | Program the Mirzo machine (extends what exists); optimize step counts | `=` means equality; off-by-one; order doesn't matter; loops run "forever" |
| 6 | Mashina qanday ishlaydi (How the machine runs) | memory addresses, registers, fetch–decode–execute, instruction set, clock | Program the notional CPU; watch the cycle; hand-assemble | "the computer understands words"; program vs data |
| 7 | Tarmoq va Internet (Networks and the internet) | packets, IP addresses, DNS, client–server, HTTP, routing, latency | Route packets through a town network; "the journey of a web page" | the internet is "the cloud"; Wi-Fi = internet; a page arrives in one piece |
| 8 | Xavfsizlik, ma'lumot va AI (Safety, data and AI) | passwords and phishing, encryption (Caesar cipher and why it is weak), privacy, misinformation, tables (filter, sort), what AI learns from data, bias | Spot the phish; crack and fix ciphers; train a toy classifier | "a long word is a strong password"; AI "knows" or "thinks"; more data is always fair |
| ★ | Kompyuter yasa (Capstone) | NAND → CPU | Build up from a single gate | — |

Target about 8–10 levels per workshop (including debug sets), one boss, one free workshop: roughly 80–100 levels at full scope. Ship in vertical slices (Section 14).

---

## 7. Mastery, content and data model

- **Skill graph:** `Skill { id, workshop, prerequisites[], misconceptions[], levelIds[], lessonSlug }`. States: `new → introduced → practicing → mastered → retained` (retained = passed a delayed review at least 7 days later). Mastery decays if reviews are missed.
- **Mastery update:** transparent and unit-tested, no black box. Evidence: first-try success, hints used, correct prediction, debug success. Transfer to a *different level kind* for the same skill counts more than repeating the same kind.
- **Scheduler:** Leitner, SM-2-lite or FSRS-lite — choose in an ADR. Runs fully offline. Deterministic given an injected clock (so it is testable).
- **Level schema (Zod):** `id, workshop, skillIds[], kind, goalKey, parts[], tests { visible[], hidden[], generator(seed) }, par { instructions?, ticks? }, hints[3], feedbackRules[] (pattern → misconception → messageKey), referenceSolution, estimatedSeconds, reviewStatus: 'draft' | 'reviewed'`.
- **Build-time validation:** CI fails if a level has no reference solution that passes every test and meets `par`, if a translation is missing, if a feedback rule is unreachable, or if a reading-level check fails.
- **Progress schema (versioned, with migrations):** per-level best stars, attempts and hints; per-skill mastery and next-review date; settings (sound, subtitles, motion, language); optional local nickname and avatar.
- **Backup:** export and import progress as a file and as a short copy-paste code. Call `navigator.storage.persist()`. Safari may evict site data after a period of inactivity, so show a gentle "Save your progress" nudge and a PWA-install nudge.
- **Learning evidence:** a 3–5 item pre-check and post-check per workshop, stored locally, shown to the learner as growth ("before → after"). This also lets us find out whether the game really teaches.
- **XP** = a function of mastery gain. Level caps per workshop. Never reward time spent.

---

## 8. Architecture

**Principles**
- **Server-first, island-based.** Marketing, lesson and glossary pages are Server Components, statically generated. The game is a client island, code-split and loaded on demand behind a static poster (no layout shift). Never ship game code to pages that don't need it.
- **A pure, deterministic game core.** No React, no DOM, no `Date.now()` or `Math.random()` (inject a clock and a seeded RNG). Everything serializable, so snapshots, rewind, shareable state and replay tests all come for free.
- **Data-driven content,** typed and validated, kept separate from translation strings and engine code.
- **One-way dependencies:** `app → components → lib/game/(content | mastery | storage) → lib/game/core`. Enforce with lint rules (`no-restricted-imports` or `eslint-plugin-boundaries`).
- **Boring technology.** Prefer web-platform features over libraries.

**Suggested layout** (adapt to the repo's conventions; record deviations in an ADR):

```
app/[locale]/
  page.tsx
  learn/[track]/[concept]/page.tsx    # SSG lessons ("Tushunish varag'i") — the SEO core
  glossary/[term]/page.tsx            # SSG "X nima?" pages
  play/page.tsx                       # game hub (O'yinlar)
  play/[workshop]/[level]/page.tsx    # server shell + <GameIsland/>
  map/page.tsx   principles/page.tsx
  sitemap.ts   robots.ts   manifest.ts   opengraph-image.tsx
lib/
  engine/ (existing store)   motion/ (existing)
  game/
    core/      # PURE: vm, gates, packets, test-runner, scoring, rewind
    worker/    # Web Worker runner (optionally Comlink)
    content/   # Zod schemas, loaders, validators
    mastery/   # skill graph, scheduler
  storage/     # IndexedDB, migrations, export/import
  i18n/  seo/  a11y/
components/
  ui/          # design-system primitives
  game/        # Board, Palette, MachineView, TraceView, HintDock, MirzoCoach, Stars...
content/
  uz/ ru/ en/  # MDX lessons + JSON levels
e2e/   docs/
```

**Decisions to implement**
- **State:** transient UI state in the existing store; durable progress in IndexedDB (Dexie or idb — justify). Never put large data in `localStorage`.
- **Rendering:** SVG/DOM for boards (accessible, crisp, keyboard-friendly). Canvas 2D only for ambient effects and very large simulations. No WebGL or three.js unless an ADR proves it is needed.
- **Workers:** simulations run in a Worker with step and time caps; the UI thread only renders snapshots.
- **Motion:** use the existing `motionCore` and `QualityTier`. One shared ticker, paused on `visibilitychange`. Honor `prefers-reduced-motion` and provide a visible in-app motion toggle. `NetworkBackdrop` must be pausable (WCAG 2.2.2) and static under reduced motion. Create the noise function once (module scope or ref), never per frame.
- **Offline/PWA:** a service worker (Serwist or Workbox — pick one compatible with the installed Next.js bundler and verify it in an ADR) that precaches the shell, lesson pages and the game-core chunk, runtime-caches fonts and images, shows a "new version ready" toast, and uses an update strategy that cannot strand users on a broken version.
- **Feature flag** the new game until the vertical slice passes review.
- Detect the installed Next.js and React versions and use their idiomatic APIs. Do not copy patterns from older versions.

---

## 9. Performance and developer productivity

**Budgets** (Lighthouse mobile preset: simulated Slow 4G, 4× CPU slowdown; also test a real low-end Android if available):
- LCP ≤ 2.0 s · INP ≤ 150 ms · CLS ≤ 0.05 · TBT ≤ 200 ms. (Google's "good" thresholds are looser; we aim stricter.)
- Lighthouse mobile on landing and lesson pages: Performance ≥ 95, Accessibility 100, Best Practices ≥ 95, SEO 100.
- First-load JS: landing ≤ 120 KB gzipped; lesson pages ≤ 130 KB gzipped (demo island loads lazily); game route ≤ 250 KB gzipped up to the first playable level. CI fails above budget (`size-limit` or equivalent).
- Game: 60 fps on a mid-range phone for typical boards; input-to-feedback ≤ 100 ms; a 10,000-tick simulation finishes in a Worker without blocking the UI.

**Techniques**
- Server Components by default; `next/dynamic` for islands; prefetch on intent (hover or entering the viewport), not on page load.
- `next/font`, self-hosted, at most 2 families, variable, subset for Latin and Cyrillic, with a size-adjusted fallback. **Verify the chosen fonts really contain U+02BB and U+02BC (ʻ ʼ)** and render oʻ and gʻ correctly.
- `next/image` with explicit sizes. Mascot and game parts as inline SVG or a sprite sheet.
- No heavy animation suites, no UI kits, no lodash- or moment-class libraries. Motion = the existing motion core plus CSS or the Web Animations API.
- Sounds: tiny synthesized WebAudio effects (click, tick, success chime) instead of downloaded files; off by default; never autoplay.
- Measure first: record a baseline before any change, re-measure after every phase, keep a table in `docs/PERF.md` (metric, before, after, device or profile).

**Developer productivity**
- Scripts: `check` (typecheck + lint + unit tests + content validation) and `verify` (check + build + e2e).
- TypeScript `strict` and `noUncheckedIndexedAccess`; no `any` without a comment.
- Husky and lint-staged; Conventional Commits.
- CI on every pull request: typecheck, lint, unit, content validation, build, Playwright (mobile and desktop), Lighthouse CI budgets, bundle-size gate, link check.
- Content CLI: `content:new level` scaffolds a level with its test file; `content:check` validates schemas, translation coverage, reading-level heuristics, reference solutions and links.
- A design-system gallery (dev-only route or Storybook — justify) showing every primitive in every state.
- `docs/`: `PROJECT_BRIEF.md`, `PROGRESS.md`, `AUDIT.md`, `PERF.md`, `SEO.md`, `COMPETITIVE.md`, `BACKLOG.md`, `adr/`.

---

## 10. SEO (Uzbek market)

A game on its own is invisible to search engines. Every concept gets a fast, crawlable, genuinely helpful HTML page, and the game enhances it.

- **Page model:** `/{locale}/learn/{track}/{concept}` — one page per concept ("Tushunish varag'i"): 500–1,000 words of original, correct explanation, a live demo island, a worked example, common mistakes, a mini self-check, a "play it" call to action and related concepts. `/{locale}/glossary/{term}` for "what is X?" queries. A hub page per workshop. Slugs: lowercase ASCII, apostrophes removed (`oyinlar`, not `o'yinlar`), stable, no dates.
- **Content works without JavaScript.** Lesson text, headings and key demo states are in the server HTML. The game is progressive enhancement.
- **Metadata API:** a unique `<title>` (≤ 60 characters) and description (≤ 155) per page in the page's own language; canonical URL; `alternates.languages` (hreflang `uz`, `ru`, `en` and `x-default`); Open Graph and Twitter cards; a generated OG image per concept (`opengraph-image`); `robots` set to noindex for sandbox, share, draft and unreviewed pages; `app/sitemap.ts` with alternates and real `lastModified`; `app/robots.ts`; web manifest; correct `lang` on `<html>`.
- **Structured data (JSON-LD):** `Organization`, `WebSite` and `BreadcrumbList` everywhere; `Article` or `LearningResource` for lessons and `DefinedTerm` for the glossary, for entity clarity. **Do not plan around education rich results:** Google retired Course Info and Learning Video rich results in 2025 and also phased out Practice Problem, and FAQ and HowTo rich results are restricted or gone. Before investing time in any schema type, check Google's *current* list of supported types.
- **Information architecture = skill graph.** Internal links follow prerequisites ("before this", "next"), with breadcrumbs and hub → concept → glossary links. No orphan pages.
- **Search engines in this market:** Google and Yandex both matter in Uzbekistan. Set up Search Console and Yandex Webmaster (verification through metadata), submit sitemaps to both, consider Bing. Do keyword research with real tools (Search Console, Yandex Wordstat) and **never invent keyword data**. Query shapes to test: "[term] nima?", "[term] qanday ishlaydi?", "5-sinf informatika …", "6-sinf informatika …". Write titles in that natural voice.
- **Technical hygiene:** HTTPS and HSTS, Brotli, 301 redirects for moved URLs, a useful custom 404, no duplicate content across locales without hreflang, no intrusive interstitials, alt text, headings and landmarks (accessible = crawlable).
- **Trust (E-E-A-T):** a Principles page (how we teach, who reviews content, the privacy promise), visible "reviewed by" metadata once a teacher signs off, last-updated dates, a contact page.
- **Measure:** after launch, track Core Web Vitals field data (Search Console / CrUX). Keep a pass/fail checklist in `docs/SEO.md`.

---

## 11. Design system and UX

**Direction.** Keep the *blueprint workshop* concept and evolve it into one coherent, ownable language. Design with a point of view and avoid the generic AI look.

- **Learn vs Play.** Learn = calm, spacious cream paper. Play = focused, high-contrast navy blueprint. Make the transition a deliberate, memorable moment (for example, the paper slides away to reveal the blueprint when a level starts).
- **Spend boldness in one place: the Mirzo machine.** It is the hero of the product. Make its mechanics satisfying: parts click into place, signals travel along wires, registers tick like odometers, a soft "clunk" per tick when sound is on. Keep everything around it quiet and disciplined.
- **Tokens.** Consolidate into CSS variables: named colors with roles (paper, blueprint, ink, amber action, teal success, warning, danger, info), type scale, spacing scale, a *small* set of radii with the chamfer as the signature shape, elevation (pressed-button depth), motion durations and easings, z-index. AA contrast on every pair; test with color-blindness simulation.
- **Typography.** At most 2 families: one distinctive display face with real character plus one highly legible text face. Latin and Cyrillic coverage. Tabular numerals for machine readouts; monospace only where it really is code or data. Lesson line length under 75 characters; body text at least 16 px (18 px on lesson pages).
- **Mirzo.** An SVG character with 6 expression states (idle, thinking, happy, oops, proud, sleepy) and subtle idle motion. One speech-bubble component reused for tutorials, hints and feedback.
- **Game feel.** Immediate response (≤ 100 ms); squash-and-stretch on buttons; success particle bursts scaled by `QualityTier`; no screen shake (motion sickness); haptics only where supported and only if enabled.
- **Avoid:** purple-gradient SaaS look, stock illustrations, grids of identical rounded cards, gradient washes as decoration, an all-caps eyebrow label above every heading, emoji as UI icons (use one consistent custom SVG icon set), "→" on every button. Motion that answers a user action is welcome; unprompted decorative motion is rationed to one orchestrated moment per page.
- **Responsive and devices.** Mobile-first from 360×640; landscape layouts for game boards; safe-area insets; primary actions reachable one-handed. School PCs (mouse, keyboard, 1366×768) and tablets (touch) are first-class. PWA fullscreen.
- **Copy.** Plain Uzbek, verbs first ("Bosib ko'r", "Tekshir"), the same word for the same action everywhere. Errors say what happened and what to try, without blame or apology.

---

## 12. Accessibility, i18n, safety and privacy

**Accessibility — WCAG 2.2 AA minimum**
- Every game action has a keyboard path and a tap path. **2.5.7 Dragging Movements:** always offer a non-drag alternative. **2.5.8 Target Size:** use at least 48 px for kids. **2.4.11 Focus Not Obscured.** **2.2.2 Pause, Stop, Hide** for moving content. **1.4.11 Non-text Contrast.**
- Visible focus rings; logical focus order after every state change; concise `aria-live` (polite) announcements for machine state changes; accessible names for every part; color is never the only signal.
- Subtitles for every audio line; reduced-motion mode; a dyslexia-friendly option (font and spacing); text resize to 200%.
- A list-based **text mode** for each board exposes the same actions to screen readers and keyboard users.

**Internationalization**
- Locales: `uz` (Latin) default, `ru`, `en`. The architecture must allow `uz-Cyrl` later without refactoring. Use ICU message format through a maintained library (for example next-intl — verify the fit). No hard-coded strings. Pseudo-localization in CI to catch overflow. Plural rules per locale; dates and numbers via `Intl`.
- **Uzbek text rule (confirm with a native editor):** `ʻ` (U+02BB) for oʻ and gʻ, `ʼ` (U+02BC) for the tutuq belgisi. Normalize every apostrophe variant (`'` `‘` `’` `` ` `` `ʻ` `ʼ`) on input, in search, in content lint, and strip them from slugs.
- **Content quality:** every string carries `reviewStatus`. Machine-written Uzbek is *draft* and **never ships indexable**. Keep a glossary of consistent terms (seed list, to be verified by a teacher: protsessor, xotira, bit, bayt, algoritm, dastur, o'zgaruvchi, shart, sikl, xato, takt, tarmoq, parol, shifrlash).

**Safety and privacy**
- Collect nothing: no accounts, no cookies (none are needed), no third-party scripts or fonts at runtime, no analytics by default. If metrics are ever needed: cookieless, aggregate-only, self-hosted, disclosed on the Principles page.
- A plain-language privacy page in uz, ru and en. Avoid external links in the learner area, or put an "you're leaving" screen in front of them.
- Security headers: CSP (with nonces where feasible), `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options`, frame-ancestors.
- **Playtest support:** a hidden `?debug` panel with a *local-only* event log (time to first success, stuck points, hint rate) that can be exported as JSON. Nothing leaves the device.

---

## 13. Testing and quality gates

- **Unit (Vitest):** VM, gate and packet engines, scoring, scheduler, migrations, slug and apostrophe normalization.
- **Property-based (fast-check):** determinism; `rewind(step(s)) == s`; tick caps always terminate; serialization round-trip.
- **Content tests:** every `referenceSolution` passes all tests and meets `par`; every `feedbackRule` is reachable; every skill has at least 3 levels across at least 2 kinds, including a `debug` level and a transfer level.
- **Component and accessibility:** Testing Library plus axe on every primitive and page; keyboard-only Playwright flow through a complete level.
- **E2E (Playwright):** first run → play a level → reload → progress persisted → go offline → app still works → export and import progress. Run in a mobile project (360×640, touch) and a desktop project.
- **Performance:** Lighthouse CI budgets; bundle-size gate; a 10,000-tick simulation test.
- **Definition of Done for every change:** types ✓ lint ✓ tests ✓ axe ✓ budgets ✓ no new console errors ✓ `PROGRESS.md` updated ✓.

---

## 14. Phased plan (deliverables · acceptance · STOP)

### Phase 0 — Preflight and audit (no feature code)
1. **Fix the build.** `Module not found: Can't resolve 'simplex-noise'` in `components/NetworkBackdrop.tsx`. Run `npm install simplex-noise` (v4.x provides `createNoise2D`, is dependency-free and ships its own types). Create the noise function once, not per frame. Repeat `npm run build` until it is clean.
2. **Audit.** Framework and library versions; routing; the store and motion APIs; design tokens; what the three existing workshops and the Mirzo machine actually do (instruction set, state shape); a quick accessibility scan; a Lighthouse mobile baseline for `/`; a bundle analysis; tech debt; risks. Write `docs/AUDIT.md`.
3. **Competitive scan** in `docs/COMPETITIVE.md`: 8–10 products (for example Code.org, Scratch, Lightbot, Human Resource Machine, The Nand Game, Turing Complete, Khan Academy, Brilliant, Duolingo, CS Unplugged, Tynker): what each does best, and where we can win. If you cannot browse, say it is from memory and unverified.
4. **Propose as ADRs (not code):** final workshop order mapped to the existing ones; the Mirzo machine's instruction set (versioned; English mnemonics with Uzbek labels in the UI); storage and scheduler choices; i18n library; PWA approach.
5. Save this brief as `docs/PROJECT_BRIEF.md`; create `docs/PROGRESS.md`.

**Acceptance:** the build is green; audit, competitive scan and ADRs exist; baseline numbers are recorded. **STOP.** Summarize and ask at most 5 questions.

### Phase 1 — Foundations
Folder structure and import-boundary lint; consolidated design tokens; UI primitives (Button, chamfered Panel, Chip, Toggle, TermChip, SpeechBubble, Stars, ProgressRing, Dialog, Toast) with every state plus the gallery; i18n skeleton (uz, ru, en); content pipeline with Zod validation; storage layer with migrations and export/import; mastery model and scheduler with tests; CI with all gates.
**Acceptance:** all gates green in CI; budgets enforced; no visual regression on the current landing page. **STOP.**

### Phase 2 — Game core
The pure TypeScript core: Mirzo VM (versioned instruction set), gate-circuit evaluator, packet-network simulator (skeleton), seeded test runner, scoring, snapshots and rewind; Worker runner with tick caps; reference-solution harness.
**Acceptance:** property tests pass; a 10,000-tick run is fast (state the number you measured and the machine); infinite-loop levels end gracefully. **STOP.**

### Phase 3 — Vertical slice (the template for everything else)
Take one workshop (the best candidate from the audit) to *finished*: at least 8 levels across `build`, `predict`, `debug` and `modify`, plus 1 boss and a free workshop; the full level loop from Section 5 with Mirzo as coach, hints, rewind and misconception feedback; its server-rendered lesson and glossary pages; mastery-map integration; offline; keyboard, touch and text mode; performance and accessibility budgets met.
**Acceptance:** a 10–12-year-old can start and finish level 1 in under 90 seconds without help (I will playtest); all gates green; Lighthouse targets met. **STOP for my playtest.** Do not scale until this slice is excellent.

### Phase 4 — Scale
Remaining workshops one at a time, each at slice quality, in pedagogical order. Per workshop: lessons (Uzbek first; Russian and English after native review), levels, boss, glossary, SEO pages, map nodes.
**Acceptance per workshop:** `content:check` green; `reviewStatus` tracked; budgets still met. **STOP after each workshop.**

### Phase 5 — Capstone, certificate, sharing
"Kompyuter yasa", Free Workshop sharing via URL hash, the printable certificate, Repair Day. **STOP.**

### Phase 6 — Launch hardening
Complete `docs/SEO.md` checklist (Search Console and Yandex Webmaster ready); Core Web Vitals pass under throttled conditions; security headers and CSP; privacy page; error boundaries and offline fallback page; update flow tested; README and contribution guide; release checklist.

---

## 15. Report format after every phase

1. **Summary** (≤ 8 lines)
2. **What changed** (files and directories)
3. **How I verified** (commands and real output)
4. **Metrics, before → after**
5. **Risks and open questions**
6. **Proposed next step**

---

## 16. Anti-goals

- No backend, accounts, ads, trackers, chat or rankings of children.
- No quiz with confetti on top (see Principle 1).
- No unmeasured performance or SEO claims.
- No big dependencies for small jobs.
- No rewrites of working systems without an ADR.
- No machine-translated content shipped as final.
- No placeholder content in production builds.
- No copyrighted characters, art or audio; every asset is original or properly licensed and listed in `docs/CREDITS.md`.
- No scope creep: ideas not in this brief go to `docs/BACKLOG.md`. (Teacher mode, class codes and printable worksheets live there. Keep the data model ready for them.)

---

## 17. First action

Start **Phase 0** now. Do not write feature code yet.
