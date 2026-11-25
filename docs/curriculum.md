# Curriculum Specification — «Oʻyna va oʻrgan» (U0–U10)

**Target Audience:** Ages 15–35 (high-schoolers grades 9–11, university entrants, career-switching adult beginners) in 5–15 minute focused sessions.  
**Pedagogical Frameworks:** PRIMM (`Predict → Run → Investigate → Modify → Make`), Notional Machines (`Mirzo mashinasi` & `Mirzo-kod` tracer), Mastery Learning (`>= 80%` across last 5 hint-free attempts), Spaced Repetition (`Leitner-6` / `FSRS`, `<= 10` due items/day), and Intrinsic Integration games.  
**Course Totals:** **11 Units (`U0`–`U10`) · 71 Lessons · 154 Skills (`S001`–`S154`) · 14 Games (`G01`–`G14`) · ~680 Practice Items** (authored + seeded procedural variants).

---

## 1. Pedagogical Loop & Mastery Rules

### 1.1 Lesson Structure (PRIMM, 5–8 min/lesson)
Every lesson follows a 5-stage micro-loop:
1. **Predict (`Taxmin`)**: Learner inspects a short `Mirzo-kod` or `Mirzo mashinasi` snippet and predicts the exact output/final state **before** running it.
2. **Run (`Ishga tushir`)**: Real step-by-step execution inside `Mirzo-kod` / `Mirzo mashinasi` / Web Worker JS sandbox with live variable boxes, call stack, or memory cells. Discrepancy between prediction and reality creates the "aha" moment.
3. **Investigate (`Tadqiq qil`)**: 1–2 targeted micro-probes (e.g., *"Which line changed `yigindi`?"*, *"What happens if `n = 0`?"*) + concise Uzbek mental-model anchor.
4. **Modify (`Oʻzgartir`)**: Learner edits an existing constraint/operator/condition in code or blocks and runs automated tests.
5. **Make (`Yarat`)**: Open mini-challenge evaluated against hidden + visible unit tests (or Parsons/VM assembly goal).

### 1.2 Mastery & Spaced Repetition (SRS)
- **Skill Mastery Threshold**: A skill (`S001`–`S154`) transitions `available → in_progress → completed → mastered` when:
  - At least **5 attempts** are recorded, AND
  - At least **4 of the last 5 hint-free attempts (`>= 80%`)** are correct, OR the learner passes the unit Checkpoint/Boss challenge covering that skill without hints.
- **Unit Unlocking & Placement**:
  - **Placement Test (`Kirish sinovi`, 12–15 adaptive items)**: Evaluates `U0`, `U2`, `U3`, `U4`, `U5`, `U6`, `U7`, `U8`. Strong performers receive `placed` credit (unlocking ahead up to `U6` without blocking review, while keeping foundational challenges accessible).
  - **Unit Progression**: `U(n+1)` unlocks when `>= 75%` of `U(n)` core skills reach `completed` and the `U(n)` Boss (`U(n)-BOSS`) is passed (or placed out).
- **Daily `Bugun` Queue & `Takrorlash` (`<= 10` items/day)**:
  - Pluggable scheduler interface (`Leitner6Scheduler` default + `FsrsLiteScheduler` toggleable in settings).
  - Wrong answers reset interval cleanly without punitive XP loss; streak tracks **daily active learning days** (`>= 1` completed lesson/review/game level per local calendar day, with optional 1-day freeze token earned every 5-day streak).

### 1.3 Three `Ustaxona` Practice Modes (`needsReview` clarity resolved)
Every unit exposes 3 distinct mechanics inside `#oyinlar` / `/ustaxona`:
1. **`Sinov` (Trace & Predict)**: Step through live `Mirzo-kod` / `Mirzo mashinasi` state and predict output, register values, or complexity before execution.
2. **`Tuzatish` (Debug & Repair)**: Broken program with failing test cases; learner clicks faulty line/token and edits code/instruction to pass all hidden boundary tests.
3. **`Qurish` (Build & Synthesize)**: Parsons blocks (with distractors) or live code editor / assembly editor inside Web Worker sandbox / VM, checked by deterministic test suites.

---

## 2. Legacy ID Compatibility & Migration Mapping

