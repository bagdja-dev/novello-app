'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import type { ReadingProgressListItemDto } from '@/lib/reader-types';

/**
 * Section "Lanjutkan Baca" di atas grid katalog (`(reader)/page.tsx`).
 * HANYA tampil kalau user login DAN listnya tidak kosong — tidak pernah
 * render skeleton kosong. Render awal (server + first client render) selalu
 * `null` (state login belum diketahui) supaya tidak ada hydration mismatch;
 * section muncul menyusul setelah fetch selesai.
 */
export function ContinueReadingSection() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [items, setItems] = useState<ReadingProgressListItemDto[]>([]);

  useEffect(() => {
    if (authLoading || !isLoggedIn) return;
    let cancelled = false;

    apiClient<ReadingProgressListItemDto[]>('/reading-progress')
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('[ContinueReadingSection] gagal memuat reading progress:', err);
        if (!cancelled) setItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn]);

  if (!isLoggedIn || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2
        className="mb-3 text-lg font-semibold text-[var(--reader-foreground)]"
        style={{ fontFamily: 'var(--font-source-serif)' }}
      >
        Lanjutkan Baca
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link
            key={item.bookId}
            href={`/book/${item.bookSlug}/chapter/${item.lastChapterOrderIndex}`}
            className="group flex w-36 shrink-0 flex-col overflow-hidden rounded-lg border border-[var(--reader-border)] bg-[var(--reader-surface)] transition-shadow hover:shadow-md"
          >
            <div className="aspect-[3/4] w-full overflow-hidden bg-[var(--reader-bg)]">
              {item.bookCoverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- cover dari URL bebas milik penulis
                <img
                  src={item.bookCoverUrl}
                  alt={item.bookJudul}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[var(--reader-muted)]"
                  style={{ fontFamily: 'var(--font-source-serif)' }}
                >
                  {item.bookJudul.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-0.5 p-2">
              <span className="line-clamp-1 text-xs font-semibold text-[var(--reader-foreground)]">
                {item.bookJudul}
              </span>
              <span className="text-[11px] text-[var(--reader-muted)]">Bab {item.lastChapterOrderIndex}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
