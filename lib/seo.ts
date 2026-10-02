// Search-engine discovery (D-037). A site is indexable only when this environment says it is production AND has a
// public base URL; otherwise robots.txt disallows everything and the sitemap is empty, so the owner-review tunnel,
// localhost and any staging copy are never indexed. The domain itself is still an owner question (Q2), so no domain is
// written in code: it comes from APP_BASE_URL at deploy time.
export function indexableOrigin(env: NodeJS.ProcessEnv = process.env): string | null {
  if (env.APP_ENV !== "production" || !env.APP_BASE_URL) return null;
  try {
    const url = new URL(env.APP_BASE_URL);
    return url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}
