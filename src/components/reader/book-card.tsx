import Link from 'next/link';

import { BOOK_STATUS_LABEL } from '@/lib/status';
import { BOOK_TYPE_BADGE_LABEL, formatBookByline } from '@/lib/book-byline';
import type { BookCatalogDto } from '@/lib/public-types';

const STATUS_DOT: Record<BookCatalogDto['status'], string> = {
  draft: 'bg-[var(--reader-muted)]',
  ongoing: 'bg-[var(--reader-olive)]',
  completed: 'bg-[var(--reader-terracotta)]',
};

/** Card Book dipakai di katalog pusat & grid profil Library. */
export function BookCard({ book }: { book: BookCatalogDto }) {
  return (
    <Link
      href={`/book/${book.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-[var(--reader-border)] bg-[var(--reader-surface)] transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--reader-bg)]">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- cover berasal dari domain bebas (URL teks penulis), publicFetch tidak lewat next/image loader config
          <img
            src={book.coverUrl}
            alt={book.judul}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-[var(--reader-muted)]" style={{ fontFamily: 'var(--font-source-serif)' }}>
            {book.judul.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3
          className="line-clamp-2 text-sm font-semibold text-[var(--reader-foreground)]"
          style={{ fontFamily: 'var(--font-source-serif)' }}
        >
          {book.judul}
        </h3>
        <p className="text-xs text-[var(--reader-muted)]">{formatBookByline(book)}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {book.bookType !== 'original' && (
            <span className="rounded-full bg-[var(--reader-terracotta)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--reader-terracotta)]">
              {BOOK_TYPE_BADGE_LABEL[book.bookType]}
            </span>
          )}
          {book.genre && (
            <span className="rounded-full bg-[var(--reader-bg)] px-2 py-0.5 text-[11px] text-[var(--reader-muted)]">
              {book.genre.nama}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-[var(--reader-muted)]">
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[book.status]}`} />
            {BOOK_STATUS_LABEL[book.status]}
          </span>
        </div>
      </div>
    </Link>
  );
}
