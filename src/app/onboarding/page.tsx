'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useLibrary } from '@/hooks/use-library';
import { apiClient, ApiError, slugify } from '@/lib/api-client';
import { uploadImage, UploadImageError } from '@/lib/upload-image';
import type { CreateLibraryPayload, Library } from '@/lib/types';

function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/auth/login?next=/onboarding');
    }
  }, [loading, isLoggedIn, router]);

  if (loading || !isLoggedIn) {
    return <LoadingSpinner label="Memeriksa sesi login…" />;
  }

  return <>{children}</>;
}

function OnboardingForm() {
  const router = useRouter();
  const { library, loading: libraryLoading, error: libraryError } = useLibrary();

  const [nama, setNama] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [deskripsi, setDeskripsi] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Preview object URL (dari file lokal sebelum upload selesai) harus di-
  // revoke saat komponen unmount supaya tidak bocor memory.
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  // Sudah punya Library (mis. buka /onboarding lagi lewat back button) →
  // tidak perlu isi form lagi, langsung ke dashboard.
  useEffect(() => {
    if (!libraryLoading && library) {
      router.replace('/dashboard');
    }
  }, [libraryLoading, library, router]);

  function handleNamaChange(value: string) {
    setNama(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(slugify(value));
  }

  async function handleCoverFile(file: File | null) {
    if (!file) return;
    setCoverError('');

    // Preview lokal dulu supaya user langsung lihat gambar terpilih sambil
    // menunggu upload — ganti object URL lama kalau ada (mis. user pilih
    // ulang file lain sebelum upload sebelumnya selesai).
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    const localPreview = URL.createObjectURL(file);
    setCoverPreview(localPreview);

    setCoverUploading(true);
    try {
      const result = await uploadImage(file, 'libraries');
      setCoverUrl(result.url);
    } catch (err) {
      setCoverPreview(null);
      URL.revokeObjectURL(localPreview);
      const message = err instanceof UploadImageError ? err.message : 'Gagal mengunggah cover.';
      setCoverError(message);
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  }

  function handleCoverRemove() {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setCoverUrl('');
    setCoverError('');
    if (coverInputRef.current) coverInputRef.current.value = '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!nama.trim() || !slug.trim()) {
      toast.error('Nama dan slug Library wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateLibraryPayload = {
        nama: nama.trim(),
        slug: slug.trim(),
        ...(deskripsi.trim() ? { deskripsi: deskripsi.trim() } : {}),
        ...(coverUrl.trim() ? { coverUrl: coverUrl.trim() } : {}),
      };
      await apiClient<Library>('/libraries', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      toast.success('Library berhasil dibuat.');
      router.replace('/dashboard');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Gagal membuat Library. Coba lagi.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (libraryLoading) {
    return <LoadingSpinner label="Memeriksa Library…" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Buat Library kamu</CardTitle>
          <CardDescription>
            Library adalah ruang kerja penulis di Novelo — tempat kamu mengelola semua Book
            & Chapter. Isi detail berikut untuk memulai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {libraryError && (
            <p className="mb-4 text-sm text-destructive">
              Gagal memuat status Library: {libraryError}
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nama">Nama Library</Label>
              <Input
                id="nama"
                value={nama}
                onChange={(e) => handleNamaChange(e.target.value)}
                placeholder="mis. Rumah Cerita Nandang"
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
                placeholder="rumah-cerita-nandang"
                required
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground">
                Otomatis dibuat dari nama, tapi bisa diedit manual. Dipakai di URL profil
                Library.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="deskripsi">Deskripsi (opsional)</Label>
              <Textarea
                id="deskripsi"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Ceritakan sedikit tentang Library kamu…"
                disabled={submitting}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cover">Cover Library (opsional)</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-input bg-muted">
                  {coverPreview || coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverPreview || coverUrl}
                      alt="Preview cover Library"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      className="h-8 w-8 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <input
                    id="cover"
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={submitting || coverUploading}
                    onChange={(e) => void handleCoverFile(e.target.files?.[0] ?? null)}
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={submitting || coverUploading}
                      onClick={() => coverInputRef.current?.click()}
                    >
                      {coverUploading ? 'Mengunggah…' : coverUrl ? 'Ganti Cover' : 'Pilih Gambar'}
                    </Button>
                    {(coverUrl || coverPreview) && !coverUploading && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={submitting}
                        onClick={handleCoverRemove}
                        className="text-destructive hover:text-destructive"
                      >
                        Hapus
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP, atau GIF — maks. 5 MB
                  </p>
                  {coverError && <p className="text-xs text-destructive">{coverError}</p>}
                </div>
              </div>
            </div>

            <Button type="submit" disabled={submitting || coverUploading} className="mt-2">
              {submitting ? 'Menyimpan…' : coverUploading ? 'Menunggu upload cover…' : 'Buat Library'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingForm />
    </AuthGuard>
  );
}
