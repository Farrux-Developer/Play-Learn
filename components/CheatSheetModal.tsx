'use client';

import React, { useEffect } from 'react';
import { BookOpen, X } from 'lucide-react';
import { lt, pickText, type LocaleScript } from '@/lib/engine/i18n';

interface CheatSheetModalProps {
  open: boolean;
  script: LocaleScript;
  onClose: () => void;
}

const PSEUDOCODE_ROWS = [
  {
    name: lt('Oʻzgaruvchi qutisi', 'Ўзгарувчи қутиси'),
    pseudo: 'x = 5',
    python: 'x = 5',
    meaning: lt('x qutisiga 5 sonini soladi (eski qiymat oʻchadi).', 'x қутисига 5 сонини солади (эски қиймат ўчади).'),
  },
  {
    name: lt('Ekranga chiqarish', 'Экранга чиқариш'),
    pseudo: 'chopEt(x)',
    python: 'print(x)',
    meaning: lt('Qutidagi qiymatni yoki matnni ekranga chiqaradi.', 'Қутидаги қийматни ёки матнни экранга чиқаради.'),
  },
  {
    name: lt('Shart tarmogʻi', 'Шарт тармоғи'),
    pseudo: 'agar (yosh >= 12) { ... } aks holda { ... }',
    python: 'if yosh >= 12: ... else: ...',
    meaning: lt('Shart rost boʻlsa 1-yoʻl, aks holda 2-yoʻl ishlaydi.', 'Шарт рост бўлса 1-йўл, акс ҳолда 2-йўл ишлайди.'),
  },
  {
    name: lt('VA va YOKI', 'ВА ва ЁКИ'),
    pseudo: 'a && b   |   a || b',
    python: 'a and b   |   a or b',
    meaning: lt('&& — ikkalasi rost; || — kamida bittasi rost.', '&& — иккаласи рост; || — камида биттаси рост.'),
  },
  {
    name: lt('Aniq marta takrorlash', 'Аниқ марта такрорлаш'),
    pseudo: '4 marta takrorla { ... }',
    python: 'for _ in range(4): ...',
    meaning: lt('Ichidagi buyruqlarni roppa-rosa 4 marta bajaradi.', 'Ичидаги буйруқларни роппа-роса 4 марта бажаради.'),
  },
  {
    name: lt('Sanash sikli', 'Санаш цикли'),
    pseudo: 'uchun i = 1 dan 4 gacha { ... }',
    python: 'for i in range(1, 5): ...',
    meaning: lt('i ni 1, 2, 3, 4 qiymatlaridan olib oʻtadi (4 ham kiradi!).', 'i ни 1, 2, 3, 4 қийматларидан олиб ўтади (4 ҳам киради!).'),
  },
  {
    name: lt('Shartli sikl', 'Шартли цикл'),
    pseudo: 'toki (i <= 5) { ... }',
    python: 'while i <= 5: ...',
    meaning: lt('Shart rost ekan, aylanaveradi.', 'Шарт рост экан, айланаверади.'),
  },
];

export function CheatSheetModal({ open, script, onClose }: CheatSheetModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const title =
    script === 'uz-Cyrl'
      ? 'Псевдокод эслатмаси (ягона қоида)'
      : 'Psevdokod eslatmasi (yagona qoida)';
  const subtitle =
    script === 'uz-Cyrl'
      ? 'Бутун сайтда бир хил буйруқлар ишлатилади. Ўнг томонда Python кўриниши ҳам бор.'
      : 'Butun saytda bir xil buyruqlar ishlatiladi. Oʻng tomonda Python koʻrinishi ham bor.';
  const closeLabel = script === 'uz-Cyrl' ? 'Ёпиш' : 'Yopish';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cheatsheet-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1A2B]/75 p-4"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white text-[#122033] border border-[#D5CEC0] p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-[#EAE5DA] pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] text-[#0F4C81] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="cheatsheet-title" className="font-display text-xl font-bold text-[#122033]">
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-[#43536B] mt-0.5">{subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="p-2 min-w-[40px] min-h-[40px] rounded-xl hover:bg-[#EAE5DA] text-[#43536B] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {PSEUDOCODE_ROWS.map((row) => (
            <div
              key={row.pseudo}
              className="rounded-xl bg-[#F6F4EE] border border-[#D5CEC0] p-3.5 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#0F4C81]">
                  {pickText(row.name, script)}
                </span>
                <span className="text-xs text-[#43536B]">
                  {pickText(row.meaning, script)}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-code text-xs">
                <div className="rounded-lg bg-[#0E1A2B] text-[#F4F6FA] px-3 py-2">
                  <span className="text-[10px] text-[#94A3B8] block font-sans">Oʻzbekcha</span>
                  <code>{row.pseudo}</code>
                </div>
                <div className="rounded-lg bg-[#17273E] text-[#BAE6FD] px-3 py-2">
                  <span className="text-[10px] text-[#7DD3FC] block font-sans">Python</span>
                  <code>{row.python}</code>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#0F4C81] hover:bg-[#0B3A63] text-white text-sm font-semibold cursor-pointer"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
