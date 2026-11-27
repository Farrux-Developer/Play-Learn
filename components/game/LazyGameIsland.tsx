'use client';

import dynamic from 'next/dynamic';
import type { GlossaryTerm, LevelDef } from '@/lib/game/content/schemas';
import type { Locale } from '@/lib/i18n/types';

const MirzoGameIsland = dynamic(
  () => import('./MirzoGameIsland').then((m) => m.MirzoGameIsland),
  {
    ssr: false,
    loading: () => (
      <div className="ws-chalk-skeleton p-8 text-center text-[16px] text-[var(--on-surface-muted)]">
        Mirzo ustaxonasi ishga tushmoqda...
      </div>
    ),
  }
);

export function LazyGameIsland(props: {
  locale: Locale;
  level: LevelDef;
  nextLevelId: string | null;
  glossaryTerms: GlossaryTerm[];
  lessonHref: string;
}) {
  return <MirzoGameIsland {...props} />;
}
