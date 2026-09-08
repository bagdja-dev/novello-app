import type { ReactNode } from 'react';
import Link from 'next/link';
import { Source_Serif_4 } from 'next/font/google';

import { ReaderAuthNav } from '@/components/reader/reader-auth-nav';
import { SearchBar } from '@/components/reader/search-bar';
import { getPlatformConfig } from '@/lib/public-api';

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
 *
 * `title`/`logo`/`colors` diambil dari `GET /public/config` (platform_config,
 * diedit langsung di DB — lihat plan/novelo/schema.dbml) supaya identitas
 * platform bisa diubah tanpa redeploy kode. `colors` diterapkan lewat
 * `<style>` inline yang override CSS var `.novelo-reader` di globals.css —
 * kalau config gagal dimuat / belum diedit, nilainya identik dengan default
 * hardcode lama (lihat `PLATFORM_CONFIG_FALLBACK`), jadi TIDAK ADA
 * perubahan visual sampai memang ada yang mengedit config di DB.
 */
export default async function ReaderLayout({ children }: { children: ReactNode }) {
  const config = await getPlatformConfig();
  const c = config.colors;

  return (
    <div className={`novelo-reader ${sourceSerif.variable} flex min-h-screen flex-col`}>
      <style>{`
        .novelo-reader {
          --reader-bg: ${c.bg};
          --reader-surface: ${c.surface};
          --reader-foreground: ${c.foreground};
          --reader-muted: ${c.muted};
          --reader-border: ${c.border};
          --reader-terracotta: ${c.terracotta};
          --reader-terracotta-foreground: ${c.terracottaForeground};
          --reader-mustard: ${c.mustard};
          --reader-olive: ${c.olive};
        }
      `}</style>

      <header className="sticky top-0 z-10 border-b border-[var(--reader-border)] bg-[var(--reader-surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-semibold tracking-tight text-[var(--reader-terracotta)]"
            style={{ fontFamily: 'var(--font-source-serif)' }}
          >
            {config.logo && (
              // eslint-disable-next-line @next/next/no-img-element -- logo dari URL config bebas domain, bukan aset lokal
              <img src={config.logo} alt={config.title} className="h-7 w-auto" />
            )}
            {config.title}
          </Link>

          <SearchBar />

          <div className="ml-auto">
            <ReaderAuthNav lockStudio={config.lockStudio} />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--reader-border)] px-4 py-6 text-center text-xs text-[var(--reader-muted)] sm:px-6">
        {config.title} — Baca &amp; tulis cerita, oleh Bagdja.
      </footer>
    </div>
  );
}
