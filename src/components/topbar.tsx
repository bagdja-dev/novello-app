'use client';

import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import type { Library } from '@/lib/types';

export function Topbar({ library }: { library: Library }) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6">
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">{library.nama}</span>
        <span className="text-xs text-muted-foreground">/{library.slug}</span>
      </div>

      <div className="flex items-center gap-3">
        {user?.email && (
          <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
        )}
        <Button variant="outline" size="sm" asChild>
          <a href="/auth/logout">
            <LogOut className="h-4 w-4" />
            Keluar
          </a>
        </Button>
      </div>
    </header>
  );
}
