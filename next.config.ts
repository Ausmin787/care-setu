import type { NextConfig } from "next";
import { staticHeaders } from "./lib/security";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Owner review over a Cloudflare Quick Tunnel from the dev machine (2026-09-28): Next 16 blocks dev assets for other
  // origins by default. Development only; a production build ignores it.
  allowedDevOrigins: ["*.trycloudflare.com"],
  async headers() {
    return [{ source: "/(.*)", headers: staticHeaders }];
  },
};

export default nextConfig;
