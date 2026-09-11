import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build image Docker untuk Coolify butuh output `.next/standalone` (server
  // Node minimal tanpa node_modules penuh) — lihat Dockerfile di root repo ini.
  output: "standalone",
};

export default nextConfig;
