import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

import { publicFetch } from '@/lib/public-api';
import type { ChapterReadDto } from '@/lib/public-types';

interface ChapterPageProps {
  params: Promise<{ slug: string; orderIndex: string }>;
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { slug, orderIndex } = await params;
  const chapter = await publicFetch<ChapterReadDto>(`/public/books/${slug}/chapters/${orderIndex}`);
  if (!chapter) {
    return { title: 'Chapter tidak ditemukan — Novelo' };
  }
  return {
    title: `${chapter.judul} — ${chapter.book.judul} — Novelo`,
  };
}

// Kolom teks baca — max-width dibatasi (~680px, ekuivalen 65-75
// karakter/baris pada font serif ukuran ini), font serif jadi hero, line-
// height lega. TIDAK ada toolbar tema/ukuran font/highlight — itu Fase 3.
export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug, orderIndex } = await params;
  const chapter = await publicFetch<ChapterReadDto>(`/public/books/${slug}/chapters/${orderIndex}`);

  if (!chapter) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[680px] px-4 py-8 sm:px-6">
      <Link
        href={`/book/${slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--reader-muted)] hover:text-[var(--reader-terracotta)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {chapter.book.judul}
      </Link>

      <h1
        className="mb-8 text-2xl font-semibold text-[var(--reader-foreground)] sm:text-3xl"
        style={{ fontFamily: 'var(--font-source-serif)' }}
      >
        {chapter.orderIndex}. {chapter.judul}
      </h1>

      <div
        className="chapter-content text-[1.0625rem] leading-[1.9] text-[var(--reader-foreground)]"
        style={{ fontFamily: 'var(--font-source-serif)' }}
        dangerouslySetInnerHTML={{ __html: chapter.konten }}
      />

      <nav className="mt-12 flex items-center justify-between gap-4 border-t border-[var(--reader-border)] pt-6">
        {chapter.prevOrderIndex !== null ? (
          <Link
            href={`/book/${slug}/chapter/${chapter.prevOrderIndex}`}
            className="flex items-center gap-1.5 rounded-full border border-[var(--reader-border)] bg-[var(--reader-surface)] px-4 py-2 text-sm text-[var(--reader-foreground)] transition-colors hover:border-[var(--reader-terracotta)] hover:text-[var(--reader-terracotta)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </Link>
        ) : (
          <span />
        )}

        {chapter.nextOrderIndex !== null && (
          <Link
            href={`/book/${slug}/chapter/${chapter.nextOrderIndex}`}
            className="flex items-center gap-1.5 rounded-full bg-[var(--reader-terracotta)] px-4 py-2 text-sm font-medium text-[var(--reader-terracotta-foreground)] transition-opacity hover:opacity-90"
          >
            Berikutnya
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </nav>
    </div>
  );
}
