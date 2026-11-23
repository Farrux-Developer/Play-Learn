# Teacher & Curriculum Review Questions (`TEACHER_REVIEW.md`)

This document lists every open pedagogical, linguistic, and curriculum question where teacher input is needed, along with the conservative default currently implemented in **Oʻyna va oʻrgan**.

## 1. Unverified Claims Removed or Neutralized in the UI
- **Claim removed**: `"Birinchi gʻalabaga atigi 45 soniya"` (Hero) → replaced with `"Birinchi qadam — bir necha daqiqada"` because completion time varies across learners and has not yet been measured in a classroom pilot.
- **Claim neutralized**: `"DTS 5–6-sinf informatikasi"` (Hero & skill cards) → replaced with `"5–6-sinf informatika mavzulariga tayyorlov"` until an informatics teacher verifies exact alignment with the current Ministry curriculum for Grades 5–6.

## 2. School Terminology & Language Questions
1. **Default programming language for the `"Haqiqiy kod"` toggle (SHOULD-4)**:
   - *Question*: Does your school teach Python, Scratch, Pascal, or C++ in Grades 5–6/7?
   - *Recommended default*: **Python** (cleanest syntax for 12-year-olds, closest to Uzbek pseudocode). All pseudocode examples have read-only line-by-line Python equivalents.
2. **Canonical print command in Uzbek pseudocode**:
   - *Question*: Do students recognize `chopEt(...)` or `chiqar(...)` better in Uzbek pseudocode?
   - *Recommended default*: **`chopEt(...)`** (kept consistent across all lessons, traces, glossary items, and mini-games, and documented on the Cheat Sheet).
3. **Loop keyword phrasing**:
   - *Question*: Should bounded counting loops say `uchun i = 1 dan 4 gacha` (inclusive of 4, matching Uzbek everyday phrasing) or use exclusive upper bounds?
   - *Recommended default*: **`uchun i = 1 dan 4 gacha` is inclusive (1, 2, 3, 4)**, and is explicitly contrasted with `i < 5` vs `i <= 5` in Lesson 4 and `loop-10` so learners see both conventions clearly.
4. **Learner address form (`sen` vs `siz`)**:
   - *Question*: For 12-year-old learners (Grade 6), do teachers prefer friendly `"sen"` from mascot Mirzo or formal `"siz"`?
   - *Recommended default*: **`"sen"`** for all learner-facing lessons, hints, and feedback (warm peer/mentor tone), and **`"siz"`** exclusively in the Teacher/Parent Report modal.
5. **Cyrillic script terminology**:
   - *Question*: In Cyrillic mode, should the word for loop be `"Цикл"` (standard textbook Russian-origin loanword) or `"Сикл"`?
   - *Recommended default*: **`"Цикл"`** in Cyrillic and **`"Sikl"`** in Latin, matching standard Uzbek school informatics textbooks.

## 3. Historical, Geographic & Cultural References
- **City names along the Journey Map (`Samarqand`, `Buxoro`, `Toshkent`)**: Used purely as geographic stops along the Silk Road learning route. No historical claims, dates, or quotes are attached.
- **Mascot `"Mirzo"`**: Fictional 12-year-old student character wearing a traditional doʻppi; does not claim to represent any historical figure.
- **Everyday world contexts**: Tea brewing (`choy damlash`), bazaar/ticket desk (`chipta kassasi`), and step-by-step robot path — chosen as familiar, culturally grounded everyday analogies, with explicit explanation of where analogies break (e.g., `"taʼbga koʻra tuz"` fails for a computer).
