import Link from 'next/link';

export const metadata = {
  title: 'Oflayn rejim — Oʻyna va oʻrgan',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main
      data-surface="blueprint"
      className="ws-surface ws-blueprint-grid flex min-h-screen items-center justify-center px-4 py-12"
    >
      <div className="ws-chamfer max-w-lg border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-6 text-center shadow-[var(--sh-4)] sm:p-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold sm:text-3xl">
          Internet ulanmagan, lekin ustaxona ishlaydi
        </h1>
        <p className="mt-3 text-[16px] text-[var(--on-surface-muted)]">
          Oldin ochilgan darslar va Mirzo ustaxonasi qurilmangizda saqlangan. Bosh sahifadan davom etishingiz mumkin.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/uz/play"
            className="ws-key-btn ws-key-btn--primary min-h-[48px] px-5 no-underline"
          >
            Oʻyinlarga oʻtish
          </Link>
          <Link
            href="/uz/learn"
            className="ws-key-btn ws-key-btn--secondary min-h-[48px] px-5 no-underline"
          >
            Darslar varagʻi
          </Link>
        </div>
      </div>
    </main>
  );
}
