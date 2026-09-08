'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { LoadingSpinner } from '@/components/loading-spinner';
import { CoverImageUpload } from '@/components/cover-image-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useLibrary } from '@/hooks/use-library';
import { apiClient, ApiError, slugify } from '@/lib/api-client';
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
  const [coverUploading, setCoverUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

            <CoverImageUpload
              id="cover"
              label="Cover Library (opsional)"
              folder="libraries"
              value={coverUrl}
              onChange={setCoverUrl}
              disabled={submitting}
              onUploadingChange={setCoverUploading}
            />

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
