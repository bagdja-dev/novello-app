import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Novelo — Baca & Tulis Cerita",
  description:
    "Novelo, platform Bagdja untuk membaca dan menulis novel/cerita berseri — katalog cerita dari berbagai penulis, baca gratis tanpa login.",
};

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
