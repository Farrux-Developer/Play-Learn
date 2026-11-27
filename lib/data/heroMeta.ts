/**
 * Lightweight hero & HUD metadata separated from full lesson/task datasets
 * to keep landing First-Load JS strictly <= 120 KB gz.
 */

import type { WorkshopId } from '../engine/store';

export interface MachineTick {
  line: number;
  code: string;
  boxX: string;
  output: string;
  mirzoNote: string;
}

export interface WorkshopMeta {
  id: WorkshopId;
  title: string;
  badgeText: string;
  unlockXp: number;
}

export const LESSONS_TOTAL = 4;

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

export const WORKSHOP_META: WorkshopMeta[] = [
  {
    id: 'algoritmlar',
    title: 'Algoritm ustaxonasi',
    badgeText: '1-ustaxona',
    unlockXp: 0,
  },
  {
    id: 'mantiq',
    title: 'Mantiq darvozasi',
    badgeText: '2-ustaxona',
    unlockXp: 60,
  },
  {
    id: 'sikllar',
    title: 'Sikl konveyeri',
    badgeText: '3-ustaxona',
    unlockXp: 120,
  },
];