All existing `oyna_organ_workshop_v1` IDs remain valid aliases so zero user progress is lost:
- `L1` → alias for `U0-L1` (`Algoritm: aniq qadamlar tartibi`)
- `L2` → alias for `U4-L2` (`Oʻzgaruvchi: nomli xotira qutisi`)
- `L3` → alias for `U3-L4` (`Shart operatori: ikki yoʻldan biri`)
- `L4` → alias for `U5-L2` (`Sikl: bir xil ishni takrorlash`)
- Legacy tasks `alg-1`, `alg-2` → credit U0 skills `S001`, `S003`
- Legacy task `man-1` → credit U3 skill `S046`
- Legacy task `sik-1` → credit U5 skill `S073`
- Legacy workshops `algoritmlar` / `mantiq` / `sikllar` → mapped cleanly to `U0` / `U3` / `U5` unlock badges while keeping legacy XP thresholds non-blocking.

---

## 3. Unit-by-Unit Plan (`U0`–`U10`, 71 Lessons)

### Unit U0 — Algoritmik fikrlash asoslari (6 lessons · 12 skills `S001`–`S012` · Game `G01`)
- `U0-L1` *(legacy `L1`)*: Aniq qadamlar tartibi va determinizm (kompyuter taxmin qilmaydi)
- `U0-L2`: Muammoni boʻlaklash (Dekompozitsiya — katta vazifani kichik bosqichlarga ajratish)
- `U0-L3`: Qonuniyatlarni topish (Pattern recognition) va takrorlanuvchi qismlar
- `U0-L4`: Abstraksiya — kerakli tafsilotni ajratib olish (model vs haqiqat)
- `U0-L5`: Holatlar va chetki holatlar (Edge cases: boʻsh, nol, manfiy)
- `U0-L6`: Qoʻlda qadam-baqadam tekshirish va xatoni izolyatsiya qilish (Debugging)
- **Checkpoint / Boss (`U0-BOSS`)**: 3-bosqichli konveyer buyruqlarini tuzatish va sinash (`G01`).

### Unit U1 — Maʼlumotlar, ikkilik sanoq va kodlash (6 lessons · 14 skills `S013`–`S026` · Game `G04`)
- `U1-L1`: Bit va bayt — nima uchun kompyuter faqat `0` va `1` ishlatadi
- `U1-L2`: Ikkilik sanoq tizimi (1, 2, 4, 8, 16, 32, 64, 128 ogʻirliklari)
- `U1-L3`: Oʻnlik ↔ Ikkilik ↔ Oʻn oltilik (Hex) oʻtkazish va rang kodlari (`#RRGGBB`)
- `U1-L4`: Matnni kodlash — ASCII va UTF-8 (oʻzbek `oʻ`, `gʻ`, `ʼ` belgilari nega koʻp bayt?)
- `U1-L5`: Tasvir va tovushni raqamlashtirish (Piksel panjarasi, rezolyutsiya, siqish gʻoyasi)
- `U1-L6`: Xatolarni aniqlash — juftlik biti (Parity bit) va nazorat yigʻindisi (Checksum)
- **Boss (`U1-BOSS`)**: Shovqinli ikkilik uzatishda parity xatosini topish va ASCII xabarni tiklash (`G04`).

### Unit U2 — Kompyuter arxitekturasi va Mirzo mashinasi (7 lessons · 15 skills `S027`–`S041` · Game `G05`)
- `U2-L1`: Fon Neyman modeli — xotira (RAM), protsessor (ALU/CU) va kiritish/chiqarish
- `U2-L2`: Fetch–Decode–Execute (Olish–Tahlil–Bajarish) sikli va `PC` (Dastur hisoblagichi)
- `U2-L3`: `Mirzo mashinasi` bilan tanishuv: `INP`, `OUT`, `LDA`, `STA` va `ACC` registri
- `U2-L4`: Arifmetika mashina tilida: `ADD`, `SUB`, `DAT` va manzil vs qiymat farqi
- `U2-L5`: Shartsiz va shartli sakrashlar: `BRA`, `BRZ`, `BRP`
- `U2-L6`: Yorliqlar (Labels) bilan sikl yozish — ikki sonning maksimumi va yigʻindisi
- `U2-L7`: Oʻz-oʻzini tushunish: maʼlumot ham, buyruq ham xotirada son koʻrinishida yashaydi
- **Boss (`U2-BOSS`)**: `Mirzo mashinasi`da koʻpaytirish yoki sonlarni kamayish tartibida chiqarish dasturini yozish (`G05`).

