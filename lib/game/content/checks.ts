import type { CoreWorkshopId } from '@/lib/game/core/types';

export interface GrowthCheckQuestion {
  id: string;
  question: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
}

export const WORKSHOP_GROWTH_CHECKS: Partial<Record<CoreWorkshopId, readonly GrowthCheckQuestion[]>> = {
  algoritm: [
    {
      id: 'alg-chk-1',
      question: 'Boshida ball = 4 boʻlsa, SET ball = 9 buyrugʻidan keyin ball nechaga teng?',
      options: ['4', '9', '13'],
      correctIndex: 1,
      explanation: 'Yangi qiymat yozilganda qutidagi eski qiymat oʻchib, oʻrniga 9 yoziladi.',
    },
    {
      id: 'alg-chk-2',
      question: 'Agar shart "kamida 10 ball" desa, qaysi belgi toʻgʻri?',
      options: ['ball > 10', 'ball >= 10', 'ball < 10'],
      correctIndex: 1,
      explanation: '10 ning oʻzi ham oʻtishi uchun >= (katta yoki teng) ishlatiladi.',
    },
    {
      id: 'alg-chk-3',
      question: 'Sikl cheksiz aylanib qolmasligi uchun ichida nima boʻlishi kerak?',
      options: [
        'Hisoblagichni chiqish shartiga yaqinlashtiradigan oʻzgarish',
        'Kamida 5 ta OUT buyrugʻi',
        'Yorliqlarni oʻchirib tashlash',
      ],
      correctIndex: 0,
      explanation: 'Hisoblagich oʻzgarmasa chiqish sharti hech qachon rost boʻlmaydi.',
    },
    {
      id: 'alg-chk-4',
      question: '4 ta elementi bor roʻyxatning birinchi va oxirgi indeksi necha?',
      options: ['1 va 4', '0 va 3', '0 va 4'],
      correctIndex: 1,
      explanation: 'Roʻyxat indekslari 0 dan boshlanadi: 0, 1, 2, 3.',
    },
  ],
};
