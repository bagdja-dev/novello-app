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
import type { PlatformConfigDto } from './public-types';

const API_BASE = process.env.NEXT_PUBLIC_NOVELO_API_URL ?? 'http://localhost:5020';

/**
 * Default SAMA PERSIS dengan seed awal `platform_config` di backend
 * (migration 20260909020000_platform_config.sql) — dipakai kalau
 * `GET /public/config` gagal dimuat, supaya tampilan tetap identik dengan
 * sebelum fitur ini ada (bukan layar rusak/kosong).
 */
const PLATFORM_CONFIG_FALLBACK: PlatformConfigDto = {
  title: 'Novelo',
  logo: null,
  colors: {
    bg: '#fbf6ee',
    surface: '#fffdf8',
    foreground: '#2c2114',
    muted: '#7a6c57',
    border: '#e6d9c3',
    terracotta: '#c1502e',
    terracottaForeground: '#fdf8f0',
    mustard: '#d79a2c',
    olive: '#6b7a4c',
  },
  lockStudio: false,
};

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

/**
 * Wrapper `publicFetch('/public/config')` dengan fallback aman (lihat
 * `PLATFORM_CONFIG_FALLBACK` di atas) — pemanggil TIDAK PERLU cek `null`,
 * selalu dapat object lengkap. Dipakai `(reader)/layout.tsx` (title/logo/
 * colors) dan halaman onboarding (`lockStudio`).
 */
export async function getPlatformConfig(): Promise<PlatformConfigDto> {
  const config = await publicFetch<Partial<PlatformConfigDto>>('/public/config');
  if (!config) return PLATFORM_CONFIG_FALLBACK;
  return {
    title: config.title || PLATFORM_CONFIG_FALLBACK.title,
    logo: config.logo ?? PLATFORM_CONFIG_FALLBACK.logo,
    colors: { ...PLATFORM_CONFIG_FALLBACK.colors, ...config.colors },
    lockStudio: config.lockStudio ?? PLATFORM_CONFIG_FALLBACK.lockStudio,
  };
}
