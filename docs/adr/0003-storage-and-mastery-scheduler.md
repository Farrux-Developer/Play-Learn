# ADR 0003 — Durable Storage (`idb`) & Mastery Scheduler (`Leitner-5 + Kind-Transfer`)

- **Status:** Proposed (Phase 0)
- **Context:** Current progress lives in `localStorage` (`oyna_organ_workshop_v1`). Master Brief §7–8 require versioned IndexedDB storage, export/import (file + short copy-paste code), `navigator.storage.persist()`, Safari eviction nudge, and a deterministic offline mastery scheduler.
- **Options (Storage):**
  - `Dexie` (~22 KB gz) vs `idb` (~1.2 KB gz) vs raw IndexedDB wrapper (~0 KB deps).
- **Decision (Storage):** Use **`idb` (`^8.x`, MIT, ~1.2 KB gz)** (or thin Promise helper) in `lib/storage/` with schema version `2`, automatic one-time migration from `localStorage` key `oyna_organ_workshop_v1`, compact base64url+CRC32 copy-paste code export/import + JSON file backup, and `navigator.storage.persist()` request after first completed level. Keep transient UI flags (`soundEnabled`, `subtitlesEnabled`, `motionPaused`, `surfaceMode`) synced cleanly.
- **Options (Scheduler):**
  - `SM-2-lite`, `FSRS-lite`, or `Leitner-5`.
- **Decision (Scheduler):** Implement **deterministic `Leitner-5` with Delayed Retention (`retained >= 7 days`) & Injected Clock**:
  - Boxes `0..4` with intervals `[0d, 1d, 3d, 7d, 14d]`; skill state `new -> introduced -> practicing -> mastered -> retained`.
  - **Mastery formula**: transparent weighted evidence over recent attempts (`firstTry`, `hintFree`, `predictCorrect`, `kindTransfer` bonus when succeeding on a different level kind such as `debug` after `build`).
  - Overdue reviews beyond `2×` interval softly downgrade `retained -> mastered` or `mastered -> practicing` for **Taʼmirlash kuni** (5-minute daily repair queue, capped at `8` items/session) without shaming or punitive XP loss.
- **Consequences:** Tiny bundle footprint (`~1.2 KB gz`), zero black-box math, 100% deterministic unit/property tests via injected `nowMs`.
