'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient, ApiError } from '@/lib/api-client';
import type { Library } from '@/lib/types';

/**
 * `GET /libraries/me` mengembalikan `200` dengan body `null` kalau user
 * belum punya Library (BUKAN 404) — lihat plan/novelo/execution-plan.md
 * Fase 0. `library === null` (sudah selesai loading, tidak error) berarti
 * "belum onboarding", beda dengan `library === undefined` (belum tahu / masih
 * loading).
 */
export function useLibrary() {
  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<Library | null>('/libraries/me');
      setLibrary(data ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat data Library');
      setLibrary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { library, loading, error, refetch };
}
