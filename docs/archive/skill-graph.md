# Skill Graph Specification — «Oʻyna va oʻrgan» (`S001`–`S154`)

**Total Skills:** **154 skills** across **11 units (`U0`–`U10`)**.  
**Graph Invariant:** Strict Directed Acyclic Graph (DAG). Every `prereq` points strictly to an earlier unit or earlier skill within the same unit.  
**Mastery Formula:** `mastered` iff `hintFreeLast5Correct >= 4 && totalAttempts >= 5` (or verified via unit Boss / Placement pass).

---

## U0 — Algoritmik fikrlash (`S001`–`S012`, 12 skills)
| ID | Skill (UZ) | Lesson(s) | Prereqs | Practice / Game |
|---|---|---|---|---|
| `S001` | Ketma-ketlikni toʻgʻri tartiblash | `U0-L1` | `—` | `Sinov`, `Qurish`, `G01` |
| `S002` | Aniq va noaniq buyruqni ajratish | `U0-L1` | `S001` | `Sinov` |
| `S003` | Tartib buzilishi oqibatini bashorat qilish | `U0-L1`, `U0-L6` | `S001` | `Tuzatish`, `G01` |
| `S004` | Vazifani kichik boʻlaklarga ajratish (dekompozitsiya) | `U0-L2` | `S001` | `Qurish` |
| `S005` | Kichik bosqichlar orasidagi bogʻliqlikni koʻrish | `U0-L2` | `S004` | `Sinov`, `G01` |
| `S006` | Takrorlanuvchi naqshni aniqlash | `U0-L3` | `S002` | `Sinov` |
| `S007` | Umumiy qoidani chiqarish | `U0-L3` | `S006` | `Qurish` |
| `S008` | Muhim va ikkinchi darajali detalni ajratish (abstraksiya) | `U0-L4` | `S004` | `Sinov` |
| `S009` | Chetki holatlarni (0, boʻsh, chegara) topish | `U0-L5` | `S003` | `Tuzatish`, `G01` |
| `S010` | Kirish-chiqish juftligidan test tuzish | `U0-L5` | `S009` | `Qurish` |
| `S011` | Qadam-baqadam qoʻlda izlash (dry run) | `U0-L6` | `S003` | `Sinov`, `G01` |
| `S012` | Mantiqiy xatoni birinchi buzilgan qatorda topish | `U0-L6`, `U0-BOSS` | `S011` | `Tuzatish`, `G01` |

## U1 — Maʼlumotlar va ikkilik sanoq (`S013`–`S026`, 14 skills)
| ID | Skill (UZ) | Lesson(s) | Prereqs | Practice / Game |
|---|---|---|---|---|
| `S013` | Bit va bayt hajmlarini taqqoslash | `U1-L1` | `S008` | `Sinov` |
| `S014` | Ikki holatli signal bilan maʼlumot kodlash | `U1-L1` | `S013` | `G04` |
| `S015` | 2 ning darajalari (`1..128`) qiymatini bilish | `U1-L2` | `S013` | `Sinov`, `G04` |
| `S016` | Ikkilik sonni oʻnlikka oʻgirish | `U1-L2` | `S015` | `Sinov`, `G04` |
| `S017` | Oʻnlik sonni ikkilikka oʻgirish | `U1-L2` | `S015` | `Qurish`, `G04` |
| `S018` | Ikkilik qoʻshish va toshib ketish (overflow) | `U1-L2` | `S016`, `S017` | `Tuzatish`, `G04` |
| `S019` | 4 bit ↔ 1 ta Hex raqam (`0–F`) oʻtkazish | `U1-L3` | `S016` | `Sinov`, `G04` |
| `S020` | RGB hex rang kodini tahlil qilish (`#RRGGBB`) | `U1-L3` | `S019` | `Qurish` |
| `S021` | ASCII belgilar jadvali bilan ishlash | `U1-L4` | `S016` | `Sinov`, `G04` |
| `S022` | UTF-8 koʻp baytli belgilar (`oʻ`, `gʻ`) tushunchasi | `U1-L4` | `S021` | `Sinov` |
| `S023` | Piksel panjarasini bit/rang jadvali sifatida kodlash | `U1-L5` | `S020` | `Qurish`, `G04` |
| `S024` | Oddiy RLE siqish va yoʻqotishsiz saqlash | `U1-L5` | `S006`, `S023` | `Sinov` |
| `S025` | Juftlik biti (even/odd parity) hisoblash | `U1-L6` | `S016` | `Sinov`, `G04` |
| `S026` | 1-bitli uzatish xatosini aniqlash | `U1-L6`, `U1-BOSS` | `S025` | `Tuzatish`, `G04` |

