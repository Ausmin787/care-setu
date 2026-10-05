import { describe, expect, it } from "vitest";
import { allow, clientKey } from "@/server/rate-limit";

// TRD §4: public forms are rate-limited (5 per 10 minutes per address, D-033).
describe("allow", () => {
  it("lets five requests through, refuses the sixth, and recovers after the window", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 5; i++) expect(allow("10.0.0.1", t0 + i)).toBe(true);
    expect(allow("10.0.0.1", t0 + 10)).toBe(false);
    expect(allow("10.0.0.2", t0 + 10)).toBe(true);
    expect(allow("10.0.0.1", t0 + 10 * 60_000 + 5)).toBe(true);
  });
});

// Adversarial: a client must not be able to pick its own rate-limit key by writing to x-forwarded-for.
describe("clientKey", () => {
  const h = (init: Record<string, string>) => new Headers(init);
  it("prefers the platform's own client address", () => {
    expect(clientKey(h({ "x-nf-client-connection-ip": "203.0.113.9", "x-forwarded-for": "1.2.3.4" }))).toBe("203.0.113.9");
  });
  it("ignores a spoofed first forwarded value and takes the last one the proxy appended", () => {
    expect(clientKey(h({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }))).toBe("203.0.113.9");
    expect(clientKey(h({ "x-forwarded-for": "7.7.7.7, 203.0.113.9" }))).toBe(clientKey(h({ "x-forwarded-for": "8.8.8.8, 203.0.113.9" })));
  });
  it("falls back to one shared key rather than none", () => {
    expect(clientKey(h({}))).toBe("local");
  });
});
