# Uzbek Style Guide & CS Glossary — «Oʻyna va oʻrgan»

## 1. Audience & Voice (Ages 15–35)
- **Persona**: `Mirzo` is a sharp, respectful workshop partner-mentor — never patronizing ("bolajon", baby talk), never dry textbook bureaucratic language.
- **Address Form**: Use warm, direct second-person singular **`sen` / `sening` / `qil`** across interactive lessons, hints, and `Mirzo` dialogue for an active coaching feel (matching existing `TEACHER_REVIEW.md` and `WORKSHOP_STRINGS`), and keep explanations crisp: **1–2 short sentences per idea**, concrete code/state first, jargon only after intuition.
- **Error Philosophy**: Never blame the user (`"Xato qilding!"` is forbidden). Always describe what the machine did and what clue helps fix it: e.g., `"11 > 11 sharti yolgʻon chiqdi, shuning uchun kod aks holda boʻlimiga oʻtdi."`

---

## 2. Strict Uzbek Latin Orthography Rules
1. **Oʻ and Gʻ (`U+02BB` MODIFIER LETTER TURNED COMMA — `ʻ`)**:
   - Always use `oʻ` and `gʻ` (`Oʻyna`, `oʻrgan`, `toʻgʻri`, `oʻzgaruvchi`, `yolgʻon`).
2. **Tutuq belgisi (`U+02BC` MODIFIER LETTER APOSTROPHE — `ʼ`)**:
   - Always use `ʼ` (`maʼlumot`, `qatʼiy`, `eʼlon`, `aʼlo`, `taʼsir`, `nomaʼlum`).
3. **Forbidden in authored UI & content**:
   - Never use straight ASCII `'`, backtick `` ` ``, or curly quotes `‘`/`’` as Uzbek apostrophes inside authored lesson/UI copy.
   - Always run `normalizeUzbekInput()` only on free-text learner input so learners typing with any keyboard layout (`o'`, `o‘`, `o’`, `oʻ`) are graded fairly.
4. **No placeholders / mixed Russian leak**:
   - Zero untranslated Russian or English strings in Uzbek UI (`uz`), except standard code keywords when showing JS/Python mode.

---

## 3. Standardized CS Uzbek Glossary (52 Core Terms)

