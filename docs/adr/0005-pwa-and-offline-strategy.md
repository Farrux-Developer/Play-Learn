# ADR 0005 — Offline-First PWA & Safe Service Worker Strategy

- **Status:** Proposed (Phase 0)
- **Context:** `next.config.ts` currently uses `output: 'standalone'`. There is no `manifest.ts` and no Service Worker (`swCount: 0`). Master Brief §8 requires offline use after first load, precached shell + lesson pages + game-core chunk, runtime font/image caching, and a "new version ready" toast that never strands users on broken chunk hashes.
- **Options:**
  1. `@serwist/next` (requires webpack plugin hook, versioned tightly to Next webpack build, adds build complexity with Next 15 Turbopack/standalone).
  2. Built-in Next.js `app/manifest.ts` + a **clean, versioned `public/sw.js` with build-hash manifest injection** generated during `npm run build` (`scripts/generate-sw-manifest.mjs`) + safe `SKIP_WAITING` via user-triggered toast.
- **Decision:** Implement **`app/manifest.ts` + build-versioned `public/sw.js`** (zero runtime dependencies):
  - During build, read `.next` static chunk manifest to write `/sw-manifest.json` (versioned by build ID) listing core shell, CSS, fonts, and game-core chunks.
  - SW Strategy: **Cache-First** for immutable hashed `/_next/static/*` & local fonts; **Stale-While-Revalidate / Network-First with Cache Fallback** for HTML lesson/landing routes and `/offline` fallback page.
  - **Safe Updates**: Do NOT call `self.skipWaiting()` automatically on install; notify client via `postMessage` (`SW_UPDATE_READY`), show a non-intrusive `"Yangi versiya tayyor — Yangilash"` toast, and call `skipWaiting()` + reload only when the user clicks or on fresh tab open.
- **Consequences:** Zero bundler lock-in with Next 15 upgrades, zero chance of mismatched chunk 404s mid-session, works in both `next dev` (bypassed) and `next start` / standalone production.
