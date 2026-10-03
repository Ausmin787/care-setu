import type { MetadataRoute } from "next";
import { indexableOrigin } from "@/lib/seo";

export const dynamic = "force-dynamic";

// The pages that are built, approved to be public and meant to be found (D-037). Left out on purpose: /pay and the
// quote pages (private, noindex) and the legal pages while they are DRAFT (D-012).
// /partner joined with D-038, /faq with D-041. The service detail pages (/services/<slug>, D-043) join only when
// serviceDetailsLive turns them on. Add a path here in the same change that ships its page. No lastModified: we don't have a true date to give.
const PATHS = ["/", "/services", "/about", "/contact", "/partner", "/faq"];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = indexableOrigin();
  if (!origin) return [];
  return PATHS.map((path) => ({ url: `${origin}${path === "/" ? "" : path}` }));
}
