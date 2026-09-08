'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLibraryContext } from '@/context/library-context';

export default function DashboardIndexPage() {
  const library = useLibraryContext();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <BookOpen className="h-6 w-6" />
      </div>
      <h1 className="text-lg font-semibold">Selamat datang di {library.nama}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Kelola Book & Chapter kamu di sini — mulai dari membuat Book baru sampai menulis dan
        menerbitkan Chapter.
      </p>
      <Button asChild className="mt-1">
        <Link href="/dashboard/books">Kelola Book</Link>
      </Button>
    </div>
  );
}
