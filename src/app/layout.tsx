import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { getPlatformConfig } from "@/lib/public-api";

// favicon dari platform_config.favicon (diedit langsung di DB, lihat
// plan/novelo/schema.dbml) — null berarti pakai favicon default Next.js
// (belum ada custom favicon), jadi generateMetadata dipakai (bukan
// `export const metadata` statis) supaya bisa async fetch config.
export async function generateMetadata(): Promise<Metadata> {
  const config = await getPlatformConfig();

  return {
    title: "Novelo — Baca & Tulis Cerita",
    description:
      "Novelo, platform Bagdja untuk membaca dan menulis novel/cerita berseri — katalog cerita dari berbagai penulis, baca gratis tanpa login.",
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
