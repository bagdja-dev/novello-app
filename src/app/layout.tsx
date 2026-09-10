import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { getPlatformSlug } from "@/lib/platform";
import { getPlatformConfig } from "@/lib/public-api";
import { PlatformProvider } from "@/context/platform-context";

// nama/favicon dari GET /public/platforms/:platformSlug (Fase 4, §4.2 —
// menggantikan GET /public/config global lama) — favicon null berarti pakai
// favicon default Next.js (belum ada custom favicon). generateMetadata
// dipakai (bukan `export const metadata` statis) supaya bisa async fetch
// config setelah resolusi Platform dari middleware.ts.
export async function generateMetadata(): Promise<Metadata> {
  const slug = await getPlatformSlug();
  const config = await getPlatformConfig(slug);

  return {
    title: `${config.nama} — Baca & Tulis Cerita`,
    description: `${config.nama}, platform Bagdja untuk membaca dan menulis novel/cerita berseri — jelajahi katalog cerita dari berbagai penulis, buat akun gratis untuk mulai membaca.`,
    icons: config.faviconUrl ? { icon: config.faviconUrl } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const slug = await getPlatformSlug();
  const config = await getPlatformConfig(slug);

  return (
    <html lang="id">
      <body className="antialiased">
        <PlatformProvider slug={slug} config={config}>
          {children}
        </PlatformProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
