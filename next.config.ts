import type { NextConfig } from "next";
import { staticHeaders } from "./lib/security";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: staticHeaders }];
  },
};

export default nextConfig;
