'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { CoverImageUpload } from '@/components/cover-image-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLibraryContext } from '@/context/library-context';
import { apiClient, ApiError } from '@/lib/api-client';
import type { Library, UpdateLibraryPayload } from '@/lib/types';

export default function SettingsPage() {
  const library = useLibraryContext();

  const [nama, setNama] = useState(library.nama);
  const [deskripsi, setDeskripsi] = useState(library.deskripsi ?? '');
  const [coverUrl, setCoverUrl] = useState(library.coverUrl ?? '');
  const [coverUploading, setCoverUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!nama.trim()) {
      toast.error('Nama Library wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: UpdateLibraryPayload = {
        nama: nama.trim(),
        deskripsi: deskripsi.trim(),
        coverUrl: coverUrl.trim(),
      };
      await apiClient<Library>('/libraries/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      toast.success('Pengaturan Library berhasil disimpan.');
      // Full reload (bukan router.refresh — dashboard/layout.tsx full client
      // component) supaya LibraryProvider/Topbar/Sidebar ikut baca data baru,
      // bukan cuma state lokal halaman ini.
      window.location.reload();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Gagal menyimpan pengaturan. Coba lagi.';
      toast.error(message);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Pengaturan Library</CardTitle>
          <CardDescription>Kelola identitas Library kamu yang tampil di halaman publik.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nama">Nama Library</Label>
              <Input
                id="nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Slug</Label>
              <Input value={library.slug} disabled />
              <p className="text-xs text-muted-foreground">
                Slug tidak bisa diubah — dipakai di URL publik Library kamu (/library/{library.slug}).
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
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
              label="Cover Library"
              folder="libraries"
              value={coverUrl}
              onChange={setCoverUrl}
              disabled={submitting}
              onUploadingChange={setCoverUploading}
              previewWidth={144}
              previewHeight={96}
            />

            <Button type="submit" disabled={submitting || coverUploading} className="mt-2 w-fit">
              {submitting ? 'Menyimpan…' : coverUploading ? 'Menunggu upload cover…' : 'Simpan Perubahan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
