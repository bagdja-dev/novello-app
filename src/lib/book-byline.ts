import type { BookType } from './types';

interface BookByline {
  bookType: BookType;
  originalAuthor: string | null;
  library: { nama: string };
}

export const BOOK_TYPE_BADGE_LABEL: Record<Exclude<BookType, 'original'>, string> = {
  translation: 'Terjemahan',
  adaptation: 'Adaptasi',
};

/**
 * Prefix byline SEBELUM nama Library — "oleh" untuk karya original
 * (perilaku lama, tidak berubah), atau "oleh {originalAuthor} ·
 * diterjemahkan/diadaptasi oleh" kalau bookType bukan 'original' DAN
 * originalAuthor terisi (field ini opsional, jadi tetap fallback ke prefix
 * lama kalau kosong). Nama Library SENGAJA tidak diikutkan di sini —
 * pemanggil yang menempelkannya sendiri (kadang perlu jadi `<Link>`
 * terpisah ke profil Library, kadang cukup teks polos).
 */
export function formatBookBylinePrefix(book: Omit<BookByline, 'library'>): string {
  if (book.bookType === 'original' || !book.originalAuthor) {
    return 'oleh';
  }
  const verb = book.bookType === 'translation' ? 'diterjemahkan' : 'diadaptasi';
  return `oleh ${book.originalAuthor} · ${verb} oleh`;
}

/** Byline lengkap sebagai satu string polos (tanpa Link) — dipakai di tempat yang tidak butuh nama Library jadi link terpisah. */
export function formatBookByline(book: BookByline): string {
  return `${formatBookBylinePrefix(book)} ${book.library.nama}`;
}
