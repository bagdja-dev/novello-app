/**
 * Daftar genre untuk filter chip di katalog pusat. Kontrak backend
 * (`GET /public/catalog?genre=`) menerima genre sebagai string bebas — belum
 * ada endpoint daftar genre tersedia, jadi daftar ini kurasi statis sisi
 * frontend (genre umum cerita/novel berseri). Update di sini kalau backend
 * suatu saat menyediakan endpoint daftar genre resmi.
 */
export const READER_GENRES: string[] = [
  'Romance',
  'Fantasi',
  'Fiksi Ilmiah',
  'Misteri',
  'Horor',
  'Thriller',
  'Drama',
  'Aksi',
  'Komedi',
  'Slice of Life',
];
