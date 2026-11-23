/**
 * Internationalization, canonical terminology, Uzbek orthography normalization, and dual-script helpers.
 * Default script: uz-Latn (U+02BB for oʻ/gʻ, U+02BC for tutuq belgisi ʼ).
 * Learner register: warm "sen". Teacher/Parent report register: respectful "siz".
 */

export type LocaleScript = 'uz-Latn' | 'uz-Cyrl';

export interface LocalizedText {
  latn: string;
  cyrl: string;
}

export function lt(latn: string, cyrl: string): LocalizedText {
  return { latn, cyrl };
}

export function pickText(text: LocalizedText, script: LocaleScript): string {
  return script === 'uz-Cyrl' ? text.cyrl : text.latn;
}

/**
 * Normalizes all apostrophe/modifier variants (' ʻ ʼ ’ ` ´) and casing
 * so user-entered search or answers work regardless of keyboard layout.
 */
export function normalizeUzbekInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\u0027\u02BB\u02BC\u2018\u2019\u0060\u00B4]/g, "'")
    .replace(/\s+/g, ' ');
}

/**
 * Uzbek grammar helper: after numerals, nouns remain singular (e.g. "5 ta topshiriq").
 */
export function formatUzbekCount(
  count: number,
  noun: LocalizedText,
  script: LocaleScript = 'uz-Latn'
): string {
  return `${count} ta ${pickText(noun, script)}`;
}

/** Canonical term list: one term per concept everywhere */
export const CANONICAL_TERMS = {
  algorithm: lt('Algoritm', 'Алгоритм'),
  variable: lt('Oʻzgaruvchi', 'Ўзгарувчи'),
  condition: lt('Shart operatori', 'Шарт оператори'),
  loop: lt('Sikl', 'Цикл'),
  debugging: lt('Xato tuzatish', 'Хато тузатиш'),
  printCmd: 'chopEt(...)',
} as const;

export interface GlossaryItem {
  id: string;
  term: LocalizedText;
  definition: LocalizedText;
  example: string;
  pythonExample: string;
  commonMixup: LocalizedText;
  traceId?: string;
}

export const LUGAT_TERMS: GlossaryItem[] = [
  {
    id: 'algoritm',
    term: CANONICAL_TERMS.algorithm,
    definition: lt(
      'Aniq maqsadga yetish uchun qatʼiy tartibda bajariladigan qadamlar roʻyxati.',
      'Аниқ мақсадга етиш учун қатъий тартибда бажариладиган қадамлар рўйхати.'
    ),
    example: '1. Suv quy → 2. Qaynat → 3. Choy sol',
    pythonExample: 'suv_quy()\nqaynat()\nchoy_sol()',
    commonMixup: lt(
      'Kompyuter qadamlar tartibini oʻzi taxmin qilib toʻgʻrilamaydi.',
      'Компьютер қадамлар тартибини ўзи тахмин қилиб тўғриламайди.'
    ),
  },
  {
    id: 'ozgaruvchi',
    term: CANONICAL_TERMS.variable,
    definition: lt(
      'Bitta qiymatni saqlaydigan nomli xotira qutisi.',
      'Битта қийматни сақлайдиган номли хотира қутиси.'
    ),
    example: 'x = 5\nx = 8\nchopEt(x)',
    pythonExample: 'x = 5\nx = 8\nprint(x)',
    commonMixup: lt(
      'Yangi qiymat eskisiga qoʻshilmaydi — eski qiymat oʻrniga yoziladi.',
      'Янги қиймат эскисига қўшилмайди — эски қиймат ўрнига ёзилади.'
    ),
    traceId: 'trace-var-overwrite',
  },
  {
    id: 'shart',
    term: CANONICAL_TERMS.condition,
    definition: lt(
      'Shart rost yoki yolgʻonligiga qarab ikki yoʻldan faqat bittasini tanlaydi.',
      'Шарт рост ёки ёлғонлигига қараб икки йўлдан фақат биттасини танлайди.'
    ),
    example: 'agar (yosh >= 12) {\n  chopEt("Kir")\n} aks holda {\n  chopEt("Kut")\n}',
    pythonExample: 'if yosh >= 12:\n    print("Kir")\nelse:\n    print("Kut")',
    commonMixup: lt(
      '> va >= chegarada farq qiladi: 12 > 12 yolgʻon, 12 >= 12 esa rost.',
      '> ва >= чегарада фарқ қилади: 12 > 12 ёлғон, 12 >= 12 эса рост.'
    ),
    traceId: 'trace-if-boundary',
  },
  {
    id: 'sikl',
    term: CANONICAL_TERMS.loop,
    definition: lt(
      'Bir xil harakatni shart rost boʻlguncha yoki aniq marta takrorlaydi.',
      'Бир хил ҳаракатни шарт рост бўлгунча ёки аниқ марта такрорлайди.'
    ),
    example: 'uchun i = 1 dan 4 gacha {\n  yigindi = yigindi + i\n}',
    pythonExample: 'for i in range(1, 5):\n    yigindi = yigindi + i',
    commonMixup: lt(
      'Chegara belgisi (< yoki <=) bitta ortiq yoki kam aylanishga olib kelishi mumkin.',
      'Чегара белгиси (< ёки <=) битта ортиқ ёки кам айланишга олиб келиши мумкин.'
    ),
    traceId: 'trace-loop-sum',
  },
  {
    id: 'xato',
    term: CANONICAL_TERMS.debugging,
    definition: lt(
      'Koddagi xatoni Koʻr → Taxmin qil → Tekshir → Tuzat usuli bilan topish.',
      'Коддаги хатони Кўр → Тахмин қил → Текшир → Тузат усули билан топиш.'
    ),
    example: 'i < 5 oʻrniga i <= 5 yozish',
    pythonExample: 'for i in range(1, 6):  # 5 ham kiradi',
    commonMixup: lt(
      'Kompyuter adashmaydi — u faqat yozilgan koʻrsatmani aniq bajaradi.',
      'Компьютер адашмайди — у фақат ёзилган кўрсатмани аниқ бажаради.'
    ),
    traceId: 'trace-loop-infinite',
  },
];

