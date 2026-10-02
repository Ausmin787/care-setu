import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { config, phoneDisplay } from "@/lib/content";
import { answerOf, faq, linkOf, visibleStages, whatsappLink } from "@/lib/faq";

// D-041: the FAQ answers only from confirmed owner facts (D-013); pending items are development only (D-029); a flow
// that is off in production answers with its closed text (INVARIANT 18).
const root = path.resolve(__dirname, "..");
const rows = new Map<string, string>();
for (const line of readFileSync(path.join(root, "docs/CLAIMS.md"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\|\s*(C-\d{3})\s*\|(?:[^|]*\|){3}\s*([^|]*)\|/);
  if (m) rows.set(m[1], m[2].trim());
}
const items = faq.stages.flatMap((s) => s.items);

describe("FAQ content (D-041)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("cites only claims that exist, and approved ones for everything public", () => {
    for (const item of items) {
      for (const c of item.claims) {
        expect(rows.has(c), `${item.slug} cites ${c}`).toBe(true);
        if (!item.pending) expect(rows.get(c), `${item.slug}: ${c}`).toMatch(/^(approved|sourced)/);
      }
    }
  });

  it("hides pending items in production and shows them in development", () => {
    const pending = items.filter((i) => i.pending).map((i) => i.slug);
    expect(pending.length).toBeGreaterThan(0);
    vi.stubEnv("NODE_ENV", "production");
    const prod = visibleStages().flatMap((s) => s.items.map((i) => i.slug));
    for (const slug of pending) expect(prod).not.toContain(slug);
    vi.stubEnv("NODE_ENV", "development");
    const dev = visibleStages().flatMap((s) => s.items.map((i) => i.slug));
    for (const slug of pending) expect(dev).toContain(slug);
  });

  it("answers a closed flow with its closed text and no link in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const item of items.filter((i) => i.gate)) {
      expect(answerOf(item)).toEqual(item.aClosed!.map((s) => s.replaceAll("{phone}", phoneDisplay)));
      expect(linkOf(item)).toBeUndefined();
    }
  });

  it("fills every placeholder and carries no unapproved fact in public answers", () => {
    vi.stubEnv("NODE_ENV", "production");
    const text = visibleStages()
      .flatMap((s) => s.items.flatMap((i) => [i.q, ...answerOf(i)]))
      .join("\n");
    expect(text).not.toMatch(/[{}]/);
    expect(text).not.toMatch(/₹|\d+\s?%|24\s?[x/×]\s?7|caresetu\.(com|in)|verified|trusted by/i);
    expect(text).toContain(phoneDisplay);
    expect(text).toContain(config.email);
  });

  it("puts only the question in the WhatsApp link", () => {
    const url = new URL(whatsappLink("Which areas do you cover?"));
    expect(url.origin + url.pathname).toBe(`https://wa.me/${config.phone.replace(/^\+/, "")}`);
    expect(url.searchParams.get("text")).toBe("Hi Care Setu, I have a question: Which areas do you cover?");
  });
});
