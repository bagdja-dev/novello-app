/**
 * Public, UNAUTHENTICATED fetch helper untuk rute reader (`(reader)/*`).
 *
 * Beda dari `backendFetch` (lib/backend-api.ts): itu khusus dipanggil dari
 * Route Handler BFF proxy dengan token sesi (httpOnly cookie) untuk rute
 * Studio yang authenticated. Helper ini dipanggil LANGSUNG dari Server
 * Component (SSR/ISR), tanpa Authorization header, tanpa lewat proxy — supaya
 * konten reader ter-render penuh di HTML awal response (SEO, Google crawl
 * langsung tanpa nunggu client-side fetch). Lihat plan/novelo/overview.md §5
 * dan execution-plan.md Fase 2.
 */
const API_BASE = process.env.NEXT_PUBLIC_NOVELO_API_URL ?? 'http://localhost:5020';

/**
 * GET publik ke `novelo-api`. Return `null` kalau 404 ATAU request gagal
 * (network error, backend belum jalan, response bukan JSON, dst) — pemanggil
 * di halaman detail (Library/Book/Chapter) memanggil `notFound()` dari
 * `next/navigation` saat menerima `null`; pemanggil di halaman katalog
 * (list, tidak pernah 404) menampilkan state kosong/error ringan.
 */
export async function publicFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      // ISR — konten publik cukup segar tiap 60 detik, tidak perlu
      // full-dynamic per request seperti rute Studio.
      next: { revalidate: 60 },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      console.error(`[publicFetch] GET ${path} -> ${res.status}: ${res.statusText}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.error(`[publicFetch] GET ${path} failed:`, err);
    return null;
  }
}
