/**
 * Curriculum and interactive workshop data for Oʻyna va oʻrgan (Uzbek Latin).
 * Covers Darslar, Xarita, 3 Ustaxona (Oʻyinlar), Tamoyillar, and Mirzo mashinasi trace steps.
 */

import type { WorkshopId } from '../engine/store';

export interface LessonItem {
  id: string;
  title: string;
  summary: string;
  code: string;
  predictQuestion: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MapNodeItem {
  id: string;
  city: string;
  skillLabel: string;
  xpUnlock: number;
  workshopId: WorkshopId;
}

export interface WorkshopTask {
  id: string;
  prompt: string;
  codeSnippet: string;
  errorLineIndex?: number;
  options: string[];
  correctIndex: number;
  hint: string;
  successNote: string;
}

export interface WorkshopModule {
  id: WorkshopId;
  title: string;
  subtitle: string;
  badgeText: string;
  accentHex: string;
  unlockXp: number;
  tasks: WorkshopTask[];
}

export interface PrincipleItem {
  id: string;
  title: string;
  description: string;
}

export interface MachineTick {
  line: number;
  code: string;
  boxX: string;
  output: string;
  mirzoNote: string;
}

export const MACHINE_TICKS: MachineTick[] = [
  {
    line: 1,
    code: 'ball = 5',
    boxX: '5',
    output: '—',
    mirzoNote: '1-takt: "ball" nomli qutiga 5 yozildi.',
  },
  {
    line: 2,
    code: 'ball = ball + 3',
    boxX: '8',
    output: '—',
    mirzoNote: '2-takt: eski 5 ga 3 qoʻshilib, qutiga 8 saqlandi.',
  },
  {
    line: 3,
    code: 'chopEt(ball)',
    boxX: '8',
    output: '8',
    mirzoNote: '3-takt: chopEt buyrugʻi ekranga 8 ni chiqardi!',
  },
];

export const LESSONS: LessonItem[] = [
  {
    id: 'L1',
    title: 'Algoritm: aniq qadamlar tartibi',
    summary: 'Kompyuter buyruqni taxmin qilmaydi — faqat yozilgan tartibda bajaradi.',
    code: '1. Choynakka suv quy\n2. Suvni qaynat\n3. Choy damla',
    predictQuestion: 'Agar 2- va 3-qadam almashib qolsa, nima boʻladi?',
    options: [
      'Quruq choyga sovuq suv quyiladi',
      'Kompyuter oʻzi toʻgʻrilab oladi',
      'Natija bir xil chiqadi',
    ],
    correctIndex: 0,
    explanation: 'Algoritmda tartib hal qiluvchi ahamiyatga ega: mashina buyruqni soʻzma-soʻz bajaradi.',
  },
  {
    id: 'L2',
    title: 'Oʻzgaruvchi: nomli xotira qutisi',
    summary: 'Yangi qiymat yozilganda, qutidagi eski qiymat oʻchib oʻrniga yangisi tushadi.',
    code: 'ball = 10\nball = 15\nchopEt(ball)',
    predictQuestion: 'chopEt(ball) ekranga qaysi sonni chiqaradi?',
    options: ['10', '15', '25'],
    correctIndex: 1,
    explanation: 'Quti bir vaqtda faqat oxirgi berilgan qiymatni (15) saqlaydi.',
  },
  {
    id: 'L3',
    title: 'Shart operatori: ikki yoʻldan biri',
    summary: 'agar shart rost boʻlsa birinchi yoʻl, aks holda ikkinchi yoʻl ishlaydi.',
    code: 'ball = 12\nagar (ball >= 12) {\n  chopEt("Oʻtdi")\n} aks holda {\n  chopEt("Kut")\n}',
    predictQuestion: 'ball = 12 boʻlganda qaysi yozuv chiqadi?',
    options: ['Oʻtdi', 'Kut', 'Ikkalasi ham'],
    correctIndex: 0,
    explanation: '12 >= 12 sharti rost, shuning uchun faqat "Oʻtdi" yoʻli bajariladi.',
  },
  {
    id: 'L4',
    title: 'Sikl: bir xil ishni takrorlash',
    summary: 'Sikl bir nechta qator oʻrniga bitta harakatni aniq marta aylantiradi.',
    code: 'yigindi = 0\nuchun i = 1 dan 3 gacha {\n  yigindi = yigindi + i\n}\nchopEt(yigindi)',
    predictQuestion: 'Sikl tugagach yigindi nechaga teng boʻladi?',
    options: ['3', '6', '4'],
    correctIndex: 1,
    explanation: '1 + 2 + 3 = 6: hisoblagich uch marta aylanib qoʻshib boradi.',
  },
];

export const MAP_NODES: MapNodeItem[] = [
  {
    id: 'samarqand',
    city: 'Samarqand',
    skillLabel: 'Algoritm va qadamlar',
    xpUnlock: 0,
    workshopId: 'algoritmlar',
  },
  {
    id: 'buxoro',
    city: 'Buxoro',
    skillLabel: 'Shart va oʻzgaruvchi',
    xpUnlock: 60,
    workshopId: 'mantiq',
  },
  {
    id: 'toshkent',
    city: 'Toshkent',
    skillLabel: 'Sikllar va tuzatish',
    xpUnlock: 120,
    workshopId: 'sikllar',
  },
];

export const WORKSHOPS: WorkshopModule[] = [
  {
    id: 'algoritmlar',
    title: 'Algoritm ustaxonasi',
    subtitle: 'Qadamlar tartibini toʻgʻri yigʻ va mashinani yurgiz',
    badgeText: '1-ustaxona',
    accentHex: '#19B7A6',
    unlockXp: 0,
    tasks: [
      {
        id: 'alg-1',
        prompt: 'Robot eshikni ochishi uchun qaysi buyruq birinchi turishi kerak?',
        codeSnippet: '1. ???\n2. Eshikni och\n3. Ichkariga kir',
        options: ['Kalitni top', 'Eshikni yop', 'Ortga qayt'],
        correctIndex: 0,
        hint: 'Eshik qulfini ochish uchun avval kalit kerak.',
        successNote: 'Toʻgʻri! Qadamlar tartibi mantiqiy zanjir hosil qildi.',
      },
      {
        id: 'alg-2',
        prompt: 'Qaysi qator natijani oʻzgartirib yuboradigan xato tartibda?',
        codeSnippet: '1. Qozonni ol\n2. Gazni yoq\n3. Suv quy\n4. Qaynat',
        errorLineIndex: 1,
        options: ['2-qator: avval suv quyish kerak', '1-qator', '4-qator'],
        correctIndex: 0,
        hint: 'Boʻsh qozonni olovga qoʻyish xavfli — suv qachon quyiladi?',
        successNote: 'Barakalla! Xatoni oʻzing topib tartibni tiklading.',
      },
    ],
  },
  {
    id: 'mantiq',
    title: 'Mantiq darvozasi',
    subtitle: 'Shart rost yoki yolgʻonligini aniqlab yoʻl och',
    badgeText: '2-ustaxona',
    accentHex: '#F5A800',
    unlockXp: 60,
    tasks: [
      {
        id: 'man-1',
        prompt: 'yosh = 11 boʻlsa, darvoza nima deydi?',
        codeSnippet: 'agar (yosh > 11) {\n  chopEt("Ochiq")\n} aks holda {\n  chopEt("Yopiq")\n}',
        options: ['Ochiq', 'Yopiq', 'Xato beradi'],
        correctIndex: 1,
        hint: '11 > 11 qatʼiy katta belgisi rostmi yoki yolgʻon?',
        successNote: 'Ajoyib! 11 > 11 yolgʻon boʻlgani uchun aks holda ishladi.',
      },
    ],
  },
  {
    id: 'sikllar',
    title: 'Sikl konveyeri',
    subtitle: 'Takrorlanish sonini aniq hisobla va cheksiz siklni toʻxtat',
    badgeText: '3-ustaxona',
    accentHex: '#E4572E',
    unlockXp: 120,
    tasks: [
      {
        id: 'sik-1',
        prompt: 'Bu sikl nechta detal ishlab chiqaradi?',
        codeSnippet: 'uchun k = 1 dan 4 gacha {\n  yasa("detal")\n}',
        options: ['3 ta', '4 ta', '5 ta'],
        correctIndex: 1,
        hint: '1, 2, 3, 4 — har bir sonni bittadan sana.',
        successNote: 'Zoʻr! Aniq 4 marta aylanib toʻxtadi.',
      },
    ],
  },
];

export const PRINCIPLES: PrincipleItem[] = [
  {
    id: 'predict',
    title: 'Avval taxmin, keyin tekshir',
    description:
      'Javobni darhol oʻqish oʻrniga natijani oldindan aytib koʻr — miya kodni oʻzi yurita boshlaydi.',
  },
  {
    id: 'feedback',
    title: 'Har bir xato — aniq koʻrsatkich',
    description:
      'Notoʻgʻri javobda mashina toʻxtab qolmaydi: qaysi qadam yoki shart buzilganini darrov koʻrsatadi.',
  },
  {
    id: 'transfer',
    title: 'Qogʻozdagi mantiqdan haqiqiy kodingga',
    description:
      'Kundalik hayotdagi tartib va qutilar toʻgʻridan-toʻgʻri dasturlash qonunlariga aylanadi.',
  },
];
