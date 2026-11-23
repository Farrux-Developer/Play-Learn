'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Bug,
  Compass,
  Cpu,
  Flame,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { BADGES } from '@/lib/data/curriculum';
import type { ProgressState, QualityTier, UserPreferences } from '@/lib/engine/mastery';
import { pickText, type LocaleScript, type UiDictionary } from '@/lib/engine/i18n';
import { MOTION_TOKENS } from '@/lib/motion/tokens';

interface RewardsSettingsSectionProps {
  t: UiDictionary;
  progress: ProgressState;
  onUpdatePrefs: (patch: Partial<UserPreferences>) => void;
  onResetProgress: () => void;
}

function BadgeIcon({ iconKey }: { iconKey: string }) {
  switch (iconKey) {
    case 'compass':
      return <Compass className="w-6 h-6" aria-hidden="true" />;
    case 'cpu':
      return <Cpu className="w-6 h-6" aria-hidden="true" />;
    case 'bug':
      return <Bug className="w-6 h-6" aria-hidden="true" />;
    case 'flame':
      return <Flame className="w-6 h-6" aria-hidden="true" />;
    case 'sparkles':
      return <Sparkles className="w-6 h-6" aria-hidden="true" />;
    default:
      return <Award className="w-6 h-6" aria-hidden="true" />;
  }
}

