import type { MetadataRoute } from "next";
import { serviceDetailsOpen } from "@/lib/content";
import { servicePages } from "@/lib/services";
import { indexableOrigin } from "@/lib/seo";

export const dynamic = "force-dynamic";

// The pages that are built, approved to be public and meant to be found (D-037). Left out on purpose: /pay and the
// quote pages (private, noindex) and the legal pages while they are DRAFT (D-012).
// /partner joined with D-038, /faq with D-041, the service detail pages (/services/<slug>, D-043) with D-054.
// Add a path here in the same change that ships its page. No lastModified: we don't have a true date to give.
const PAGES = ["/about", "/contact", "/partner", "/faq"];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = indexableOrigin();
  if (!origin) return [];
  // The detail pages follow the route's own gate, so turning the flag off drops them here too (INVARIANT 32).
  const details = serviceDetailsOpen() ? servicePages.map((p) => `/services/${p.slug}`) : [];
  return ["/", "/services", ...details, ...PAGES].map((path) => ({ url: `${origin}${path === "/" ? "" : path}` }));
}