## U2 — Kompyuter arxitekturasi va Mirzo mashinasi (`S027`–`S041`, 15 skills)
| ID | Skill (UZ) | Lesson(s) | Prereqs | Practice / Game |
|---|---|---|---|---|
| `S027` | CPU, RAM va I/O vazifalarini farqlash | `U2-L1` | `S013` | `Sinov` |
| `S028` | Xotira manzili va xotira qiymatini ajratish | `U2-L1` | `S027` | `Sinov`, `G05` |
| `S029` | Fetch–Decode–Execute bosqichlarini kuzatish | `U2-L2` | `S027` | `Sinov` |
| `S030` | `PC` (Dastur hisoblagichi) qanday oshishini bashorat qilish | `U2-L2` | `S028`, `S029` | `Sinov`, `G05` |
| `S031` | `INP` va `OUT` bilan kirish-chiqish oqimi | `U2-L3` | `S029` | `Qurish`, `G05` |
| `S032` | `LDA` va `STA` orqali `ACC` ↔ RAM almashinuvi | `U2-L3` | `S028`, `S031` | `Sinov`, `G05` |
| `S033` | `DAT` yordamida konstanta va oʻzgaruvchi ajratish | `U2-L4` | `S032` | `Qurish`, `G05` |
| `S034` | `ADD` va `SUB` bilan arifmetika bajarish | `U2-L4` | `S032`, `S033` | `Qurish`, `G05` |
| `S035` | Manzil oʻrniga qiymat yozish xatosini tuzatish | `U2-L4` | `S034` | `Tuzatish`, `G05` |
| `S036` | `BRA` shartsiz sakrashni qoʻllash | `U2-L5` | `S030` | `Sinov`, `G05` |
| `S037` | `BRZ` (`ACC == 0`) shartli sakrashi | `U2-L5` | `S034`, `S036` | `Qurish`, `G05` |
| `S038` | `BRP` (`ACC >= 0`) bilan taqqoslash (`a - b`) | `U2-L5` | `S037` | `Qurish`, `G05` |
| `S039` | Yorliqlar (`LOOP`, `DONE`) bilan hisoblagichli sikl | `U2-L6` | `S037`, `S038` | `Qurish`, `G05` |
| `S040` | `HLT` unutilganda cheksiz/xato bajarilishni topish | `U2-L6` | `S036` | `Tuzatish`, `G05` |
| `S041` | Saqlangan dastur gʻoyasi: buyruq = opkod × 100 + manzil | `U2-L7`, `U2-BOSS` | `S039` | `Sinov`, `G05` |

