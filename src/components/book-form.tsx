'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { CoverImageUpload } from '@/components/cover-image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { slugify } from '@/lib/api-client';
import { publicFetch } from '@/lib/public-api';
import type { GenreDto } from '@/lib/public-types';

export interface BookFormValues {
  judul: string;
  slug: string;
  sinopsis: string;
  genreId: string;
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
 *
 * Genre diambil dari `GET /public/genres` (endpoint publik, tanpa auth) —
 * bukan lagi hardcode di frontend. Value yang dikirim ke backend adalah
 * `genreId` (UUID), bukan nama genre bebas.
 */
export function BookForm({ mode, initialValues, submitting, submitLabel, onSubmit }: BookFormProps) {
  const [judul, setJudul] = useState(initialValues?.judul ?? '');
  const [slug, setSlug] = useState(initialValues?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [sinopsis, setSinopsis] = useState(initialValues?.sinopsis ?? '');
  const [genreId, setGenreId] = useState(initialValues?.genreId ?? '');
  const [coverUrl, setCoverUrl] = useState(initialValues?.coverUrl ?? '');
  const [coverUploading, setCoverUploading] = useState(false);

  const [genres, setGenres] = useState<GenreDto[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    publicFetch<GenreDto[]>('/public/genres').then((data) => {
      if (!cancelled) setGenres(data ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
      genreId,
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
        <Select
          value={genreId || undefined}
          onValueChange={(value) => setGenreId(value)}
          disabled={submitting || !genres}
        >
          <SelectTrigger id="genre" className="w-full">
            <SelectValue placeholder={genres ? 'Pilih genre (opsional)' : 'Memuat genre…'} />
          </SelectTrigger>
          <SelectContent>
            {(genres ?? []).map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {genres && genres.length === 0 && (
          <p className="text-xs text-muted-foreground">Belum ada genre tersedia.</p>
        )}
      </div>

      <CoverImageUpload
        id="coverUrl"
        label="Cover Book (opsional)"
        folder="books"
        value={coverUrl}
        onChange={setCoverUrl}
        disabled={submitting}
        onUploadingChange={setCoverUploading}
        previewWidth={96}
        previewHeight={144}
      />

      <Button type="submit" disabled={submitting || coverUploading} className="mt-2">
        {submitting ? 'Menyimpan…' : coverUploading ? 'Menunggu upload cover…' : submitLabel}
      </Button>
    </form>
  );
}
