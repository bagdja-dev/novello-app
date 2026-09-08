'use client';

import Link from 'next/link';

import { useAuth } from '@/hooks/use-auth';

/**
 * Bagian header reader yang bergantung status login — sengaja dipisah jadi
 * client component kecil supaya `app/(reader)/layout.tsx` sendiri tetap
 * Server Component murni (SSR penuh untuk SEO). `useAuth` baca cookie
 * `ns_user` di browser, sama seperti dipakai Topbar Studio.
 */
export function ReaderAuthNav() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div className="h-8 w-28" aria-hidden />;
  }

  if (isLoggedIn) {
    return (
      <nav className="flex items-center gap-4 text-sm">
        <Link
          href="/dashboard"
          className="font-medium text-[var(--reader-foreground)] transition-colors hover:text-[var(--reader-terracotta)]"
        >
          Studio Saya
        </Link>
        <a
          href="/auth/logout"
          className="text-[var(--reader-muted)] transition-colors hover:text-[var(--reader-terracotta)]"
        >
          Keluar
        </a>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-3 text-sm">
      <a
        href="/auth/login"
        className="text-[var(--reader-muted)] transition-colors hover:text-[var(--reader-terracotta)]"
      >
        Masuk
      </a>
      <a
        href="/auth/login"
        className="rounded-full bg-[var(--reader-terracotta)] px-4 py-1.5 font-medium text-[var(--reader-terracotta-foreground)] transition-opacity hover:opacity-90"
      >
        Untuk Penulis
      </a>
    </nav>
  );
}
