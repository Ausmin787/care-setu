import type { MetadataRoute } from "next";
import { indexableOrigin } from "@/lib/seo";

// Read per request, not at build, so the environment decides (D-037).
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const origin = indexableOrigin();
  // Not production, or no public URL yet: ask every crawler to stay out.
  if (!origin) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/pay", "/dev"] },
    sitemap: `${origin}/sitemap.xml`,
  };
}
