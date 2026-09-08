/**
 * Kontrak endpoint PUBLIK `novelo-api` (prefix `/public/`) — lihat
 * plan/novelo/execution-plan.md Fase 2. JANGAN diubah sepihak dari sisi
 * reader; kontrak ini disepakati bersama backend (dikerjakan paralel).
 *
 * Dipisah dari `lib/types.ts` (kontrak authenticated Studio) karena bentuk
 * DTO publik beda — sudah termasuk relasi `library`/`chapters` yang di-embed,
 * bukan foreign key mentah.
 */
import type { BookStatus } from './types';

/** Kontrak `GET /public/genres` — daftar genre resmi dari database (bukan lagi hardcode frontend). */
export interface GenreDto {
  id: string;
  nama: string;
  slug: string;
}

export interface BookCatalogDto {
  id: string;
  judul: string;
  slug: string;
  sinopsis: string | null;
  genre: GenreDto | null;
  coverUrl: string | null;
  status: BookStatus;
  library: {
    nama: string;
    slug: string;
  };
}

export interface CatalogResponse {
  items: BookCatalogDto[];
  total: number;
  page: number;
  limit: number;
}

export interface LibraryProfileDto {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string | null;
  coverUrl: string | null;
  createdAt: string;
  books: BookCatalogDto[];
}

export interface BookChapterSummary {
  id: string;
  judul: string;
  orderIndex: number;
  publishedAt: string | null;
}

export interface BookDetailDto {
  id: string;
  judul: string;
  slug: string;
  sinopsis: string | null;
  genre: GenreDto | null;
  coverUrl: string | null;
  status: BookStatus;
  library: {
    nama: string;
    slug: string;
  };
  chapters: BookChapterSummary[];
}

export interface ChapterReadDto {
  id: string;
  judul: string;
  konten: string;
  orderIndex: number;
  publishedAt: string | null;
  book: {
    // `id` ditambahkan backend di Fase 3 — dibutuhkan reader untuk memanggil
    // `PUT /reading-progress` (butuh `bookId`). Backend mungkin belum kirim
    // field ini saat kode ini ditulis; tetap dideklarasikan sesuai kontrak.
    id: string;
    judul: string;
    slug: string;
  };
  prevOrderIndex: number | null;
  nextOrderIndex: number | null;
}
