import type { ReactNode } from 'react';
import Link from 'next/link';
import { Source_Serif_4 } from 'next/font/google';

import { ReaderAuthNav } from '@/components/reader/reader-auth-nav';

// Font serif jadi hero untuk judul & teks baca (wireframe Fase 2 yang sudah
// disetujui) — beda dari font sans default Studio (`layout.tsx` root).
// Diambil di sini (bukan root layout) supaya rute Studio tidak ikut memuat
// font ini.
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
});

/**
 * Layout rute publik reader — RINGAN, TANPA chrome shadcn dashboard (sidebar
 * dsb) yang dipakai `/dashboard`. Server Component murni supaya SSR penuh
 * (SEO); satu-satunya bagian client adalah `ReaderAuthNav` (status login).
 * Lihat plan/novelo/overview.md §5.
 */
export default function ReaderLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`novelo-reader ${sourceSerif.variable} flex min-h-screen flex-col`}>
      <header className="sticky top-0 z-10 border-b border-[var(--reader-border)] bg-[var(--reader-surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-[var(--reader-terracotta)]"
            style={{ fontFamily: 'var(--font-source-serif)' }}
          >
            Novelo
          </Link>

          <form action="/" method="get" className="order-3 w-full sm:order-none sm:max-w-md sm:flex-1">
            <input
              type="search"
              name="search"
              placeholder="Cari judul cerita…"
              className="w-full rounded-full border border-[var(--reader-border)] bg-[var(--reader-bg)] px-4 py-1.5 text-sm text-[var(--reader-foreground)] placeholder:text-[var(--reader-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--reader-terracotta)]/40"
            />
          </form>

          <div className="ml-auto">
            <ReaderAuthNav />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--reader-border)] px-4 py-6 text-center text-xs text-[var(--reader-muted)] sm:px-6">
        Novelo — Baca &amp; tulis cerita, oleh Bagdja.
      </footer>
    </div>
  );
}
