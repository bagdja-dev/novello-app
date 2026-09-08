'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, ArrowUp, ArrowDown, FileText, Pencil, Plus } from 'lucide-react';

import { LoadingSpinner } from '@/components/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient, ApiError } from '@/lib/api-client';
import { BOOK_STATUS_LABEL, BOOK_STATUS_VARIANT, CHAPTER_STATUS_LABEL, CHAPTER_STATUS_VARIANT } from '@/lib/status';
import type { Book, Chapter, ReorderChapterPayload } from '@/lib/types';

function ChapterRow({
  chapter,
  index,
  total,
  bookId,
  onMove,
  moving,
}: {
  chapter: Chapter;
  index: number;
  total: number;
  bookId: string;
  onMove: (index: number, direction: -1 | 1) => void;
  moving: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
      <span className="w-6 shrink-0 text-sm text-muted-foreground">{index + 1}</span>

      <Link
        href={`/dashboard/books/${bookId}/chapters/${chapter.id}`}
        className="flex flex-1 items-center gap-2 truncate text-sm font-medium hover:underline"
      >
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{chapter.judul}</span>
      </Link>

      <Badge variant={CHAPTER_STATUS_VARIANT[chapter.status]}>
        {CHAPTER_STATUS_LABEL[chapter.status]}
      </Badge>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={moving || index === 0}
          title="Pindah ke atas"
          onClick={() => onMove(index, -1)}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={moving || index === total - 1}
          title="Pindah ke bawah"
          onClick={() => onMove(index, 1)}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function BookDetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = use(params);
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [creatingChapter, setCreatingChapter] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [bookData, chapterData] = await Promise.all([
          apiClient<Book>(`/books/${bookId}`),
          apiClient<Chapter[]>(`/books/${bookId}/chapters`),
        ]);
        if (!cancelled) {
          setBook(bookData);
          setChapters(chapterData);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Gagal memuat Book');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  async function handleMove(index: number, direction: -1 | 1) {
    if (!chapters) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;

    const reordered = [...chapters];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    const previous = chapters;
    setChapters(reordered);
    setReordering(true);
    try {
      const payload: ReorderChapterPayload = {
        items: reordered.map((c, i) => ({ id: c.id, orderIndex: i })),
      };
      const updated = await apiClient<Chapter[]>(`/books/${bookId}/chapters/reorder`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setChapters(updated);
    } catch (err) {
      setChapters(previous);
      toast.error(err instanceof ApiError ? err.message : 'Gagal mengubah urutan Chapter.');
    } finally {
      setReordering(false);
    }
  }

  async function handleNewChapter() {
    setCreatingChapter(true);
    try {
      const chapter = await apiClient<Chapter>(`/books/${bookId}/chapters`, {
        method: 'POST',
        body: JSON.stringify({ judul: 'Chapter Baru' }),
      });
      router.push(`/dashboard/books/${bookId}/chapters/${chapter.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Gagal membuat Chapter baru.');
    } finally {
      setCreatingChapter(false);
    }
  }

  if (error) {
    return <p className="text-sm text-destructive">Gagal memuat Book: {error}</p>;
  }

  if (!book || !chapters) {
    return <LoadingSpinner label="Memuat Book…" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/books"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Semua Book
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold">{book.judul}</h1>
              <Badge variant={BOOK_STATUS_VARIANT[book.status]}>{BOOK_STATUS_LABEL[book.status]}</Badge>
              {book.genre && <Badge variant="outline">{book.genre.nama}</Badge>}
            </div>
            {book.sinopsis && (
              <p className="max-w-2xl text-sm text-muted-foreground">{book.sinopsis}</p>
            )}
          </div>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/books/${bookId}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit Book
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Chapter ({chapters.length})
          </h2>
          <Button size="sm" disabled={creatingChapter} onClick={handleNewChapter}>
            <Plus className="h-4 w-4" />
            Chapter Baru
          </Button>
        </div>

        {chapters.length === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center">
            <p className="text-sm text-muted-foreground">Belum ada Chapter. Mulai tulis Chapter pertama.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {chapters.map((chapter, index) => (
              <ChapterRow
                key={chapter.id}
                chapter={chapter}
                index={index}
                total={chapters.length}
                bookId={bookId}
                onMove={handleMove}
                moving={reordering}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
