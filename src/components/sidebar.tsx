import { BookOpen, LayoutDashboard } from 'lucide-react';

/**
 * Placeholder Fase 0 — nav Book/Chapter sungguhan baru masuk Fase 1
 * (lihat plan/novelo/execution-plan.md). Sengaja tidak pakai routing
 * aktif dulu, hanya menandai struktur layout dasar studio.
 */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen className="h-4 w-4" />
        </div>
        <span className="font-semibold">Novelo Studio</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground">
          <LayoutDashboard className="h-4 w-4" />
          Book & Chapter
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
            Fase 1
          </span>
        </div>
      </nav>
    </aside>
  );
}
