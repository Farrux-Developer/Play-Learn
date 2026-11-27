import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      data-surface="paper"
      className="ws-surface flex min-h-screen items-center justify-center px-4 py-12"
    >
      <div className="ws-chamfer max-w-lg border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] p-6 text-center shadow-[var(--sh-3)] sm:p-8">
        <p className="ws-tabular text-sm font-extrabold uppercase tracking-wider text-[var(--info-ink)]">
          404
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold sm:text-3xl">
          Sahifa topilmadi
        </h1>
        <p className="mt-3 text-[16px] text-[var(--on-surface-muted)]">
          Kechirasiz, izlagan ustaxona yoki dars sahifasi boshqa manzilda boʻlishi mumkin.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="ws-key-btn ws-key-btn--primary min-h-[48px] px-5 no-underline"
          >
            Bosh sahifaga qaytish
          </Link>
          <Link
            href="/uz/play"
            className="ws-key-btn ws-key-btn--secondary min-h-[48px] px-5 no-underline"
          >
            Oʻyinlar ustaxonasi
          </Link>
        </div>
      </div>
    </main>
  );
}
