'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { slugify } from '@/lib/api-client';

const GENRE_SUGGESTIONS = [
  'Romance',
  'Fantasi',
  'Fiksi Ilmiah',
  'Horor',
  'Misteri',
  'Aksi',
  'Drama',
  'Komedi',
  'Slice of Life',
  'Non-Fiksi',
];

export interface BookFormValues {
  judul: string;
  slug: string;
  sinopsis: string;
  genre: string;
  coverUrl: string;
}

interface BookFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<BookFormValues>;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: BookFormValues) => void | Promise<void>;
}

/**
 * Form Book — dipakai untuk create & edit (satu komponen dua mode), lihat
 * plan/novelo/execution-plan.md Fase 1. Logic slugify persis pola form
 * onboarding Library (src/app/onboarding/page.tsx): slug auto-generate dari
 * judul selama belum disentuh manual.
 *
 * Slug hanya bisa diisi/diedit saat create — kontrak `PATCH /books/:id`
 * TIDAK menerima `slug`, jadi di mode edit field-nya read-only.
 */
export function BookForm({ mode, initialValues, submitting, submitLabel, onSubmit }: BookFormProps) {
  const [judul, setJudul] = useState(initialValues?.judul ?? '');
  const [slug, setSlug] = useState(initialValues?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [sinopsis, setSinopsis] = useState(initialValues?.sinopsis ?? '');
  const [genre, setGenre] = useState(initialValues?.genre ?? '');
  const [coverUrl, setCoverUrl] = useState(initialValues?.coverUrl ?? '');

  function handleJudulChange(value: string) {
    setJudul(value);
    if (mode === 'create' && !slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(slugify(value));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void onSubmit({
      judul: judul.trim(),
      slug: slug.trim(),
      sinopsis: sinopsis.trim(),
      genre: genre.trim(),
      coverUrl: coverUrl.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="judul">Judul Book</Label>
        <Input
          id="judul"
          value={judul}
          onChange={(e) => handleJudulChange(e.target.value)}
          placeholder="mis. Bayang di Antara Bintang"
          required
          disabled={submitting}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="bayang-di-antara-bintang"
          required
          disabled={submitting || mode === 'edit'}
        />
        <p className="text-xs text-muted-foreground">
          {mode === 'create'
            ? 'Otomatis dibuat dari judul, tapi bisa diedit manual. Dipakai di URL Book.'
            : 'Slug tidak bisa diubah setelah Book dibuat.'}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="sinopsis">Sinopsis</Label>
        <Textarea
          id="sinopsis"
          value={sinopsis}
          onChange={(e) => setSinopsis(e.target.value)}
          placeholder="Ceritakan sedikit tentang Book kamu…"
          disabled={submitting}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="genre">Genre</Label>
        <Input
          id="genre"
          list="genre-suggestions"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="mis. Fantasi"
          disabled={submitting}
        />
        <datalist id="genre-suggestions">
          {GENRE_SUGGESTIONS.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="coverUrl">Cover URL (opsional)</Label>
        <Input
          id="coverUrl"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://…"
          disabled={submitting}
        />
        <p className="text-xs text-muted-foreground">
          Tempel URL gambar cover — upload langsung akan tersedia di fase berikutnya.
        </p>
      </div>

      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? 'Menyimpan…' : submitLabel}
      </Button>
    </form>
  );
}
