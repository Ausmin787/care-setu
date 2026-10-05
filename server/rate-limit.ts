// Public form rate limit (TRD §4): at most LIMIT requests per WINDOW_MS per key. The key (an IP address) is held in
// memory only, never stored or logged, and is dropped once its window has passed (the privacy notice says "about
// 10 minutes"). Per server instance: revisit when hosting is chosen (Q1).
const WINDOW_MS = 10 * 60_000;
const LIMIT = 5;

const hits = new Map<string, number[]>();

function forgetIfIdle(key: string) {
  const times = hits.get(key);
  if (times && times.every((at) => Date.now() - at >= WINDOW_MS)) hits.delete(key);
}

export function allow(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  const allowed = recent.length < LIMIT;
  hits.set(key, recent);
  if (allowed) {
    recent.push(now);
    // Refused requests add no time, so only an accepted one needs a timer (a flood can't pile them up).
    setTimeout(() => forgetIfIdle(key), WINDOW_MS + 1_000).unref?.();
  }
  return allowed;
}

// The address a request is limited by. A client can put anything at the front of `x-forwarded-for`, so the first value
// is never trusted. Netlify sets `x-nf-client-connection-ip` itself (Netlify staff, answers.netlify.com: it is the
// supported header and they do not parse `x-forwarded-for`); on any other host the last forwarded value is the one the
// nearest proxy appended. Revisit when hosting is chosen (Q1).
export function clientKey(headers: Headers): string {
  const platform = headers.get("x-nf-client-connection-ip")?.trim();
  if (platform) return platform;
  const forwarded = headers.get("x-forwarded-for")?.split(",");
  return forwarded?.at(-1)?.trim() || "local";
}
