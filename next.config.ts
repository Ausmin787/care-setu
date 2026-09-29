import type { NextConfig } from "next";
import { staticHeaders } from "./lib/security";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Owner review over a Cloudflare Quick Tunnel from the dev machine (2026-09-28): Next 16 blocks dev assets for other
  // origins by default. Development only; a production build ignores it.
  allowedDevOrigins: ["*.trycloudflare.com"],
  // PGlite (the dev database, D-002) loads its WASM and data files from its own package at runtime, so it stays
  // unbundled. `pg` is already on Next's built-in list.
  serverExternalPackages: ["@electric-sql/pglite"],
  async headers() {
    return [{ source: "/(.*)", headers: staticHeaders }];
  },
};

export default nextConfig;
