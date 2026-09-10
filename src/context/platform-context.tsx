'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { PlatformProfileDto } from '@/lib/public-types';

/**
 * Platform yang sedang diakses (hasil resolusi `middleware.ts` dari Host) +
 * branding-nya — di-mount SEKALI di root layout (`src/app/layout.tsx`),
 * membungkus seluruh app (reader, dashboard, onboarding). Mirror pola
 * `LibraryContext` (`context/library-context.tsx`).
 */
interface PlatformContextValue {
  slug: string;
  config: PlatformProfileDto;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({
  slug,
  config,
  children,
}: {
  slug: string;
  config: PlatformProfileDto;
  children: ReactNode;
}) {
  return <PlatformContext.Provider value={{ slug, config }}>{children}</PlatformContext.Provider>;
}

export function usePlatformContext(): PlatformContextValue {
  const value = useContext(PlatformContext);
  if (!value) {
    throw new Error('usePlatformContext dipanggil di luar PlatformProvider (root layout).');
  }
  return value;
}
