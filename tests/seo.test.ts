import { describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { indexableOrigin } from "@/lib/seo";

describe("search discovery (D-037)", () => {
  it("is not indexable outside production or without a public https URL", () => {
    expect(indexableOrigin({ APP_ENV: "dev", APP_BASE_URL: "https://example.org" } as never)).toBeNull();
    expect(indexableOrigin({ APP_ENV: "production" } as never)).toBeNull();
    expect(indexableOrigin({ APP_ENV: "production", APP_BASE_URL: "http://example.org" } as never)).toBeNull();
    expect(indexableOrigin({ APP_ENV: "production", APP_BASE_URL: "not a url" } as never)).toBeNull();
  });

  it("uses only the origin of the configured URL", () => {
    expect(indexableOrigin({ APP_ENV: "production", APP_BASE_URL: "https://example.org/some/path/" } as never)).toBe(
      "https://example.org",
    );
  });

  it("disallows everything and lists nothing by default", () => {
    vi.stubEnv("APP_ENV", "");
    vi.stubEnv("APP_BASE_URL", "");
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
    expect(sitemap()).toEqual([]);
    vi.unstubAllEnvs();
  });

  it("when live, allows the site, keeps private paths out and points at the sitemap", () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("APP_BASE_URL", "https://example.org");
    const r = robots();
    expect(r.sitemap).toBe("https://example.org/sitemap.xml");
    expect(JSON.stringify(r.rules)).toContain("/pay");
    expect(JSON.stringify(r.rules)).toContain("/api/");
    const urls = sitemap().map((e) => e.url);
    expect(urls).toEqual([
      "https://example.org",
      "https://example.org/services",
      "https://example.org/about",
      "https://example.org/contact",
    ]);
    expect(urls.some((u) => /pay|privacy|dev|api/.test(u))).toBe(false);
    vi.unstubAllEnvs();
  });
});
