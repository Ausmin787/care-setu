import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { config, serviceDetailsOpen, shown } from "@/lib/content";
import { morphName, nextLineOf, servicePage, servicePages, siblingsOf } from "@/lib/services";
import { deckCards } from "@/components/services/ServiceDeck";

// D-043: one detail page per deck card, development only (INVARIANT 32), its deck content pending (C-088..C-095).
describe("service detail pages (D-043)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("has one page per deck card, in deck order, numbered 01..08", () => {
    expect(servicePages.map((p) => p.slug)).toEqual(deckCards.map((c) => c.slug));
    expect(servicePages.map((p) => p.number)).toEqual(deckCards.map((_, i) => String(i + 1).padStart(2, "0")));
    expect(new Set(servicePages.map((p) => p.slug)).size).toBe(servicePages.length);
  });

  it("finds pages by slug and nothing else", () => {
    expect(servicePage("nurse")?.name).toBe("Nurse at Home");
    expect(servicePage("equipment")?.parts?.map((p) => p.slug)).toEqual(["rent", "buy", "sell-back"]);
    expect(servicePage("nope")).toBeUndefined();
  });

  it("is off in production until a D-entry sets serviceDetailsLive", () => {
    expect(config.serviceDetailsLive).toBe(false);
    vi.stubEnv("NODE_ENV", "production");
    expect(serviceDetailsOpen()).toBe(false);
    vi.stubEnv("NODE_ENV", "development");
    expect(serviceDetailsOpen()).toBe(true);
  });

  it("keeps every deck block pending: shown in development, hidden in production", () => {
    for (const p of servicePages) {
      expect(p.detail.pending, p.slug).toBe(true);
      vi.stubEnv("NODE_ENV", "development");
      expect(shown(p.detail)).toBeDefined();
      vi.stubEnv("NODE_ENV", "production");
      expect(shown(p.detail)).toBeUndefined();
    }
  });

  it("gives each page unique shared-element names (a duplicate name breaks the view transition)", () => {
    for (const p of servicePages) {
      const names = [p, ...siblingsOf(p), nextLineOf(p)].map((x) => morphName(x.slug));
      expect(new Set(names).size, p.slug).toBe(names.length);
    }
  });

  it("links each line's pages to the next line's first service, wrapping round", () => {
    expect(nextLineOf(servicePage("nurse")!).slug).toBe("doctor");
    expect(nextLineOf(servicePage("lab-samples")!).slug).toBe("equipment");
    expect(nextLineOf(servicePage("equipment")!).slug).toBe("nurse");
  });

  // The deck's benefits, quality claims and the app were left out (D-043); none may slip into the content.
  it("carries none of the deck's dropped claims", () => {
    const blocks = JSON.stringify(servicePages.map((p) => p.detail));
    for (const re of [/24\s?x\s?7/i, /verified/i, /hospital[- ](level|grade|quality)/i, /\bapp\b/i, /\bEMI\b/, /better recovery|faster recovery/i]) {
      expect(blocks).not.toMatch(re);
    }
  });

  it("is left out of the sitemap while it is development only", () => {
    const sitemap = readFileSync(path.resolve(__dirname, "../app/sitemap.ts"), "utf8");
    expect(sitemap).not.toMatch(/"\/services\/[a-z]/);
  });
});
