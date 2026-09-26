import { describe, expect, it } from "vitest";
import { buildCsp, staticHeaders } from "@/lib/security";

// TRD §4, D-022: exact header values.
describe("security headers", () => {
  it("production CSP is strict: nonce scripts, no eval, no framing", () => {
    const csp = buildCsp("abc123", false);
    expect(csp).toBe(
      "default-src 'self'; script-src 'self' 'nonce-abc123' 'strict-dynamic'; " +
        "style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; " +
        "connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; " +
        "frame-ancestors 'none'; upgrade-insecure-requests",
    );
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).not.toContain("unsafe-eval");
  });

  it("dev CSP only adds unsafe-eval (React debugging) and drops the https upgrade", () => {
    const csp = buildCsp("n", true);
    expect(csp).toContain("'strict-dynamic' 'unsafe-eval'");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });

  it("static headers", () => {
    const h = Object.fromEntries(staticHeaders.map((x) => [x.key, x.value]));
    expect(h).toEqual({
      "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    });
  });
});
