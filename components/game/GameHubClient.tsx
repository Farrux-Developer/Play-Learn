'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Stars } from '@/components/ui/Stars';
import { WORKSHOP_GROWTH_CHECKS } from '@/lib/game/content/checks';
import type { LevelDef, SkillDef } from '@/lib/game/content/schemas';
import { WORKSHOP_ORDER, type CoreWorkshopId } from '@/lib/game/core/types';
import { buildRepairQueue } from '@/lib/game/mastery/scheduler';
import type { Locale } from '@/lib/i18n/types';
import { loadProgressV2, saveProgressV2 } from '@/lib/storage/idb';
import type { ProgressV2 } from '@/lib/storage/schema';

export function GameHubClient({
  locale,
  levels,
  skills,
  workshopLabels,
}: {
  locale: Locale;
  levels: readonly LevelDef[];
  skills: readonly SkillDef[];
  workshopLabels: Record<CoreWorkshopId, string>;
}) {
  const [progress, setProgress] = useState<ProgressV2 | null>(null);
  const [nowMs, setNowMs] = useState<number>(0);
  const [checkMode, setCheckMode] = useState<'pre' | 'post' | null>(null);
  const [checkAnswers, setCheckAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    void loadProgressV2().then((p) => {
      setNowMs(Date.now());
      setProgress(p);
    });
  }, []);

  const repairQueue =
    progress && nowMs > 0
      ? buildRepairQueue(progress.skills, skills, nowMs, 6)
      : [];

  const algoCheck = WORKSHOP_GROWTH_CHECKS.algoritm ?? [];
  const savedAlgoCheck = progress?.prePostChecks['algoritm'];

  const handleSaveProfile = async (avatar: 'boy' | 'girl' | 'neutral', nickname: string) => {
    if (!progress) return;
    const next: ProgressV2 = {
      ...progress,
      profile: { avatar, nickname: nickname.slice(0, 32) },
      updatedAt: Date.now(),
    };
    setProgress(next);
    await saveProgressV2(next);
  };

  const handleSubmitGrowthCheck = async () => {
    if (!progress || !checkMode) return;
    let score = 0;
    for (const q of algoCheck) {
      if (checkAnswers[q.id] === q.correctIndex) score += 1;
    }
    const prev = progress.prePostChecks['algoritm'] ?? {};
    const stamp = nowMs || progress.updatedAt;
    const next: ProgressV2 = {
      ...progress,
      prePostChecks: {
        ...progress.prePostChecks,
        algoritm: {
          ...prev,
          ...(checkMode === 'pre' ? { preScore: score } : { postScore: score }),
        },
      },
      updatedAt: stamp,
    };
    setProgress(next);
    setCheckMode(null);
    setCheckAnswers({});
    await saveProgressV2(next);
  };

  return (
    <div className="space-y-8">
      {/* Apprentice profile & XP summary */}
      <Panel variant="chamfered" className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[13.5px] font-bold text-[var(--reward-ink)]">
            Mirzo Ustaxonasi · Shogird profili
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold sm:text-3xl">
            {progress?.profile.nickname ? `Salom, ${progress.profile.nickname}!` : 'Oʻyin ustaxonalari'}
          </h1>
          <p className="ws-tabular text-[15px] text-[var(--on-surface-muted)]">
            {progress ? `${progress.xp} XP · ${Object.keys(progress.levels).length} ta daraja bajarilgan` : 'Yuklanmoqda...'}
          </p>
        </div>

        {progress ? (
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="apprentice-name" className="sr-only">
              Shogird ismi
            </label>
            <input
              id="apprentice-name"
              type="text"
              placeholder="Ismingiz (ixtiyoriy)"
              value={progress.profile.nickname}
              onChange={(e) => void handleSaveProfile(progress.profile.avatar, e.target.value)}
              className="min-h-[48px] w-44 rounded-[10px] border-2 border-[var(--line-strong)] bg-[var(--surface-inset)] px-3 text-[14.5px] font-semibold"
            />
            {(['boy', 'girl', 'neutral'] as const).map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => void handleSaveProfile(av, progress.profile.nickname)}
                aria-pressed={progress.profile.avatar === av}
                className={`min-h-[48px] cursor-pointer rounded-[10px] border-2 px-3 text-[13.5px] font-bold ${
                  progress.profile.avatar === av
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]'
                    : 'border-[var(--line)] bg-[var(--surface-inset)] text-[var(--on-surface)]'
                }`}
              >
                {av === 'boy' ? 'Oʻgʻil bola' : av === 'girl' ? 'Qiz bola' : 'Neytral'}
              </button>
            ))}
          </div>
        ) : null}
      </Panel>

      {/* Repair Day (Ta'mirlash kuni) */}
      {repairQueue.length > 0 ? (
        <Panel variant="elevated" state="warning" className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[var(--warning-ink)]">
            Taʼmirlash kuni ({repairQueue.length} ta koʻnikma takrorga tayyor)
          </h2>
          <div className="flex flex-wrap gap-2">
            {repairQueue.map((item) => {
              const firstLvl = levels.find((l) => l.skillIds.includes(item.skillId));
              return firstLvl ? (
                <Link
                  key={item.skillId}
                  href={`/${locale}/play/${firstLvl.workshop}/${firstLvl.id}`}
                  className="ws-key-btn ws-key-btn--secondary min-h-[48px] px-4 no-underline"
                >
                  {workshopLabels[item.workshop]}: {firstLvl.title}
                </Link>
              ) : null;
            })}
          </div>
        </Panel>
      ) : null}

      {/* Pre / Post growth check for Algoritm */}
      {algoCheck.length > 0 ? (
        <Panel variant="elevated" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
                Algoritm oʻsish tekshiruvi (Oldin → Keyin)
              </h2>
              <p className="ws-tabular text-[14.5px] text-[var(--on-surface-muted)]">
                Boshlangʻich: {savedAlgoCheck?.preScore ?? '—'}/{algoCheck.length} · Yakuniy:{' '}
                {savedAlgoCheck?.postScore ?? '—'}/{algoCheck.length}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setCheckMode('pre')}>
                Boshlashdan oldin
              </Button>
              <Button variant="primary" onClick={() => setCheckMode('post')}>
                Tugatgandan keyin
              </Button>
            </div>
          </div>

          {checkMode ? (
            <div className="space-y-3 rounded-[12px] border border-[var(--line-strong)] bg-[var(--surface-inset)] p-4">
              {algoCheck.map((q, qIdx) => (
                <div key={q.id} className="space-y-1.5">
                  <p className="text-[15px] font-bold">
                    {qIdx + 1}. {q.question}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() =>
                          setCheckAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                        }
                        className={`min-h-[44px] cursor-pointer rounded-[10px] border px-3 py-1.5 text-[14px] font-semibold ${
                          checkAnswers[q.id] === oIdx
                            ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]'
                            : 'border-[var(--line)] bg-[var(--surface)]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="primary" onClick={() => void handleSubmitGrowthCheck()}>
                  Saqlash
                </Button>
                <Button variant="ghost" onClick={() => setCheckMode(null)}>
                  Bekor qilish
                </Button>
              </div>
            </div>
          ) : null}
        </Panel>
      ) : null}

      {/* Workshops & Levels */}
      <div className="space-y-6">
        {WORKSHOP_ORDER.map((wsId, idx) => {
          const wsLevels = levels.filter((l) => l.workshop === wsId);
          const wsSkills = skills.filter((s) => s.workshop === wsId);
          const avgMastery =
            progress && wsSkills.length > 0
              ? Math.round(
                  (wsSkills.reduce(
                    (acc, s) => acc + (progress.skills[s.id]?.mastery ?? 0),
                    0
                  ) /
                    wsSkills.length) *
                    100
                )
              : 0;

          return (
            <section
              key={wsId}
              className="rounded-[var(--r-panel)] border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-5 shadow-[var(--sh-3)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
                <div>
                  <p className="text-[13px] font-bold text-[var(--reward-ink)]">
                    {wsId === 'kompyuter-yasa' ? '★ Yakuniy loyiha' : `${idx + 1}-ustaxona`}
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
                    {workshopLabels[wsId]}
                  </h2>
                </div>
                <ProgressRing
                  value={avgMastery}
                  state={avgMastery >= 80 ? 'mastered' : avgMastery > 0 ? 'practicing' : 'new'}
                  label={`${workshopLabels[wsId]} mahorati`}
                />
              </div>

              {wsLevels.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {wsLevels.map((lvl) => {
                    const lvlProg = progress?.levels[lvl.id];
                    const stars = lvlProg?.bestStars ?? 0;
                    return (
                      <Link
                        key={lvl.id}
                        href={`/${locale}/play/${lvl.workshop}/${lvl.id}`}
                        className="flex flex-col justify-between gap-3 rounded-[var(--r-card)] border-2 border-[var(--line-strong)] bg-[var(--surface-inset)] p-4 no-underline transition-colors hover:border-[var(--accent)]"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[12.5px] font-bold uppercase text-[var(--info-ink)]">
                              {lvl.kind}
                            </span>
                            <Stars earned={stars} size={18} />
                          </div>
                          <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--on-surface)]">
                            {lvl.orderNumber ? `${lvl.orderNumber}. ` : ''}
                            {lvl.title}
                          </h3>
                          {lvl.customerName ? (
                            <p className="mt-1 text-[13.5px] text-[var(--on-surface-muted)]">
                              {lvl.customerName}
                            </p>
                          ) : null}
                        </div>
                        <span className="text-[14px] font-bold text-[var(--reward-ink)]">
                          {stars > 0 ? 'Qayta oʻynash →' : 'Boshlash →'}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-[15px] text-[var(--on-surface-muted)]">
                  Ushbu ustaxona keyingi bosqichda ochiladi.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
