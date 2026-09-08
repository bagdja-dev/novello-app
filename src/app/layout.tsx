import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { getPlatformConfig } from "@/lib/public-api";

// title/favicon dari platform_config (diedit langsung di DB, lihat
// plan/novelo/schema.dbml) — favicon null berarti pakai favicon default
// Next.js (belum ada custom favicon). generateMetadata dipakai (bukan
// `export const metadata` statis) supaya bisa async fetch config.
export async function generateMetadata(): Promise<Metadata> {
  const config = await getPlatformConfig();

  return {
    title: `${config.title} — Baca & Tulis Cerita`,
    description: `${config.title}, platform Bagdja untuk membaca dan menulis novel/cerita berseri — jelajahi katalog cerita dari berbagai penulis, buat akun gratis untuk mulai membaca.`,
    icons: config.favicon ? { icon: config.favicon } : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