| Uzbek (Canonical) | EN | RU | Definition (1-line learner note) |
|---|---|---|---|
| `algoritm` | algorithm | алгоритм | Vazifani yechish uchun aniq tartibdagi qadamlar |
| `oʻzgaruvchi` | variable | переменная | Qiymat saqlanadigan nomlangan xotira qutisi |
| `qiymat` | value | значение | Oʻzgaruvchi yoki ifodaning aniq mazmuni |
| `tur` / `maʼlumot turi` | data type | тип данных | Qiymatning xilini belgilaydi (`int`, `string`, `bool`) |
| `ifoda` | expression | выражение | Hisoblanib bitta qiymat beradigan kod qismi |
| `shart` | condition | условие | `rost` yoki `yolgʻon` natija beradigan tekshiruv |
| `tarmoqlanish` | branching | ветвление | Shartga qarab kodning ikki yoʻldan biriga oʻtishi |
| `mantiqiy darvoza` | logic gate | логический вентиль | `0/1` kirishlardan mantiqiy chiqish beruvchi tugun |
| `haqiqat jadvali` | truth table | таблица истинности | Barcha kirish kombinatsiyalari natijasi jadvali |
| `sikl` | loop | цикл | Bir xil harakatni shart yoki sanoq boʻyicha takrorlash |
| `iteratsiya` | iteration | итерация | Siklning bitta toʻliq aylanish qadami |
| `invariant` | invariant | инвариант | Siklning har qadamida rost boʻlib qoladigan xossa |
| `cheksiz sikl` | infinite loop | бесконечный цикл | Toʻxtash sharti hech qachon bajarilmaydigan sikl |
| `funksiya` | function | функция | Qayta ishlatiladigan nomlangan kod bloki |
| `parametr` | parameter | параметр | Funksiya taʼrifidagi kirish nomi |
| `argument` | argument | аргумент | Funksiyani chaqirganda uzatiladigan aniq qiymat |
| `qaytarish` (`qaytar`) | return | возврат | Funksiyadan natija chiqarib, uni toʻxtatish |
| `koʻlam` | scope | область видимости | Oʻzgaruvchining koʻrinadigan va yashaydigan hududi |
| `chaqiruvlar steki` | call stack | стек вызовов | Faol funksiya chaqiruvlari navbat-qatlami |
| `sof funksiya` | pure function | чистая функция | Tashqi holatni oʻzgartirmaydigan, bir kirishga bir chiqish beruvchi funksiya |
| `roʻyxat` | list / array | список / массив | Tartiblangan va indekslangan elementlar toʻplami |
| `indeks` | index | индекс | Roʻyxatdagi element oʻrni (`0`-dan boshlanadi) |
| `lugʻat` | dictionary / map | словарь / map | `kalit → qiymat` juftliklarini saqlovchi tuzilma |
| `xesh-jadval` | hash table | хеш-таблица | Kalitni manzilga aylantirib tezkor qidiruvchi jadval |
| `toʻqnashuv` | collision | коллизия | Ikki kalit bir xil xesh uyasiga tushib qolishi |
| `stek` | stack (LIFO) | стек | Oxirgi kirgan birinchi chiqadigan tuzilma |
| `navbat` | queue (FIFO) | очередь | Birinchi kirgan birinchi chiqadigan tuzilma |
| `halqa bufer` | ring buffer | кольцевой буфер | Chegarada boshiga aylanib oʻtuvchi doimiy sigʻimli navbat |
| `ikki koʻrsatkich` | two pointers | два указателя | Roʻyxat boʻylab bir vaqtda yuruvchi ikkita indeks |
| `qidiruv` | search | поиск | Toʻplam ichidan kerakli elementni topish |
| `ikkilik qidiruv` | binary search | бинарный поиск | Tartiblangan roʻyxatni har qadamda ikkiga boʻlib qidirish |
| `saralash` | sorting | сортировка | Elementlarni tartibga keltirish |
| `samaradorlik` / `murakkablik` | complexity (`Big-O`) | сложность (`Big-O`) | Kirish hajmi `N` oshganda qadamlar oʻsish tezligi |
| `rekursiya` | recursion | рекурсия | Funksiyaning kichikroq kirish bilan oʻzini chaqirishi |
| `bazaviy holat` | base case | базовый случай | Rekursiyani toʻxtatuvchi eng oddiy holat |
| `daraxt` | tree | дерево | Ildiz va shoxlardan iborat siklsiz iyerarxik tuzilma |
| `graf` | graph | граф | Tugunlar va ularni bogʻlovchi qirralar tizimi |
| `tugun` | node / vertex | узел / вершина | Graf yoki daraxtdagi alohida nuqta |
| `qirra` | edge | ребро | Ikkita tugunni bogʻlovchi aloqa |
| `BFS` (`kenglik boʻyicha`) | breadth-first search | поиск в ширину | Qavatma-qavat eng yaqin tugunlarni koʻrib chiqish |
| `DFS` (`chuqurlik boʻyicha`) | depth-first search | поиск в глубину | Oxirigacha kirib, soʻng ortga qaytuvchi qidiruv |
| `bit` | bit | бит | Eng kichik axborot birligi (`0` yoki `1`) |
| `bayt` | byte | байт | 8 ta bitdan iborat guruh |
| `juftlik biti` | parity bit | бит чётности | Uzatishdagi 1-bitli xatoni sezuvchi nazorat biti |
| `registr` | register | регистр | Protsessor ichidagi oʻta tezkor kichik xotira |
| `akkumulyator` (`ACC`) | accumulator | аккумулятор | Hisob natijalarini vaqtincha saqlovchi asosiy registr |
| `dastur hisoblagichi` (`PC`) | program counter | счётчик команд | Keyingi bajariladigan buyruq manzilini saqlovchi registr |
| `xatoni tuzatish` (`debug`) | debugging | отладка | Koddagi xatoni izlab topish va bartaraf etish |
| `toʻxtash nuqtasi` | breakpoint | точка останова | Dasturni tekshirish uchun atayin toʻxtatiladigan qator |
| `shifrlash` | encryption | шифрование | Maʼlumotni kalit yordamida yashirish (qaytariluvchi) |
| `xeshlash` | hashing | хеширование | Maʼlumotdan bir tomonlama qisqa iz olish |
| `validatsiya` | validation | валидация | Kiruvchi maʼlumotni xavfsizlik va shartga tekshirish |
