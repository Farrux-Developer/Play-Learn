/**
 * Server-rendered lesson content ("Tushunish varagʻi") for W5 Algoritm vertical slice.
 * Every copy string uses strict Uzbek Latin (ʻ U+02BB, ʼ U+02BC) and carries reviewStatus.
 */

import type { LessonMeta } from './schemas';

export interface LessonSectionBlock {
  heading: string;
  paragraphs: string[];
  codeSnippet?: string;
}

export interface LessonSelfCheck {
  question: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
}

export interface LessonDocument extends LessonMeta {
  readingMinutes: number;
  heroSummary: string;
  keyTermSlugs: string[];
  sections: LessonSectionBlock[];
  commonMistakes: { wrongIdea: string; truth: string }[];
  selfCheck: LessonSelfCheck;
  nextLessonSlug: string | null;
  playLevelId: string;
  demoProgram: {
    title: string;
    inputs: number[];
    instructions: {
      label: string;
      vars: Record<string, number>;
      outputs: number[];
      note: string;
    }[];
  };
}

export const LESSONS_W5: readonly LessonDocument[] = [
  {
    slug: 'algoritm-ketma-ketlik',
    track: 'algoritm',
    concept: 'ketma-ketlik-va-ozgaruvchi',
    title: 'Algoritm, ketma-ketlik va oʻzgaruvchi quti',
    description:
      'Buyruqlar tartibi nima uchun muhimligini va oʻzgaruvchi qutisi xotirada qanday ishlashini Mirzo mashinasida oʻrganing.',
    prerequisites: [],
    glossaryTerms: ['algoritm', 'dastur', 'ozgaruvchi', 'xotira', 'takt'],
    curriculumRef: null,
    reviewStatus: 'draft',
    updatedAt: '2026-11-27',
    readingMinutes: 4,
    heroSummary:
      'Kompyuter aqlli taxminchi emas: u siz yozgan buyruqlarni birinchi qatordan oxirigacha roppa-rosa tartib bilan bajaradi.',
    keyTermSlugs: ['algoritm', 'dastur', 'ozgaruvchi', 'takt'],
    sections: [
      {
        heading: '1. Algoritm — bu aniq qadamlar tartibi',
        paragraphs: [
          'Har kuni bajaradigan oddiy ishingiz ham kichik algoritmga oʻxshaydi. Masalan, choy damlashda avval choynakka quruq choy solinadi, keyin qaynoq suv quyiladi va biroz dam yeyishini kutamiz.',
          'Agar suvdan oldin piyolaga quyishga urinsangiz, choy tayyor boʻlmaydi. Dasturlashda ham xuddi shunday: har bir buyruq oʻz oʻrnida turishi kerak.',
          'Kompyuter tushunadigan aniq yozilgan qadamlar roʻyxati dastur deyiladi. Mirzo mashinasi har bir taktda faqat bitta buyruqni bajaradi.',
        ],
        codeSnippet:
          'SET non = kirish\nMUL non = non * 2\nOUT non\nHLT',
      },
      {
        heading: '2. Oʻzgaruvchi — nomlangan xotira qutisi',
        paragraphs: [
          'Kompyuter sonlarni eslab qolish uchun xotira ichida kichik qutichalar ochadi. Har bir qutiga tushunarli nom beramiz: masalan, ball, narx yoki yigindi.',
          'Koʻp oʻquvchilar SET ball = ball + 3 yozuvini matematik tenglama deb oʻylaydi. Aslida tenglik belgisi bu yerda «saqlash» buyrugʻidir.',
          'Mashina avval oʻng tomondagi ball + 3 qiymatini hisoblaydi. Keyin chiqqan yangi sonni chap tomondagi ball qutisining ichiga joylaydi; eski son esa oʻchadi.',
        ],
        codeSnippet:
          'SET ball = 5\nADD ball = ball + 3\nOUT ball   # ekranga 8 chiqadi',
      },
      {
        heading: '3. Ikki qutini almashtirish siri',
        paragraphs: [
          'Tasavvur qiling, birinchi stakanda choy, ikkinchisida sharbat bor. Ularni toʻkib yubormasdan oʻrnini almashtirish uchun uchinchi boʻsh stakan kerak boʻladi.',
          'Dasturlashda ham xuddi shunday: x va y qutilaridagi sonlarni almashtirish uchun temp nomli vaqtinchalik quti ochamiz. Avval x ni temp ga koʻchirib saqlaymiz.',
          'Shundan soʻng x ga y ni yozamiz va nihoyat y ga temp dagi asl qiymatni qoʻyamiz. Shu tariqa hech bir maʼlumot yoʻqolmaydi.',
        ],
      },
    ],
    commonMistakes: [
      {
        wrongIdea: 'Qutini SET bilan toʻldirmasdan turib uni ADD yoki OUT da ishlatish.',
        truth: 'Avval kirish sonini SET bilan qutiga saqlang, aks holda mashina boʻsh quti xatosini beradi.',
      },
      {
        wrongIdea: 'Hisoblashdan oldin OUT buyrugʻini qoʻyish.',
        truth: 'OUT oʻsha lahzada qutida turgan qiymatni chiqaradi, shuning uchun u hisobdan keyin keladi.',
      },
    ],
    selfCheck: {
      question: 'Boshida a = 6 boʻlsa, SET a = 10; OUT a dan keyin ekranga nima chiqadi?',
      options: ['6', '10', '16'],
      correctIndex: 1,
      explanation: 'Yangi qiymat yozilganda qutidagi eski 6 oʻchib, oʻrniga 10 joylashadi.',
    },
    nextLessonSlug: 'shart-va-sikl',
    playLevelId: 'w5-01-seq-order',
    demoProgram: {
      title: 'Jonli namuna: 5 ga 3 qoʻshish',
      inputs: [5, 3],
      instructions: [
        {
          label: 'SET a = kirish (5)',
          vars: { a: 5 },
          outputs: [],
          note: 'Birinchi savat soni a qutisiga tushdi.',
        },
        {
          label: 'SET b = kirish (3)',
          vars: { a: 5, b: 3 },
          outputs: [],
          note: 'Ikkinchi son b qutisida saqlandi.',
        },
        {
          label: 'ADD yigindi = a + b',
          vars: { a: 5, b: 3, yigindi: 8 },
          outputs: [],
          note: 'a va b oʻzgarishsiz qoldi, yigindi qutisiga 8 yozildi.',
        },
        {
          label: 'OUT yigindi · HLT',
          vars: { a: 5, b: 3, yigindi: 8 },
          outputs: [8],
          note: 'Natija 8 chiqarildi va mashina toʻxtadi.',
        },
      ],
    },
  },
  {
    slug: 'shart-va-sikl',
    track: 'algoritm',
    concept: 'shart-va-sikl',
    title: 'Shart, tarmoqlanish, sikl va xatoni topish',
    description:
      'JUMP_IF yordamida qaror qabul qilish, cheksiz siklga tushmaslik va roʻyxat indekslarini toʻgʻri ishlatishni oʻrganing.',
    prerequisites: ['algoritm-ketma-ketlik'],
    glossaryTerms: ['shart', 'sikl', 'xato', 'takt'],
    curriculumRef: null,
    reviewStatus: 'draft',
    updatedAt: '2026-11-27',
    readingMinutes: 5,
    heroSummary:
      'Haqiqiy dasturlar bir xil chiziqda yurmaydi: ular shartga qarab yoʻl tanlaydi va kerakli amalni siklda qaytaradi.',
    keyTermSlugs: ['shart', 'sikl', 'xato', 'takt'],
    sections: [
      {
        heading: '1. Shart — ikki yoʻl orasidan tanlash',
        paragraphs: [
          'Hayotda har doim tekshiruv qilamiz: agar yomgʻir yogʻsa soyabon olamiz, aks holda olmasdan chiqamiz. Kompyuterda bu shart deyiladi.',
          'Mirzo mashinasida JUMP_IF buyrugʻi ikkita qiymatni solishtiradi (masalan, ball >= 10). Agar tekshiruv rost boʻlsa, mashina koʻrsatilgan LABEL yorligʻiga sakraydi.',
          'Har bir tarmoq oxiriga HLT qoʻyish juda muhim. Aks holda birinchi tarmoq tugagach, mashina beixtiyor ikkinchi tarmoq buyruqlarini ham bajarib yuboradi.',
        ],
        codeSnippet:
          'JUMP_IF ball >= 10 -> ok\nOUT 0\nHLT\nLABEL ok\nOUT 1\nHLT',
      },
      {
        heading: '2. Sikl va cheksiz aylanishdan himoya',
        paragraphs: [
          'Bir dan oʻngacha sonlarni qoʻshish uchun oʻn marta bir xil ADD yozish shart emas. Buning oʻrniga bitta sikl tuzamiz.',
          'Har bir xavfsiz siklda uchta qism boʻladi: boshlangʻich qiymat, chiqish sharti (masalan, n <= 0) va har qadamda oʻzgarish (SUB n = n - 1).',
          'Agar hisoblagichni kamaytirishni unutsangiz, chiqish sharti hech qachon rost boʻlmaydi va mashina cheksiz aylana boshlaydi. Mirzo mashinasi bunday holatda sizni takt chegarasida muloyimlik bilan toʻxtatadi.',
        ],
      },
      {
        heading: '3. Roʻyxat va 0 dan boshlanuvchi indeks',
        paragraphs: [
          'Koʻp sonlarni bitta nom ostida saqlash uchun roʻyxat (LIST_SET) ishlatiladi. Masalan, narxlar = [10, 20, 15].',
          'Dasturlashda sanash 1 dan emas, 0 dan boshlanadi. Demak, 10 — bu 0-indeks, 20 — 1-indeks, yangi qoʻshilgan 15 esa 2-indeksda turadi.',
        ],
      },
    ],
    commonMistakes: [
      {
        wrongIdea: 'Chegara shartida >= oʻrniga > yozib, teng qiymatni tashlab ketish.',
        truth: 'Masala «10 va undan katta» desa, albatta >= belgisini tanlang; aks holda 10 ning oʻzi oʻtmay qoladi.',
      },
      {
        wrongIdea: 'Sikl ichida hisoblagichni oʻzgartirmasdan qoldirish.',
        truth: 'Har takrorlash oxirida SUB yoki ADD orqali chiqish chegarasiga yaqinlashtiring.',
      },
    ],
    selfCheck: {
      question: 'Sikl ichida n har safar 1 ga kamaymasa nima sodir boʻladi?',
      options: [
        'Sikl toʻxtamaydi va takt chegarasiga yetadi',
        'Sikl oʻzi 10-qadamda tugaydi',
        'n avtomatik 0 boʻladi',
      ],
      correctIndex: 0,
      explanation: 'Chiqish sharti oʻzgarmasa, JUMP har doim boshiga qaytaveradi.',
    },
    nextLessonSlug: null,
    playLevelId: 'w5-05-pass-threshold',
    demoProgram: {
      title: 'Jonli namuna: 1 dan 3 gacha yigʻindi',
      inputs: [3],
      instructions: [
        {
          label: 'SET n = 3 · SET sum = 0',
          vars: { n: 3, sum: 0 },
          outputs: [],
          note: 'Boshlangʻich hisoblagich 3 va yigʻindi 0 ga sozlandi.',
        },
        {
          label: '1-aylanish: sum = 3, n = 2',
          vars: { n: 2, sum: 3 },
          outputs: [],
          note: '3 qoʻshildi va n bir birlik kamaydi.',
        },
        {
          label: '2-aylanish: sum = 5, n = 1',
          vars: { n: 1, sum: 5 },
          outputs: [],
          note: '2 qoʻshilib sum = 5 boʻldi.',
        },
        {
          label: '3-aylanish va chiqish: sum = 6',
          vars: { n: 0, sum: 6 },
          outputs: [6],
          note: 'n <= 0 sharti bajarilib sikl toʻxtadi, ekranga 6 chiqdi.',
        },
      ],
    },
  },
];
