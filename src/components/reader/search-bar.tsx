'use client';

import { useEffect, useRef, useState } from 'react';

const SEARCH_BY_OPTIONS = [
  { value: 'judul', label: 'Judul', placeholder: 'Cari judul cerita…' },
  { value: 'library', label: 'Penulis', placeholder: 'Cari nama penulis…' },
  { value: 'originalAuthor', label: 'Penulis Asli', placeholder: 'Cari penulis asli…' },
] as const;

/**
 * Search bar header — dropdown scope (Judul/Penulis/Penulis Asli) DI DALAM
 * kotak pencarian (bukan elemen terpisah), custom-styled (BUKAN `<select>`
 * bawaan browser). Placeholder input ikut berubah sesuai scope terpilih.
 *
 * Tetap form GET native (`action="/"`, field `search` + hidden `searchBy`)
 * — custom dropdown cuma menyinkronkan value hidden input itu via JS,
 * submit-nya sendiri tidak butuh client-side routing (konsisten pola lama).
 * Client Component (perlu state buka/tutup dropdown) — tapi sengaja TANPA
 * import library dropdown/icon baru (ikon panah = inline SVG) supaya
 * bundle rute reader tetap ringan, sesuai prinsip di overview.md §5.
 */
export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [searchBy, setSearchBy] = useState<(typeof SEARCH_BY_OPTIONS)[number]>(SEARCH_BY_OPTIONS[0]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <form
      ref={formRef}
      action="/"
      method="get"
      className="relative order-3 flex w-full items-center rounded-full border border-[var(--reader-border)] bg-[var(--reader-bg)] focus-within:ring-2 focus-within:ring-[var(--reader-terracotta)]/40 sm:order-none sm:max-w-md sm:flex-1"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex shrink-0 items-center gap-1 rounded-l-full border-r border-[var(--reader-border)] py-1.5 pl-4 pr-2.5 text-xs font-medium text-[var(--reader-muted)] transition-colors hover:text-[var(--reader-terracotta)]"
      >
        {searchBy.label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <input
        type="search"
        name="search"
        placeholder={searchBy.placeholder}
        className="w-full min-w-0 flex-1 bg-transparent px-3 py-1.5 text-sm text-[var(--reader-foreground)] placeholder:text-[var(--reader-muted)] focus:outline-none"
      />
      <input type="hidden" name="searchBy" value={searchBy.value} />

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-20 w-40 overflow-hidden rounded-lg border border-[var(--reader-border)] bg-[var(--reader-surface)] py-1 shadow-lg"
        >
          {SEARCH_BY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === searchBy.value}
              onClick={() => {
                setSearchBy(opt);
                setOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-left text-sm transition-colors ${
                opt.value === searchBy.value
                  ? 'font-medium text-[var(--reader-terracotta)]'
                  : 'text-[var(--reader-foreground)] hover:bg-[var(--reader-bg)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
