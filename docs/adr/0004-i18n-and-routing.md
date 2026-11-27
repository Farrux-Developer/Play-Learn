# ADR 0004 — Routing (`app/[locale]/...`) & i18n Strategy

- **Status:** Proposed (Phase 0)
- **Context:** Currently the app is a single client page `app/page.tsx` (`260.4 KB gz` first-load JS). Master Brief §8, §10, §12 require Server-Component-first SSG pages (`/{locale}/learn/{track}/{concept}`, `/{locale}/glossary/{term}`, `/play`, `/map`, `/principles`), `uz` default + `ru`, `en` (and future `uz-Cyrl`), ICU plural/number formatting, and landing first-load JS `<= 120 KB gz`.
- **Options (i18n):**
  1. `next-intl` (adds ~12–18 KB gz client runtime when client components use `useTranslations`, full ICU support).
  2. Lightweight typed server-first dictionary + tiny ICU `Intl.MessageFormat` / plural helper (~1.5 KB gz) keeping all lesson/SEO copy strictly on the server.
- **Decision:** Adopt **`next-intl`** ONLY if scoped cleanly to Server Components on landing/learn/glossary pages (zero client translation bundle bloat on landing), OR use **typed server-first locale dictionaries + native `Intl.PluralRules` / `Intl.NumberFormat` + lightweight `{var}` / `{count, plural, ...}` formatter (`< 2 KB gz`)** in `lib/i18n/` with build-time validation ensuring 100% key parity across `uz`, `ru`, `en` (and ready slot for `uz-Cyrl`). Prefer the lightweight `lib/i18n/` module (`0` external runtime dependency, zero client bundle tax, 100% compatible with both Server Components and static offline export/SW) while keeping ICU-compatible plural syntax.
- **Routing & Migration:** Keep `/` redirecting cleanly (or serving default `uz` landing + `/` canonical handling) and add `app/[locale]/page.tsx`, `learn/[track]/[concept]/page.tsx`, `glossary/[term]/page.tsx`, `play/page.tsx`, `play/[workshop]/[level]/page.tsx`, `map/page.tsx`, `principles/page.tsx`, plus `/design-gallery` (dev-only).
- **Apostrophe Rule:** Enforce `ʻ` (`U+02BB`) for `oʻ`/`gʻ` and `ʼ` (`U+02BC`) for tutuq belgisi in `content:check`, normalize all variants (`' ‘ ’ \` ʻ ʼ`) in user input/search, and strip from slugs.
- **Consequences:** Server Components render full HTML without client JS bloat; pseudo-localization (`[!! ... !!]`) can run in CI on the typed dictionary directly.
