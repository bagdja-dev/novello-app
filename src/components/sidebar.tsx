'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Library, Settings } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getPlatformConfig } from '@/lib/public-api';

const NAV_ITEMS = [
  { href: '/dashboard/books', label: 'Book & Chapter', icon: Library },
];

const SETTINGS_ITEM = { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings };

export function Sidebar() {
  const pathname = usePathname();
  // Default 'Novelo' (sama dengan PLATFORM_CONFIG_FALLBACK.title) — cukup
  // sebagai nilai awal sebelum config kebaca, tidak perlu loading state
  // terpisah untuk chrome sidebar internal ini.
  const [platformTitle, setPlatformTitle] = useState('Novelo');

  useEffect(() => {
    getPlatformConfig().then((config) => setPlatformTitle(config.title));
  }, []);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen className="h-4 w-4" />
        </div>
        <span className="font-semibold">{platformTitle} Studio</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href={SETTINGS_ITEM.href}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
            pathname.startsWith(SETTINGS_ITEM.href)
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          )}
        >
          <SETTINGS_ITEM.icon className="h-4 w-4" />
          {SETTINGS_ITEM.label}
        </Link>
      </div>
    </aside>
  );
}