## U3 — Mantiq, shartlar va tarmoqlanish (`S042`–`S055`, 14 skills)
| ID | Skill (UZ) | Lesson(s) | Prereqs | Practice / Game |
|---|---|---|---|---|
| `S042` | `rost` / `yolgʻon` qiymatlarini tanish | `U3-L1` | `S008` | `Sinov`, `G02` |
| `S043` | `==`, `!=`, `<`, `<=`, `>`, `>=` natijasini hisoblash | `U3-L1` | `S042` | `Sinov`, `G02` |
| `S044` | Qatʼiy (`>`) va noqatʼiy (`>=`) chegarani farqlash | `U3-L1` | `S043` | `Tuzatish`, `G06` |
| `S045` | `VA` (`&&`) operatori va haqiqat jadvali | `U3-L2` | `S042` | `Sinov`, `G02` |
| `S046` | `YOKI` (`||`) operatori va haqiqat jadvali | `U3-L2` | `S042` | `Sinov`, `G02` |
| `S047` | `EMAS` (`!`) bilan mantiqiy inkor | `U3-L2` | `S045`, `S046` | `Sinov`, `G02` |
| `S048` | Murakkab mantiqiy ifodada ustuvorlik (`! > && > ||`) | `U3-L2` | `S047` | `Tuzatish`, `G02` |
| `S049` | AND, OR, NOT, XOR darvozalaridan sxema yigʻish | `U3-L3` | `S047` | `G02` |
| `S050` | `agar / aks holda` yoʻlini tanlash | `U3-L4` | `S043` | `Sinov`, `G06` |
| `S051` | Qayta qoʻshilgan bir nechta `agar` vs `aks holda agar` farqi | `U3-L5` | `S050` | `Tuzatish`, `G06` |
| `S052` | Zanjirli shartlar tartibi (eng tor shart birinchi) | `U3-L5` | `S051` | `Tuzatish`, `G06` |
| `S053` | Ichma-ich shartni bitta murakkab shartga soddalashtirish | `U3-L5` | `S048`, `S051` | `Qurish` |
| `S054` | Qisqa tutashuv (Short-circuit) tufayli xatodan qochish | `U3-L6` | `S048` | `Sinov`, `G06` |
| `S055` | De Morgan qonunlari bilan shartni qayta yozish | `U3-L6`, `U3-BOSS` | `S047`, `S054` | `Qurish`, `G02` |

## U4 — Dasturlash I: oʻzgaruvchilar, ifodalar, I/O (`S056`–`S070`, 15 skills)
| ID | Skill (UZ) | Lesson(s) | Prereqs | Practice / Game |
|---|---|---|---|---|
| `S056` | `Mirzo-kod`da ketma-ket `chopEt` dasturini oʻqish | `U4-L1` | `S001`, `S031` | `Sinov` |
| `S057` | `kirit()` orqali foydalanuvchi qiymatini olish | `U4-L1` | `S056` | `Qurish` |
| `S058` | Oʻzgaruvchiga qiymat tayinlash (`=`) vs tenglik (`==`) | `U4-L2` | `S032`, `S043` | `Sinov`, `G03` |
| `S059` | Eski qiymat ustidan yozib yuborishni kuzatish | `U4-L2` | `S058` | `Sinov`, `G03` |
| `S060` | Oʻz-oʻzini yangilash (`x = x + 3`) izini yuritish | `U4-L2` | `S059` | `Sinov`, `G03` |
| `S061` | `int`, `float`, `string`, `bool` turlarini ajratish | `U4-L3` | `S058` | `Sinov`, `G03` |
| `S062` | Matn `"5"` va son `5` qoʻshilishi xatosini tuzatish | `U4-L3` | `S061` | `Tuzatish`, `G07` |
| `S063` | `%` (qoldiq) va `//` (butun boʻlish) amallarini qoʻllash | `U4-L4` | `S061` | `Qurish`, `G03` |
| `S064` | Arifmetik ustuvorlik va qavslar bilan xatoni tuzatish | `U4-L4` | `S063` | `Tuzatish`, `G07` |
| `S065` | `temp` yordamida ikki oʻzgaruvchini almashtirish (`swap`) | `U4-L5` | `S059` | `Qurish`, `G03`, `G07` |
| `S066` | Matn uzunligi va indeksidan foydalanish | `U4-L6` | `S061` | `Sinov`, `G03` |
| `S067` | Matnlarni birlashtirish va formatlangan chiqarish | `U4-L6` | `S066` | `Qurish` |
| `S068` | Bloklarni toʻgʻri tartibda yigʻish (Parsons chalgʻitkichsiz/bilan) | `U4-L7` | `S065` | `Qurish`, `G07` |
| `S069` | Kiritilgan qiymatni shart bilan tekshirish (validatsiya) | `U4-L7` | `S050`, `S062` | `Tuzatish`, `G07` |
| `S070` | Oʻzgaruvchilar jadvali (Trace table) bilan xatoni topish | `U4-L7`, `U4-BOSS` | `S060`, `S068` | `Tuzatish`, `G03` |

