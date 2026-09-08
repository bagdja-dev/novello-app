'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { Library } from '@/lib/types';

/**
 * Library milik user login — hanya tersedia di dalam `/dashboard` (sudah
 * lolos onboarding guard di dashboard/layout.tsx, jadi `library` di sini
 * selalu non-null).
 */
const LibraryContext = createContext<Library | null>(null);

export function LibraryProvider({
  library,
  children,
}: {
  library: Library;
  children: ReactNode;
}) {
  return <LibraryContext.Provider value={library}>{children}</LibraryContext.Provider>;
}

export function useLibraryContext(): Library {
  const library = useContext(LibraryContext);
  if (!library) {
    throw new Error('useLibraryContext dipanggil di luar LibraryProvider (dashboard layout).');
  }
  return library;
}