export function RewardsSettingsSection({
  t,
  progress,
  onUpdatePrefs,
  onResetProgress,
}: RewardsSettingsSectionProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const script = progress.preferences.script;

  const ui =
    script === 'uz-Cyrl'
      ? {
          badgesCount: 'Очилган нишонлар:',
          unlocked: 'Очилган',
          locked: 'Ёпиқ',
          realCodeToggle: 'Ҳақиқий код (Python) билан ёнма-ён кўрсатиш',
          qHigh: 'Юқори (60 fps)',
          qMedium: 'Ўрта',
          qLow: 'Паст',
          confirmTitle: 'Прогрессни тозалашни тасдиқлайсанми?',
          confirmBody:
            'Барча XP, ечилган топшириқлар ва очилган нишонлар бошланғич ҳолатга қайтади.',
          cancelBtn: 'Бекор қилиш',
          confirmBtn: 'Ҳа, бошидан бошлаш',
        }
      : {
          badgesCount: 'Ochilgan nishonlar:',
          unlocked: 'Ochilgan',
          locked: 'Yopiq',
          realCodeToggle: 'Haqiqiy kod (Python) bilan yonma-yon koʻrsatish',
          qHigh: 'Yuqori (60 fps)',
          qMedium: 'Oʻrta',
          qLow: 'Past',
          confirmTitle: 'Progressni tozalashni tasdiqlaysanmi?',
          confirmBody:
            'Barcha XP, yechilgan topshiriqlar va ochilgan nishonlar boshlangʻich holatga qaytadi.',
          cancelBtn: 'Bekor qilish',
          confirmBtn: 'Ha, boshidan boshlash',
        };

  return (
    <section
      id="mukofotlar"
      className="bg-[#EAE5DA]/55 border-t border-[#D5CEC0] py-14 sm:py-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1.5 max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#122033]">
                {t.rewardsTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#43536B]">
                {t.rewardsSubtitle}
              </p>
            </div>
            <p className="text-sm font-semibold text-[#0F4C81] tabular-nums">
              {ui.badgesCount} {progress.unlockedBadges.length} / {BADGES.length}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BADGES.map((badge) => {
              const unlocked = progress.unlockedBadges.includes(badge.id);
              return (
                <motion.div
                  key={badge.id}
                  whileHover={
                    unlocked && !progress.preferences.reducedMotion
                      ? { y: -3 }
                      : undefined
                  }
                  transition={{ duration: MOTION_TOKENS.duration.fast }}
                  className={`rounded-2xl border p-5 flex items-start gap-4 transition-colors ${
                    unlocked
                      ? 'bg-white border-[#F59E0B] shadow-[var(--shadow-card)]'
                      : 'bg-[#F6F4EE]/70 border-[#D5CEC0] opacity-75'
                  }`}
                >
                  <div
                    className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${
                      unlocked
                        ? 'bg-[#FEF3C7] text-[#9A5B00]'
                        : 'bg-[#EAE5DA] text-[#5C6B80]'
                    }`}
                  >
                    <BadgeIcon iconKey={badge.iconKey} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-bold text-[#122033]">
                        {pickText(badge.title, script)}
                      </h3>
                      <span className="text-xs font-medium text-[#5C6B80]">
                        · {unlocked ? ui.unlocked : ui.locked}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#43536B]">
                      {pickText(badge.criteria, script)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#D5CEC0] p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE5DA] pb-4">
            <h3 className="font-display text-xl font-bold text-[#122033]">
              {t.settingsTitle}
            </h3>

            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#991B1B] text-xs sm:text-sm font-semibold cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>{t.resetProgressBtn}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#F6F4EE] cursor-pointer min-h-[48px]">
                <span className="text-sm font-medium text-[#122033]">
                  {t.reducedMotionLabel}
                </span>
                <input
                  type="checkbox"
                  checked={progress.preferences.reducedMotion}
                  onChange={(e) =>
                    onUpdatePrefs({ reducedMotion: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#0F4C81] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#F6F4EE] cursor-pointer min-h-[48px]">
                <span className="text-sm font-medium text-[#122033]">
                  {t.dyslexiaLabel}
                </span>
                <input
                  type="checkbox"
                  checked={progress.preferences.dyslexiaMode}
                  onChange={(e) =>
                    onUpdatePrefs({ dyslexiaMode: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#0F4C81] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#F6F4EE] cursor-pointer min-h-[48px]">
                <span className="text-sm font-medium text-[#122033]">
                  {ui.realCodeToggle}
                </span>
                <input
                  type="checkbox"
                  checked={progress.preferences.showRealCode}
                  onChange={(e) =>
                    onUpdatePrefs({ showRealCode: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#0F4C81] cursor-pointer"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#5C6B80]">
                  {t.qualityLabel}
                </p>
                <div className="flex gap-1.5 p-1 rounded-xl bg-[#F6F4EE] border border-[#D5CEC0]">
                  {(
                    [
                      ['high', ui.qHigh],
                      ['medium', ui.qMedium],
                      ['low', ui.qLow],
                    ] as [QualityTier, string][]
                  ).map(([tier, label]) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => onUpdatePrefs({ qualityTier: tier })}
                      className={`flex-1 py-2 px-3 min-h-[40px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        progress.preferences.qualityTier === tier
                          ? 'bg-[#0F4C81] text-white'
                          : 'text-[#43536B] hover:text-[#122033]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#5C6B80]">
                  {t.scriptLabel}
                </p>
                <div className="flex gap-1.5 p-1 rounded-xl bg-[#F6F4EE] border border-[#D5CEC0]">
                  {(
                    [
                      ['uz-Latn', 'Oʻzbekcha (Lotin)'],
                      ['uz-Cyrl', 'Ўзбекча (Кирилл)'],
                    ] as [LocaleScript, string][]
                  ).map(([sc, label]) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => onUpdatePrefs({ script: sc })}
                      className={`flex-1 py-2 px-3 min-h-[40px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        progress.preferences.script === sc
                          ? 'bg-[#0F4C81] text-white'
                          : 'text-[#43536B] hover:text-[#122033]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmReset && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1A2B]/70 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#D5CEC0] p-6 shadow-2xl space-y-4">
            <h3
              id="reset-confirm-title"
              className="font-display text-lg font-bold text-[#122033]"
            >
              {ui.confirmTitle}
            </h3>
            <p className="text-sm text-[#43536B]">{ui.confirmBody}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 min-h-[44px] rounded-xl bg-[#F6F4EE] border border-[#D5CEC0] text-sm font-semibold cursor-pointer"
              >
                {ui.cancelBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                }}
                className="px-4 py-2 min-h-[44px] rounded-xl bg-[#B91C1C] text-white text-sm font-semibold cursor-pointer"
              >
                {ui.confirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
