'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import type { MyHighlightDto } from '@/lib/reader-types';

/**
 * Halaman "Highlight Saya" — sengaja BUKAN di bawah `/dashboard` (layout
 * dashboard punya `LibraryGuard` yang maksa onboarding bikin Library, salah
 * untuk pembaca murni yang belum tentu jadi penulis). Client component
 * murni: kalau belum login, redirect ke `/auth/login?next=/my/highlights`.
 */
export default function MyHighlightsPage() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [highlights, setHighlights] = useState<MyHighlightDto[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiClient<MyHighlightDto[]>('/highlights');
      setHighlights(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[MyHighlightsPage] gagal memuat highlight:', err);
      setHighlights([]);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.replace('/auth/login?next=/my/highlights');
      return;
    }
    load();
  }, [authLoading, isLoggedIn, router, load]);

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await apiClient(`/highlights/${id}`, { method: 'DELETE' });
      setHighlights((prev) => (prev ? prev.filter((h) => h.id !== id) : prev));
    } catch (err) {
      console.error('[MyHighlightsPage] gagal hapus highlight:', err);
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading || !isLoggedIn) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-[var(--reader-muted)] sm:px-6">Memuat…</div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1
        className="mb-6 text-2xl font-semibold text-[var(--reader-foreground)] sm:text-3xl"
        style={{ fontFamily: 'var(--font-source-serif)' }}
      >
        Highlight Saya
      </h1>

      {highlights === null ? (
        <p className="text-sm text-[var(--reader-muted)]">Memuat highlight…</p>
      ) : highlights.length === 0 ? (
        <p className="rounded-lg border border-[var(--reader-border)] bg-[var(--reader-surface)] px-4 py-8 text-center text-sm text-[var(--reader-muted)]">
          Belum ada highlight. Pilih teks saat membaca chapter untuk membuat highlight.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--reader-border)] overflow-hidden rounded-lg border border-[var(--reader-border)] bg-[var(--reader-surface)]">
          {highlights.map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <Link href={`/book/${h.book.slug}/chapter/${h.chapter.orderIndex}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--reader-foreground)]">
                  {h.book.judul} — Bab {h.chapter.orderIndex}. {h.chapter.judul}
                </p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-[var(--reader-muted)]">
                  {formatDate(h.createdAt)}
                  {h.isStale && (
                    <span className="rounded-full bg-[var(--reader-mustard)]/20 px-2 py-0.5 text-[11px] font-medium text-[var(--reader-mustard)]">
                      sudah direvisi
                    </span>
                  )}
                </p>
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(h.id)}
                disabled={deletingId === h.id}
                aria-label="Hapus highlight"
                className="shrink-0 rounded-full p-2 text-[var(--reader-muted)] transition-colors hover:bg-[var(--reader-bg)] hover:text-[var(--reader-terracotta)] disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