## U5 — Sikllar, iteratsiya va invariantlar (`S071`–`S084`, 14 skills)
| ID | Skill (UZ) | Lesson(s) | Prereqs | Practice / Game |
|---|---|---|---|---|
| `S071` | `toki` (`while`) siklida shart tekshirilish vaqtini bilish | `U5-L1` | `S050`, `S060` | `Sinov`, `G08` |
| `S072` | Nomaʼlum takrorlanish soni uchun `toki` tanlash | `U5-L1` | `S071` | `Qurish`, `G08` |
| `S073` | `uchun i = a dan b gacha` takrorlanish sonini hisoblash | `U5-L2` | `S060` | `Sinov`, `G08` |
| `S074` | `±1` (Off-by-one) chegara xatosini tuzatish | `U5-L2` | `S073` | `Tuzatish`, `G08` |
| `S075` | Yigʻuvchi (`yigindi = 0`) va koʻpaytuvchi (`kop = 1`) boshlash | `U5-L3` | `S073` | `Qurish`, `G08` |
| `S076` | Siklda minimum / maksimum va shartli sanash | `U5-L3` | `S050`, `S075` | `Qurish`, `G08` |
| `S077` | Cheksiz sikl sababini topish (oʻzgarmas hisoblagich / shart) | `U5-L4` | `S071` | `Tuzatish`, `G08` |
| `S078` | `toʻxta` (`break`) va `keyingisi` (`continue`) farqi | `U5-L4` | `S077` | `Sinov`, `G08` |
| `S079` | Sikl invariantini (har qadamda saqlanuvchi shart) aniqlash | `U5-L5` | `S075` | `Sinov` |
| `S080` | Invariant yordamida sikldan keyingi holatni isbotlash | `U5-L5` | `S079` | `Sinov`, `G08` |
| `S081` | Ichma-ich sikl umumiy qadamlar sonini hisoblash (`R × C`) | `U5-L6` | `S073` | `Sinov`, `G08` |
| `S082` | 2D naqsh yoki koʻpaytirish jadvalini chiqarish | `U5-L6` | `S081` | `Qurish`, `G08` |
| `S083` | Son raqamlarini `% 10` va `// 10` bilan ajratish | `U5-L7` | `S063`, `S071` | `Qurish`, `G08` |
| `S084` | Sikl bilan matn belgilarini tahlil qilish | `U5-L7`, `U5-BOSS` | `S066`, `S076` | `Qurish`, `G08` |