### Unit U3 — Mantiq, shartlar va tarmoqlanish (6 lessons · 14 skills `S042`–`S055` · Games `G02`, `G06`)
- `U3-L1`: Rost (`true`) va yolgʻon (`false`) hamda taqqoslash operatorlari (`==`, `!=`, `<`, `<=`, `>`, `>=`)
- `U3-L2`: Mantiqiy operatorlar: `VA` (`&&`), `YOKI` (`||`), `EMAS` (`!`) va haqiqat jadvallari
- `U3-L3`: Mantiqiy darvozalar (AND, OR, NOT, XOR) — sxema sifatida kod
- `U3-L4` *(legacy `L3`)*: `agar` / `aks holda` (`if / else`) tarmoqlanishi
- `U3-L5`: Zanjirli shartlar (`aks holda agar`) va shartlar tartibi tuzogʻi
- `U3-L6`: Qisqa tutashuv (Short-circuit) va De Morgan qonunlari amalda
- **Boss (`U3-BOSS`)**: Barcha chetki holatlarni qamrab oluvchi kirish nazorati tizimi (`G02`, `G06`).

### Unit U4 — Dasturlash I: oʻzgaruvchilar, ifodalar va kirish/chiqish *(Phase 4 Vertical Slice)* (7 lessons · 15 skills `S056`–`S070` · Games `G02`, `G03`, `G07`)
- `U4-L1`: `Mirzo-kod`da birinchi dastur — izohlar, ketma-ketlik, `chopEt` va `kirit`
- `U4-L2` *(legacy `L2`)*: Oʻzgaruvchi — nomlangan quti va qiymatni qayta tayinlash (`a = a + 1`)
- `U4-L3`: Maʼlumot turlari: butun (`int`), oʻnlik (`float`), matn (`string`), mantiqiy (`bool`) va tur moslashuvi
- `U4-L4`: Arifmetik amallar, qoldiq (`%`), butun boʻlish (`//`) va amallar ustuvorligi
- `U4-L5`: Ikki oʻzgaruvchi qiymatini almashtirish (`swap` va vaqtinchalik quti `temp`)
- `U4-L6`: Matnlar bilan ishlash: birlashtirish, uzunlik, indeks va shablon chiqish
- `U4-L7`: Kiritilgan maʼlumotni tekshirish va xatoni iz bilan tuzatish (PRIMM + Trace table)
- **Boss (`U4-BOSS`)**: Kassa/valyuta yoki vaqt konvertori mini-dasturini `Mirzo-kod`da yozish va barcha testlardan oʻtkazish (`G03`, `G07`).

### Unit U5 — Sikllar, iteratsiya va invariantlar (7 lessons · 14 skills `S071`–`S084` · Game `G08`)
- `U5-L1`: Takrorlash nima uchun kerak — `toki` (`while`) sikli va toʻxtash sharti
- `U5-L2` *(legacy `L4`)*: `uchun` (`for`) sanoq sikli — boshlanish, chegara va qadam (`±1` xatosi)
- `U5-L3`: Akkumulyator va hisoblagich andozalari (yigʻindi, koʻpaytma, sanash, max/min)
- `U5-L4`: Cheksiz sikl tuzoqlari va `toʻxta` (`break`) / `keyingisi` (`continue`)
- `U5-L5`: Sikl invariantlari — har qadamda rost qoladigan qoida
- `U5-L6`: Ichma-ich sikllar (Nested loops) — jadvallar va 2D panjara
- `U5-L7`: Matn va son raqamlarini sikl bilan tahlil qilish (`% 10`, `// 10`)
- **Boss (`U5-BOSS`)**: Tub son tekshiruvi yoki panjarali naqsh generatori (`G08`).

### Unit U6 — Funksiyalar, modullik va koʻlam (6 lessons · 13 skills `S085`–`S097` · Game `G09`)
- `U6-L1`: Funksiya — nomlangan qora quti, parametrlar va argumentlar
- `U6-L2`: `qaytar` (`return`) vs `chopEt` — qiymat qaytarishning kuchi
- `U6-L3`: Lokal va global oʻzgaruvchilar koʻlami (Scope) hamda nomlar toʻqnashuvi
- `U6-L4`: Chaqiruvlar steki (Call stack) — funksiya ichidan funksiya chaqirilganda
- `U6-L5`: Sof funksiyalar (Pure functions), standart parametrlar va kichik birlik testlari
- `U6-L6`: Yordamchi funksiyalar orqali murakkab vazifani yigʻish
- **Boss (`U6-BOSS`)**: Funksiya zanjiri yordamida matn/son tahlilchisi qurish (`G09`).

