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