## U6 — Funksiyalar, modullik va koʻlam (`S085`–`S097`, 13 skills)
| ID | Skill (UZ) | Lesson(s) | Prereqs | Practice / Game |
|---|---|---|---|---|
| `S085` | Takrorlanuvchi kodni funksiyaga chiqarish | `U6-L1` | `S004`, `S073` | `Qurish`, `G09` |
| `S086` | Parametr va haqiqiy argumentni bogʻlash | `U6-L1` | `S085` | `Sinov`, `G09` |
| `S087` | `qaytar` (`return`) va `chopEt` natijasini ajratish | `U6-L2` | `S086` | `Tuzatish`, `G09` |
| `S088` | `qaytar` funksiyani darhol toʻxtatishini bilish | `U6-L2` | `S087` | `Sinov`, `G09` |
| `S089` | Funksiya natijasini ifoda ichida ishlatish (`f(g(x))`) | `U6-L2` | `S087` | `Qurish`, `G09` |
| `S090` | Lokal oʻzgaruvchi koʻlami (Scope) | `U6-L3` | `S086` | `Sinov`, `G09` |
| `S091` | Lokal va global nomlar toʻqnashuvini (Shadowing) tuzatish | `U6-L3` | `S090` | `Tuzatish` |
| `S092` | Chaqiruvlar steki (Call stack) chuqurligini kuzatish | `U6-L4` | `S089`, `S090` | `Sinov`, `G09` |
| `S093` | Har bir chaqiruvning alohida ramka (Stack frame) ochishi | `U6-L4` | `S092` | `Sinov`, `G09` |
| `S094` | Sof funksiya vs yon taʼsir (Side effect) | `U6-L5` | `S087`, `S090` | `Sinov` |
| `S095` | Funksiya uchun chegara testlarini yozish | `U6-L5` | `S010`, `S094` | `Qurish` |
| `S096` | Vazifani 2–3 kichik funksiyaga boʻlib yigʻish | `U6-L6` | `S089`, `S095` | `Qurish`, `G09` |
| `S097` | Funksiyadagi yashirin yon-taʼsir xatosini tuzatish | `U6-L6`, `U6-BOSS` | `S094`, `S096` | `Tuzatish`, `G09` |

## U7 — Roʻyxatlar, lugʻatlar va maʼlumotlar tuzilmalari (`S098`–`S113`, 16 skills)
| ID | Skill (UZ) | Lesson(s) | Prereqs | Practice / Game |
|---|---|---|---|---|
| `S098` | `0`-indeksli roʻyxat elementiga murojaat | `U7-L1` | `S061` | `Sinov`, `G11` |
| `S099` | `IndexOutOfRange` (`len(a)` vs `len(a) - 1`) xatosini tuzatish | `U7-L1` | `S098` | `Tuzatish`, `G11` |
| `S100` | Roʻyxat boʻylab elementlarni yigʻish va filtrlash | `U7-L2` | `S076`, `S098` | `Qurish` |
| `S101` | Havola (Reference) va nusxa (Copy) mutatsiyasi farqi | `U7-L2` | `S090`, `S100` | `Tuzatish` |
| `S102` | 2D matritsa `[qator][ustun]` indeksatsiyasi | `U7-L3` | `S081`, `S098` | `Sinov` |
| `S103` | Panjarada 4 qoʻshni koordinatani xavfsiz tekshirish | `U7-L3` | `S102` | `Qurish` |
| `S104` | Stek (`push`/`pop`/`peek`, LIFO) tartibini bashorat qilish | `U7-L4` | `S098` | `Sinov`, `G10` |
| `S105` | Qavslar muvozanatini stek bilan tekshirish | `U7-L4` | `S104` | `Qurish`, `G10` |
| `S106` | Navbat (`enqueue`/`dequeue`, FIFO) tartibini kuzatish | `U7-L5` | `S098` | `Sinov`, `G10` |
| `S107` | Halqa bufer (Ring buffer) indeks aylanishi (`% N`) | `U7-L5` | `S063`, `S106` | `Qurish`, `G10` |
| `S108` | Lugʻatda `kalit → qiymat` saqlash va oʻqish | `U7-L6` | `S098` | `Sinov`, `G11` |
| `S109` | Mavjud boʻlmagan kalitni xavfsiz tekshirish | `U7-L6` | `S108` | `Tuzatish`, `G11` |
| `S110` | Xesh-funksiya (`% M`) va toʻqnashuv (Collision) tushunchasi | `U7-L6` | `S063`, `S108` | `Sinov`, `G11` |
| `S111` | Chastota lugʻati (Frequency map) qurish | `U7-L7` | `S109` | `Qurish`, `G11` |
| `S112` | Ikki koʻrsatkich (Two pointers) bilan palindrom/juftlik | `U7-L7` | `S099`, `S100` | `Qurish` |
| `S113` | Vazifaga mos tuzilmani tanlash (Roʻyxat vs Stek vs Navbat vs Lugʻat) | `U7-L7`, `U7-BOSS` | `S105`, `S106`, `S111` | `Sinov`, `G10`, `G11` |