### Unit U7 — Roʻyxatlar, lugʻatlar va maʼlumotlar tuzilmalari (7 lessons · 16 skills `S098`–`S113` · Games `G10`, `G11`)
- `U7-L1`: Roʻyxatlar (`Array/List`) — `0`-dan boshlanadigan indeks, uzunlik va `IndexOutOfRange`
- `U7-L2`: Roʻyxatni aylantirish, filtrlash, oʻzgartirish va nusxalash (Reference vs Copy)
- `U7-L3`: 2D roʻyxatlar (Matritsa) — qator, ustun va qoʻshnilarni tekshirish
- `U7-L4`: Stek (LIFO) — qavslar muvozanati va "Orqaga" (Undo) tarixi
- `U7-L5`: Navbat (FIFO) — vazifalar navbati va halqa bufer (Ring buffer)
- `U7-L6`: Lugʻat (`Map/Dict`) va xesh-jadval — `kalit → qiymat` O(1) qidiruv
- `U7-L7`: Chastota sanash va ikki koʻrsatkich (Two pointers) boshlangʻich usuli
- **Boss (`U7-BOSS`)**: Qavs tekshirgich + chastota lugʻati mini-loyihasi (`G10`, `G11`).

### Unit U8 — Qidiruv, saralash va algoritm samaradorligi (7 lessons · 15 skills `S114`–`S128` · Game `G12`)
- `U8-L1`: Algoritm tezligini oʻlchash — qadamlar soni va kirish hajmi `N`
- `U8-L2`: Chiziqli qidiruv (`O(N)`) va eng yomon holat tahlili
- `U8-L3`: Ikkilik qidiruv (`Binary Search`, `O(log N)`) va tartiblanganlik sharti
- `U8-L4`: Big-O oilalari: `O(1)`, `O(log N)`, `O(N)`, `O(N log N)`, `O(N²)` ni koʻz bilan solishtirish
- `U8-L5`: Pufakchali va tanlash saralashlari (`Bubble` / `Selection`, `O(N²)`)
- `U8-L6`: Qoʻshish saralashi (`Insertion Sort`) — deyarli tartiblangan roʻyxatlarda tezlik
- `U8-L7`: Birlashtirish saralashi (`Merge Sort`, `O(N log N)`) — boʻlib tashla va hukmronlik qil
- **Boss (`U8-BOSS`)**: Maʼlumot hajmi `N = 100 000` da sekin yechimni `O(log N)` / `O(N)` ga tezlashtirish (`G12`).

### Unit U9 — Rekursiya, daraxtlar va graflar (6 lessons · 14 skills `S129`–`S142` · Game `G13`)
- `U9-L1`: Rekursiya nima — bazaviy holat (Base case) va rekursiv qadam
- `U9-L2`: Rekursiya daraxti va stek toʻlib ketishi (Stack overflow)
- `U9-L3`: Daraxtlar (Trees) — ildiz, barg, kataloglar tuzilmasi va aylanib chiqish
- `U9-L4`: Graflar — tugun, qirra, qoʻshnilik roʻyxati (Adjacency list)
- `U9-L5`: Kenglik boʻyicha qidiruv (`BFS`) — eng qisqa yoʻl topish
- `U9-L6`: Chuqurlik boʻyicha qidiruv (`DFS`) — labirint va bogʻlangan komponentlar
- **Boss (`U9-BOSS`)**: Samarqand–Toshkent transport grafida eng kam almashinuvli yoʻlni topish (`G13`).

### Unit U10 — Veb, tarmoqlar, xavfsizlik va yakuniy loyiha (6 lessons · 12 skills `S143`–`S154` · Game `G14`)
- `U10-L1`: Internet qanday ishlaydi — IP, DNS, paketlar va kechikish (Latency)
- `U10-L2`: HTTP soʻrov va javob (`GET/POST`, status kodlar) hamda JSON maʼlumot almashinuvi
- `U10-L3`: Brauzer DOM modeli — HTML daraxti, hodisalar (Events) va JS sandbox
- `U10-L4`: Kriptografiya asoslari — shifrlash vs xeshlash (`Salt`, `SHA` gʻoyasi)
- `U10-L5`: Keng tarqalgan zaifliklar — kiritma validatsiyasi, XSS va inyeksiya himoyasi
- `U10-L6`: Yakuniy loyiha: **«Aqlli bekat marshrutizatori»** (graf + lugʻat + sikl + JS Web Worker testlari)
- **Boss (`U10-BOSS`)**: Yakuniy keng qamrovli himoya va algoritm sinovi (`G14`).