export interface UiDictionary {
  brandTitle: string;
  navLessons: string;
  navMap: string;
  navGames: string;
  navPrinciples: string;
  navRewards: string;
  navStartBtn: string;
  preloaderTitle: string;
  preloaderSubtitle: string;
  preloaderSkip: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCta: string;
  heroContinueCta: string;
  heroDiagnosticCta: string;
  heroFirstWinNote: string;
  lessonsTitle: string;
  lessonsSubtitle: string;
  mapTitle: string;
  mapSubtitle: string;
  gamesTitle: string;
  gamesSubtitle: string;
  dailyReviewTitle: string;
  principlesTitle: string;
  principlesSubtitle: string;
  rewardsTitle: string;
  rewardsSubtitle: string;
  settingsTitle: string;
  resetProgressBtn: string;
  parentPanelBtn: string;
  cheatSheetBtn: string;
  realCodeLabel: string;
  soundOn: string;
  soundOff: string;
  subtitlesOn: string;
  subtitlesOff: string;
  reducedMotionLabel: string;
  dyslexiaLabel: string;
  qualityLabel: string;
  scriptLabel: string;
  footerNote: string;
}

export const UI_STRINGS: Record<LocaleScript, UiDictionary> = {
  'uz-Latn': {
    brandTitle: 'Oʻyna va oʻrgan',
    navLessons: 'Darslar',
    navMap: 'Xarita',
    navGames: 'Oʻyinlar',
    navPrinciples: 'Tamoyillar',
    navRewards: 'Yutuqlar',
    navStartBtn: 'Boshlash',
    preloaderTitle: 'Kod — bu sehr emas, bu mantiq',
    preloaderSubtitle: 'Mirzo mashinasi bilan kod qanday ishlashini oʻrganamiz',
    preloaderSkip: 'Oʻtkazib yuborish',
    heroEyebrow: '12 yoshli oʻquvchilar uchun · 5–6-sinf informatika asoslari',
    heroTitle: 'Avval tushun, keyin oʻyna va kodni oʻzing boshqar',
    heroSubtitle:
      'Qisqa darslarda Mirzo mashinasi qadam-baqadam qanday ishlashini koʻr. Keyin uchta ustaxonada bilimingni sinab, xatolarni oʻzing tuzat.',
    heroPrimaryCta: '1-darsdan boshlash',
    heroContinueCta: 'Dars va oʻyinni davom ettirish',
    heroDiagnosticCta: 'Qisqa sinov (3 savol)',
    heroFirstWinNote: 'Roʻyxatdan oʻtishsiz · Brauzerda saqlanadi · Internet talab qilmaydi',
    lessonsTitle: 'Qisqa darslar: oʻyinga kirishdan oldin tushunib ol',
    lessonsSubtitle:
      'Har bir dars 3–5 daqiqa davom etadi. Avval taxmin qil, keyin Mirzo bilan kuzat va oxirida oʻzing tushuntir.',
    mapTitle: 'Samarqanddan Toshkentgacha: Bilim Xaritasi',
    mapSubtitle:
      'Har bir koʻnikma uch bosqichda oʻlchanadi: Koʻrildi → Qoʻllay olaman → Tushuntira olaman.',
    gamesTitle: 'Uchta ustaxona — uchta mashq maydoni',
    gamesSubtitle:
      'Har bir oʻyinda 10 tadan topshiriq bor. Xato qilsang, Mirzo sababini koʻrsatadi va oʻxshash misolda tuzatish imkonini beradi.',
    dailyReviewTitle: 'Kunlik takror (5 ta aralash savol)',
    principlesTitle: 'Nima uchun bu usul ishlaydi?',
    principlesSubtitle:
      'Har bir dars va mashq tushunish, xotirada saqlash va yangi vaziyatda qoʻllashga qaratilgan.',
    rewardsTitle: 'Yutuqlar va mukofotlar',
    rewardsSubtitle:
      'Nishonlar va XP nafaqat birinchi urinish uchun, balki xatoni tuzatish va tushuntirib berish uchun ham beriladi.',
    settingsTitle: 'Qulaylik va moslashtirish',
    resetProgressBtn: 'Progressni boshidan boshlash',
    parentPanelBtn: 'Ustoz va ota-ona hisoboti',
    cheatSheetBtn: 'Psevdokod eslatmasi',
    realCodeLabel: 'Haqiqiy kod (Python)',
    soundOn: 'Ovoz yoqilgan',
    soundOff: 'Ovoz oʻchirilgan',
    subtitlesOn: 'Subtitrlar yoqilgan',
    subtitlesOff: 'Subtitrlar oʻchirilgan',
    reducedMotionLabel: 'Kamroq harakat (Animatsiyani soddalashtirish)',
    dyslexiaLabel: 'Oʻqish uchun keng oraliq (Disleksiya rejimi)',
    qualityLabel: 'Grafika sifati',
    scriptLabel: 'Interfeys va kontent yozuvi',
    footerNote:
      'Oʻyna va oʻrgan · 12 yoshli oʻquvchilar uchun ochiq taʼlim loyihasi · Shaxsiy maʼlumotlar yigʻilmaydi.',
  },
  'uz-Cyrl': {
    brandTitle: 'Ўйна ва ўрган',
    navLessons: 'Дарслар',
    navMap: 'Харита',
    navGames: 'Ўйинлар',
    navPrinciples: 'Тамойиллар',
    navRewards: 'Ютуқлар',
    navStartBtn: 'Бошлаш',
    preloaderTitle: 'Код — бу сеҳр эмас, бу мантиқ',
    preloaderSubtitle: 'Мирзо машинаси билан код қандай ишлашини ўрганамиз',
    preloaderSkip: 'Ўтказиб юбориш',
    heroEyebrow: '12 ёшли ўқувчилар учун · 5–6-синф информатика асослари',
    heroTitle: 'Аввал тушун, кейин ўйна ва кодни ўзинг бошқар',
    heroSubtitle:
      'Қисқа дарсларда Мирзо машинаси қадам-бақадам қандай ишлашини кўр. Кейин учта устахонада билимингни синаб, хатоларни ўзинг тузат.',
    heroPrimaryCta: '1-дарсдан бошлаш',
    heroContinueCta: 'Дарс ва ўйинни давом эттириш',
    heroDiagnosticCta: 'Қисқа синов (3 савол)',
    heroFirstWinNote: 'Рўйхатдан ўтишсиз · Браузерда сақланади · Интернет талаб қилмайди',
    lessonsTitle: 'Қисқа дарслар: ўйинга киришдан олдин тушуниб ол',
    lessonsSubtitle:
      'Ҳар бир дарс 3–5 дақиқа давом этади. Аввал тахмин қил, кейин Мирзо билан кузат ва охирида ўзинг тушунтир.',
    mapTitle: 'Самарқанддан Тошкентгача: Билим Харитаси',
    mapSubtitle:
      'Ҳар бир кўникма уч босқичда ўлчанади: Кўрилди → Қўллай оламан → Тушунтира оламан.',
    gamesTitle: 'Учта устахона — учта машқ майдони',
    gamesSubtitle:
      'Ҳар бир ўйинда 10 тадан топшириқ бор. Хато қилсанг, Мирзо сабабини кўрсатади ва ўхшаш мисолда тузатиш имконини беради.',
    dailyReviewTitle: 'Кунлик такрор (5 та аралаш савол)',
    principlesTitle: 'Нима учун бу усул ишлайди?',
    principlesSubtitle:
      'Ҳар бир дарс ва машқ тушуниш, хотирада сақлаш ва янги вазиятда қўллашга қаратилган.',
    rewardsTitle: 'Ютуқлар ва мукофотлар',
    rewardsSubtitle:
      'Нишонлар ва XP нафақат биринчи уриниш учун, балки хатони тузатиш ва тушунтириб бериш учун ҳам берилади.',
    settingsTitle: 'Қулайлик ва мослаштириш',
    resetProgressBtn: 'Прогрессни бошидан бошлаш',
    parentPanelBtn: 'Устоз ва ота-она ҳисоботи',
    cheatSheetBtn: 'Псевдокод эслатмаси',
    realCodeLabel: 'Ҳақиқий код (Python)',
    soundOn: 'Овоз ёқилган',
    soundOff: 'Овоз ўчирилган',
    subtitlesOn: 'Субтитрлар ёқилган',
    subtitlesOff: 'Субтитрлар ўчирилган',
    reducedMotionLabel: 'Камроқ ҳаракат (Анимацияни соддалаштириш)',
    dyslexiaLabel: 'Ўқиш учун кенг оралиқ (Дислексия режими)',
    qualityLabel: 'Графика сифати',
    scriptLabel: 'Интерфейс ва контент ёзуви',
    footerNote:
      'Ўйна ва ўрган · 12 ёшли ўқувчилар учун очиқ таълим лойиҳаси · Шахсий маълумотлар йиғилмайди.',
  },
};
