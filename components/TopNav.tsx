'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { UiDictionary } from '@/lib/engine/i18n';

interface TopNavProps {
  t: UiDictionary;
  onStartPrimary: () => void;
}

/**
 * Strict 3-zone Top Bar Contract:
 * [1-line Brand Wordmark] — [4 single-line Nav Links] — [1 Primary CTA]
 */
export function TopNav({ t, onStartPrimary }: TopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#F6F4EE] border-b border-[#D5CEC0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <a
          href="#bosh-sahifa"
          className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#122033] whitespace-nowrap shrink-0"
        >
          {t.brandTitle}
        </a>

        <nav
          aria-label="Asosiy navigatsiya"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#43536B]"
        >
          <a
            href="#darslar"
            className="hover:text-[#0F4C81] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navLessons}
          </a>
          <a
            href="#xarita"
            className="hover:text-[#0F4C81] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navMap}
          </a>
          <a
            href="#oyinlar"
            className="hover:text-[#0F4C81] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navGames}
          </a>
          <a
            href="#tamoyillar"
            className="hover:text-[#0F4C81] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navPrinciples}
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onStartPrimary}
            data-start="true"
            className="px-4 py-2 min-h-[40px] rounded-xl bg-[#0F4C81] hover:bg-[#0B3A63] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.navStartBtn}
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-[#D5CEC0] text-[#122033]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobil navigatsiya"
          className="md:hidden border-t border-[#D5CEC0] bg-[#F6F4EE] px-4 py-3 flex flex-col gap-2 text-sm font-medium text-[#122033]"
        >
          <a href="#darslar" onClick={() => setMobileOpen(false)} className="py-2.5 px-2 rounded-lg hover:bg-[#EAE5DA]">
            {t.navLessons}
          </a>
          <a href="#xarita" onClick={() => setMobileOpen(false)} className="py-2.5 px-2 rounded-lg hover:bg-[#EAE5DA]">
            {t.navMap}
          </a>
          <a href="#oyinlar" onClick={() => setMobileOpen(false)} className="py-2.5 px-2 rounded-lg hover:bg-[#EAE5DA]">
            {t.navGames}
          </a>
          <a href="#tamoyillar" onClick={() => setMobileOpen(false)} className="py-2.5 px-2 rounded-lg hover:bg-[#EAE5DA]">
            {t.navPrinciples}
          </a>
          <a href="#mukofotlar" onClick={() => setMobileOpen(false)} className="py-2.5 px-2 rounded-lg hover:bg-[#EAE5DA]">
            {t.navRewards}
          </a>
        </nav>
      )}
    </header>
  );
}
