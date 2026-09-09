'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { LibraryProvider, useLibraryContext } from '@/context/library-context';
import { useAuth } from '@/hooks/use-auth';
import { useLibrary } from '@/hooks/use-library';
import { getPlatformConfig } from '@/lib/public-api';

function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/auth/login?next=/dashboard');
    }
  }, [loading, isLoggedIn, router]);

  if (loading || !isLoggedIn) {
    return <LoadingSpinner label="Memeriksa sesi login…" />;
  }

  return <>{children}</>;
}

/**
 * Kriteria E2E Fase 0 (plan/novelo/execution-plan.md): user login tanpa
 * Library harus diarahkan ke onboarding sebelum bisa melihat dashboard.
 * `GET /libraries/me` balas `200` body `null` (bukan 404) kalau belum ada —
 * lihat hooks/use-library.ts.
 */
function LibraryGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { library, loading, error, refetch } = useLibrary();

  useEffect(() => {
    if (!loading && !error && !library) {
      router.replace('/onboarding');
    }
  }, [loading, error, library, router]);

  if (loading) {
    return <LoadingSpinner label="Memuat Library…" />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-sm text-sm text-destructive">Gagal memuat Library: {error}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Coba lagi
        </Button>
      </div>
    );
  }

  if (!library) {
    // Redirect ke /onboarding sedang berjalan (lihat useEffect di atas).
    return <LoadingSpinner label="Mengalihkan ke onboarding…" />;
  }

  return <LibraryProvider library={library}>{children}</LibraryProvider>;
}

// Sidebar & Topbar sama-sama butuh title/logo platform_config — di-fetch
// SEKALI di sini (bukan masing-masing komponen) supaya tidak ada 2 request
// terpisah untuk data yang identik. Default sama dengan
// PLATFORM_CONFIG_FALLBACK, cukup sebagai nilai awal sebelum config kebaca.
function DashboardShell({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState({ title: 'Novelo', logo: null as string | null });

  useEffect(() => {
    getPlatformConfig().then((config) => setBranding({ title: config.title, logo: config.logo }));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar title={branding.title} logo={branding.logo} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopbar title={branding.title} logo={branding.logo} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

// Dipisah supaya bisa memanggil useLibraryContext() setelah LibraryProvider
// terpasang (Topbar butuh data Library untuk header).
function DashboardTopbar({ title, logo }: { title: string; logo: string | null }) {
  const library = useLibraryContext();
  return <Topbar library={library} title={title} logo={logo} />;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <LibraryGuard>
        <DashboardShell>{children}</DashboardShell>
      </LibraryGuard>
    </AuthGuard>
  );
}
