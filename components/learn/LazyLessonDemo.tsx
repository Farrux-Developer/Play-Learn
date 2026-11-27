'use client';

import dynamic from 'next/dynamic';
import type { LessonDocument } from '@/lib/game/content/lessons';

const LessonInteractiveDemo = dynamic(
  () =>
    import('./LessonInteractiveDemo').then((m) => m.LessonInteractiveDemo),
  {
    ssr: false,
    loading: () => (
      <div className="ws-chalk-skeleton p-6 text-[15px] text-[var(--on-surface-muted)]">
        Jonli Mirzo mashinasi yuklanmoqda...
      </div>
    ),
  }
);

export function LazyLessonDemo({
  demoProgram,
  selfCheck,
}: {
  demoProgram: LessonDocument['demoProgram'];
  selfCheck: LessonDocument['selfCheck'];
}) {
  return <LessonInteractiveDemo demoProgram={demoProgram} selfCheck={selfCheck} />;
}
