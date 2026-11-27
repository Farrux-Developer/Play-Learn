# SEO Plan & Verification Checklist (`docs/SEO.md`)

**Target Market:** Uzbekistan (Google + Yandex), Uzbek Latin (`uz`) default + `ru`, `en`.

## Checklist (Phase 0 Baseline → Phase 6 Launch)
- [ ] Static SSG routes `/{locale}/learn/{track}/{concept}` (500–1000 words, HTML-first without JS)
- [ ] Static SSG glossary routes `/{locale}/glossary/{term}` (`"X nima?"`)
- [ ] ASCII lowercase apostrophe-free slugs (`oyinlar`, `ozgaruvchi`, `kompyuter-ichida`)
- [ ] Unique `<title>` (`<= 60` chars) & `<meta name="description">` (`<= 155` chars) per page
- [ ] Canonical URLs + `alternates.languages` (`uz`, `ru`, `en`, `x-default`)
- [ ] Generated OG images (`opengraph-image`) per concept + Twitter card tags
- [ ] `robots: noindex` on `/sandbox`, shared-hash pages, and `reviewStatus: 'draft'` content
- [ ] `app/sitemap.ts` with `alternates` & real `lastModified`; `app/robots.ts`
- [ ] JSON-LD (`Organization`, `WebSite`, `BreadcrumbList`, `Article`/`LearningResource`, `DefinedTerm` — strictly current Google supported types; no retired FAQ/PracticeProblem assumptions)
- [ ] Principles / Trust page (`reviewStatus`, reviewer credit, last-updated dates, privacy promise)
- [ ] Custom 404 + Search Console / Yandex Webmaster verification metadata hooks
- [ ] Real keyword research conducted via Search Console / Yandex Wordstat (never invented)
