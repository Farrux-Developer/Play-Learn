'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Panel } from '@/components/ui/Panel';
import { ProgressRing } from '@/components/ui/ProgressRing';
import type { LessonDocument } from '@/lib/game/content/lessons';
import type { LevelDef, SkillDef } from '@/lib/game/content/schemas';
import type { CoreWorkshopId, SkillState } from '@/lib/game/core/types';
import type { Locale } from '@/lib/i18n/types';
import { loadProgressV2 } from '@/lib/storage/idb';
import type { ProgressV2 } from '@/lib/storage/schema';

const STATE_LABELS: Record<SkillState, string> = {
  new: 'Yangi',
  introduced: 'Tanishildi',
  practicing: 'Mashqda',
  mastered: 'Oʻzlashtirildi',
  retained: 'Mustahkamlandi',
};

export function MasteryMapClient({
  locale,
  skills,
  levels,
  lessons,
  workshopLabels,
}: {
  locale: Locale;
  skills: readonly SkillDef[];
  levels: readonly LevelDef[];
  lessons: readonly LessonDocument[];
  workshopLabels: Record<CoreWorkshopId, string>;
}) {
  const [progress, setProgress] = useState<ProgressV2 | null>(null);

  useEffect(() => {
    void loadProgressV2().then(setProgress);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {skills.map((skill) => {
        const sp = progress?.skills[skill.id];
        const state: SkillState = sp?.state ?? 'new';
        const pct = Math.round((sp?.mastery ?? 0) * 100);
        const lesson = lessons.find((l) => l.slug === skill.lessonSlug);
        const firstLevel = levels.find((l) => skill.levelIds.includes(l.id));

        return (
          <Panel
            key={skill.id}
            variant="chamfered"
            state={
              state === 'mastered' || state === 'retained'
                ? 'success'
                : state === 'practicing'
                  ? 'active'
                  : 'default'
            }
            className="flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-[var(--reward-ink)]">
                  {workshopLabels[skill.workshop]} · {STATE_LABELS[state]}
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
                  {skill.title}
                </h2>
                {skill.prerequisites.length > 0 ? (
                  <p className="text-[13.5px] text-[var(--on-surface-muted)]">
                    Oldingi koʻnikma: {skill.prerequisites.join(', ')}
                  </p>
                ) : null}
              </div>

              <ProgressRing value={pct} state={state} label={skill.title} />
            </div>

            <div className="flex flex-wrap gap-2.5">
              {lesson ? (
                <Link
                  href={`/${locale}/learn/${lesson.track}/${lesson.concept}`}
                  className="ws-key-btn ws-key-btn--secondary min-h-[48px] px-4 no-underline"
                >
                  Darsni oʻqish
                </Link>
              ) : null}
              {firstLevel ? (
                <Link
                  href={`/${locale}/play/${firstLevel.workshop}/${firstLevel.id}`}
                  className="ws-key-btn ws-key-btn--primary min-h-[48px] px-4 no-underline"
                >
                  Oʻynash ({skill.levelIds.length})
                </Link>
              ) : (
                <span className="inline-flex min-h-[48px] items-center rounded-[10px] border border-[var(--line)] px-3 text-[13.5px] text-[var(--on-surface-muted)]">
                  4-bosqichda ochiladi
                </span>
              )}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}
