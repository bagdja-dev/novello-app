'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api-client';
import type { Library } from '@/lib/types';

/**
 * Bagian header reader yang bergantung status login — sengaja dipisah jadi
 * client component kecil supaya `app/(reader)/layout.tsx` sendiri tetap
 * Server Component murni (SSR penuh untuk SEO). `useAuth` baca cookie
 * `ns_user` di browser, sama seperti dipakai Topbar Studio.
 */
interface ReaderAuthNavProps {
  /**
   * `platform_config.lockStudio` (di-SSR dari `(reader)/layout.tsx`, sudah
   * fetch config sekali di server — diteruskan sebagai prop di sini supaya
   * tidak fetch ulang di client & tidak ada flash tombol "Untuk Penulis"
   * sebelum config kebaca).
   */
  lockStudio: boolean;
}

export function ReaderAuthNav({ lockStudio }: ReaderAuthNavProps) {
  const { isLoggedIn, loading } = useAuth();
  const pathname = usePathname();

  // lockStudio hanya menutup PENDAFTARAN Library baru — user yang SUDAH
  // punya Library tetap boleh akses Studio-nya. Jadi "Studio Saya" perlu
  // status Library user login saat lockStudio true. Sengaja HANYA fetch
  // `/libraries/me` kalau lockStudio true DAN user login (apiClient redirect
  // otomatis ke /auth/login kalau sesi 401 — jangan pernah dipanggil untuk
  // guest yang belum login sama sekali, dan jangan nambah roundtrip kalau
  // platform sedang tidak dikunci).
  const [hasLibrary, setHasLibrary] = useState(false);
  const [libraryChecking, setLibraryChecking] = useState(lockStudio);

  useEffect(() => {
    // Early-return TANPA setLibraryChecking(false) di sini secara sengaja —
    // gate render di bawah sudah men-short-circuit lewat `isLoggedIn &&
    // lockStudio &&`, jadi nilai `libraryChecking` tidak relevan saat salah
    // satu kondisi ini false.
    if (!lockStudio || !isLoggedIn) {
      return;
    }

    let cancelled = false;
    setLibraryChecking(true);
    apiClient<Library | null>('/libraries/me')
      .then((data) => {
        if (!cancelled) setHasLibrary(!!data);
      })
      .catch(() => {
        if (!cancelled) setHasLibrary(false);
      })
      .finally(() => {
        if (!cancelled) setLibraryChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lockStudio, isLoggedIn]);

  if (loading || (isLoggedIn && lockStudio && libraryChecking)) {
    return <div className="h-8 w-28" aria-hidden />;
  }

  if (isLoggedIn) {
    const showStudioLink = !lockStudio || hasLibrary;

    return (
      <nav className="flex items-center gap-4 text-sm">
        <Link
          href="/my/continue-reading"
          className="text-[var(--reader-muted)] transition-colors hover:text-[var(--reader-terracotta)]"
        >
          Lanjutkan Baca
        </Link>
        <Link
          href="/my/highlights"
          className="text-[var(--reader-muted)] transition-colors hover:text-[var(--reader-terracotta)]"
        >
          Highlight Saya
        </Link>
        {showStudioLink && (
          <Link
            href="/dashboard"
            className="font-medium text-[var(--reader-foreground)] transition-colors hover:text-[var(--reader-terracotta)]"
          >
            Studio Saya
          </Link>
        )}
        <a
          href="/auth/logout"
          className="text-[var(--reader-muted)] transition-colors hover:text-[var(--reader-terracotta)]"
        >
          Keluar
        </a>
      </nav>
    );
  }

  // "Masuk" -> balik ke halaman reader yang sedang dibuka setelah login,
  // TIDAK lewat /dashboard sama sekali — supaya pembaca murni yang belum
  // punya Library tidak ke-paksa proses onboarding (LibraryGuard cuma
  // dipasang di /dashboard, jadi menghindarinya = tetap di reader).
  // "Untuk Penulis" -> eksplisit ke /dashboard, yang sudah otomatis benar:
  // LibraryGuard arahkan ke /onboarding (belum punya Library) atau
  // langsung tampilkan dashboard (sudah punya).
  const readerLoginHref = `/auth/login?next=${encodeURIComponent(pathname || '/')}`;

  return (
    <nav className="flex items-center gap-3 text-sm">
      <a
        href={readerLoginHref}
        className="text-[var(--reader-muted)] transition-colors hover:text-[var(--reader-terracotta)]"
      >
        Masuk
      </a>
      {!lockStudio && (
        <a
          href="/auth/login?next=/dashboard"
          className="rounded-full bg-[var(--reader-terracotta)] px-4 py-1.5 font-medium text-[var(--reader-terracotta-foreground)] transition-opacity hover:opacity-90"
        >
          Untuk Penulis
        </a>
      )}
    </nav>
  );
}