## U8 — Qidiruv, saralash va algoritm samaradorligi (`S114`–`S128`, 15 skills)
| ID | Skill (UZ) | Lesson(s) | Prereqs | Practice / Game |
|---|---|---|---|---|
| `S114` | Operatsiyalar sonini `N` ga bogʻlab sanash | `U8-L1` | `S081` | `Sinov`, `G12` |
| `S115` | Chiziqli qidiruvda eng yaxshi/oʻrtacha/yomon holat | `U8-L2` | `S100`, `S114` | `Sinov`, `G12` |
| `S116` | Ikkilik qidiruv uchun tartiblanganlik shartini bilish | `U8-L3` | `S115` | `Sinov`, `G12` |
| `S117` | `mid = (lo + hi) // 2` va chegaralarni yangilash | `U8-L3` | `S116` | `Qurish`, `G12` |
| `S118` | Ikkilik qidiruvda cheksiz sikl (`lo = mid`) xatosini tuzatish | `U8-L3` | `S117` | `Tuzatish`, `G12` |
| `S119` | `O(1)`, `O(log N)`, `O(N)`, `O(N log N)`, `O(N²)` tartiblash | `U8-L4` | `S114`, `S117` | `Sinov`, `G12` |
| `S120` | `N` oshganda vaqt limitidan oshib ketadigan algoritmni aniqlash | `U8-L4` | `S119` | `Sinov`, `G12` |
| `S121` | Pufakchali saralash (Bubble Sort) qadamini bajarish | `U8-L5` | `S065`, `S081` | `Sinov`, `G12` |
| `S122` | Tanlash saralashi (Selection Sort) almashtirishlar soni | `U8-L5` | `S121` | `Sinov`, `G12` |
| `S123` | Qoʻshish saralashi (Insertion Sort) qisman tartibli massivda | `U8-L6` | `S122` | `Qurish`, `G12` |
| `S124` | Ikki tartiblangan roʻyxatni `O(N)` da birlashtirish (`merge`) | `U8-L7` | `S112`, `S123` | `Qurish`, `G12` |
| `S125` | `Merge Sort` boʻlish va birlashtirish bosqichlari | `U8-L7` | `S124` | `Sinov`, `G12` |
| `S126` | Turgʻun (Stable) vs turgʻun boʻlmagan saralash farqi | `U8-L7` | `S122`, `S125` | `Sinov` |
| `S127` | `O(N²)` yechimni lugʻat yoki saralash+qidiruv bilan tezlashtirish | `U8-BOSS` | `S111`, `S117`, `S120` | `Qurish`, `G12` |
| `S128` | Tartiblangan roʻyxatda quyi/yuqori chegarani topish | `U8-BOSS` | `S117`, `S118` | `Qurish`, `G12` |

