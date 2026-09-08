/**
 * Kontrak `novelo-api` — lihat plan/novelo/execution-plan.md Fase 0.
 * JANGAN diubah sepihak dari sisi Studio; kontrak ini disepakati bersama
 * backend (dikerjakan paralel).
 */
export interface Library {
  id: string;
  ownerUserId: string;
  nama: string;
  slug: string;
  deskripsi: string | null;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLibraryPayload {
  nama: string;
  slug: string;
  deskripsi?: string;
  coverUrl?: string;
}
