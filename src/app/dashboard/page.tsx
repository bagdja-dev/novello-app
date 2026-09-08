'use client';

import { BookOpen } from 'lucide-react';

import { useLibraryContext } from '@/context/library-context';

// Fase 0 — shell dashboard kosong. Kelola Book & Chapter sungguhan mulai
// Fase 1 (lihat plan/novelo/execution-plan.md).
export default function DashboardIndexPage() {
  const library = useLibraryContext();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <BookOpen className="h-6 w-6" />
      </div>
      <h1 className="text-lg font-semibold">Selamat datang di {library.nama}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Fase 1: kelola Book & Chapter segera hadir.
      </p>
    </div>
  );
}