## U9 — Rekursiya, daraxtlar va graflar (`S129`–`S142`, 14 skills)
| ID | Skill (UZ) | Lesson(s) | Prereqs | Practice / Game |
|---|---|---|---|---|
| `S129` | Rekursiyada bazaviy holatni (Base case) aniqlash | `U9-L1` | `S088`, `S092` | `Sinov`, `G13` |
| `S130` | Oddiy rekursiv funksiya (`faktorial`, `yigindi`) qiymatini topish | `U9-L1` | `S129` | `Sinov`, `G13` |
| `S131` | Bazaviy holat yoʻqligi (Stack overflow) xatosini tuzatish | `U9-L2` | `S093`, `S130` | `Tuzatish` |
| `S132` | Rekursiya daraxti va takroriy hisoblash (memoizatsiya gʻoyasi) | `U9-L2` | `S111`, `S130` | `Sinov`, `G13` |
| `S133` | Daraxt terminlari: ildiz, ota, bola, barg, balandlik | `U9-L3` | `S102` | `Sinov` |
| `S134` | Daraxtni aylanib chiqish (Pre-order / In-order / Level-order) | `U9-L3` | `S130`, `S133` | `Qurish`, `G13` |
| `S135` | Grafni qoʻshnilik roʻyxati koʻrinishida ifodalash | `U9-L4` | `S108`, `S133` | `Qurish`, `G13` |
| `S136` | Yoʻnaltirilgan vs yoʻnaltirilmagan va vaznli graf | `U9-L4` | `S135` | `Sinov`, `G13` |
| `S137` | `BFS` da navbat (`Queue`) va `visited` toʻplami roli | `U9-L5` | `S106`, `S135` | `Sinov`, `G13` |
| `S138` | Vaznsiz grafda `BFS` bilan eng qisqa yoʻlni topish | `U9-L5` | `S137` | `Qurish`, `G13` |
| `S139` | `DFS` (rekursiv yoki stek) bilan yoʻl mavjudligini tekshirish | `U9-L6` | `S104`, `S135` | `Qurish`, `G13` |
| `S140` | Siklli grafda `visited` unutilsa nima boʻlishini tuzatish | `U9-L6` | `S137`, `S139` | `Tuzatish`, `G13` |
| `S141` | Bogʻlangan komponentlar sonini topish | `U9-L6` | `S139`, `S140` | `Qurish`, `G13` |
| `S142` | Marshrut vazifasi uchun `BFS` vs `DFS` tanlash | `U9-BOSS` | `S138`, `S141` | `Sinov`, `G13` |

## U10 — Veb, tarmoqlar, xavfsizlik va yakuniy loyiha (`S143`–`S154`, 12 skills)
| ID | Skill (UZ) | Lesson(s) | Prereqs | Practice / Game |
|---|---|---|---|---|
| `S143` | Paketli uzatish, marshrutizator va kechikish (Latency) | `U10-L1` | `S138` | `Sinov`, `G14` |
| `S144` | DNS (`nom → IP`) va IP manzil vazifasi | `U10-L1` | `S143` | `Sinov`, `G14` |
| `S145` | HTTP `GET/POST` va status kodlar (`200/400/404/500`) | `U10-L2` | `S144` | `Sinov`, `G14` |
| `S146` | JSON formatini oʻqish va lugʻat/roʻyxatga moslash | `U10-L2` | `S108`, `S145` | `Qurish` |
| `S147` | DOM daraxtida element tanlash va hodisa bogʻlash | `U10-L3` | `S133` | `Qurish` |
| `S148` | Sezar / XOR shifrlash va kalitning ahamiyati | `U10-L4` | `S021`, `S049` | `Qurish`, `G14` |
| `S149` | Shifrlash (qaytariluvchi) vs Xeshlash (bir tomonlama) + Salt | `U10-L4` | `S110`, `S148` | `Sinov`, `G14` |
| `S150` | Foydalanuvchi kiritmasini sanitarizatsiya qilish (XSS oldini olish) | `U10-L5` | `S069`, `S147` | `Tuzatish`, `G14` |
| `S151` | Soʻrov parametrlash orqali inyeksiya xavfini yoʻqotish | `U10-L5` | `S150` | `Tuzatish`, `G14` |
| `S152` | Yakuniy loyiha arxitekturasi: graf + lugʻat + testlar | `U10-L6` | `S096`, `S138`, `S146` | `Qurish` |
| `S153` | Yakuniy loyiha testlarida chegara va xatolarni tekshirish | `U10-L6`, `U10-BOSS` | `S009`, `S152` | `Tuzatish` |
| `S154` | Tizim xavfsizligi va samaradorligini birga baholash | `U10-BOSS` | `S127`, `S151`, `S153` | `G14` |
