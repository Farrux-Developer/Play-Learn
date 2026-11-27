import { ImageResponse } from 'next/og';
import { getAllLessons } from '@/lib/game/content/loaders';
import { SITE_NAME } from '@/lib/seo/metadata';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function LessonOgImage({
  params,
}: {
  params: Promise<{ locale: string; track: string; concept: string }>;
}) {
  const { track, concept } = await params;
  const lesson = getAllLessons().find(
    (l) => l.track === track && l.concept === concept
  );
  const title = lesson?.title ?? 'Tushunish varagʻi';
  const summary =
    lesson?.heroSummary ??
    'Avval tushun, keyin oʻyna va kodni oʻzing boshqar.';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: '#0B3566',
          color: '#EAF2FF',
          border: '16px solid #F5A800',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            fontWeight: 700,
            color: '#F5A800',
          }}
        >
          {SITE_NAME} · Tushunish varagʻi
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.15 }}>
            {title}
          </div>
          <div style={{ fontSize: 28, color: '#B6CCE8', lineHeight: 1.4 }}>
            {summary}
          </div>
        </div>
        <div style={{ fontSize: 24, color: '#55DECC', fontWeight: 700 }}>
          5–6-sinf · Oflayn IT ustaxonasi
        </div>
      </div>
    ),
    size
  );
}
