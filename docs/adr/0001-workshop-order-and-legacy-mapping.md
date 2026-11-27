# ADR 0001 — Final Workshop Order & Legacy Mapping

- **Status:** Proposed (Phase 0)
- **Context:** The existing site exposes 3 flat MCQ workshops (`algoritmlar`, `mantiq`, `sikllar`) and 4 lessons (`L1`–`L4`) plus 3 city nodes (`Samarqand`, `Buxoro`, `Toshkent`). Master Brief §6 defines 8 core workshops + Capstone (`Kompyuter yasa`) for ages 10–12 (Grades 5–6). We must preserve existing IDs cleanly and pick the strongest vertical-slice candidate for Phase 3.
- **Options:**
  1. Keep 8-workshop sequence strictly `1 → 8` (`Inside a computer → Bit → Text/Image → Logic → Algorithms → CPU → Networks → Safety/AI → Capstone`) OR
  2. Start with Algorithms (`#5`) first so learners immediately touch code, then reveal hardware/bits underneath.
- **Decision:** Adopt the bottom-up conceptual arc **`W1 Kompyuter ichida` → `W2 Bit va bayt` → `W3 Matn va rasm` → `W4 Mantiq` → `W5 Algoritm` → `W6 Mashina qanday ishlaydi` → `W7 Tarmoq va Internet` → `W8 Xavfsizlik, maʼlumot va AI` → `W9 (★) Kompyuter yasa`**, while mapping legacy IDs cleanly:
  - `algoritmlar` + `L1`, `alg-1`, `alg-2` → credit **`W5 Algoritm`** (Sequence/Debug track)
  - `mantiq` + `L3`, `man-1` → credit **`W4 Mantiq`** (Conditions/Gates track)
  - `sikllar` + `L4`, `sik-1` → credit **`W5 Algoritm`** (Loops track)
  - `L2` (Variables) → credit **`W5 Algoritm`** (Variables track)
  - **Vertical Slice recommendation for Phase 3:** **`W5 Algoritm` (Track: Oʻzgaruvchilar, shartlar va sikllar)** OR **`W4 Mantiq`** — recommend **`W5 Algoritm`** first because it directly upgrades the hero's `Mirzo mashinasi` (`ball = 5; ball = ball + 3`) and the 3 existing `ustaxona` tabs into genuine playable levels (`build`, `arrange`, `predict`, `debug`, `modify`, `boss`, `sandbox`).
- **Consequences:** All existing `oyna_organ_workshop_v1` saves migrate with zero lost XP/lessons/tasks; `W1`–`W8` unlock cleanly via skill graph + diagnostic placement (`Kirish sinovi`) rather than raw XP farming.
