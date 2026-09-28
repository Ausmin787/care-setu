import { existsSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { about } from "@/lib/about";
import { shown } from "@/lib/content";

// D-032: the About page's content from the founders' deck is pending (Q20), so a production build shows none of it,
// and the founder photos are never shipped from public/ (C-021: no web consent yet).
const root = path.resolve(__dirname, "..");
const blocks = [
  about.opener.question,
  about.opener.situations,
  about.letter,
  about.letter.photo,
  about.vision,
  about.mission,
  about.mission.groups,
  about.values,
  about.founders,
  about.promise,
];

describe("About content gate (D-032)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is all pending until the owners approve it", () => {
    for (const b of blocks) expect(b.pending).toBe(true);
  });

  it("shows in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    for (const b of blocks) expect(shown(b)).toBeDefined();
  });

  it("hides every block in a production build", () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const b of blocks) expect(shown(b)).toBeUndefined();
  });

  it("keeps founder photos out of public/", () => {
    const photos = [about.letter.photo.src, ...about.founders.people.flatMap((f) => (f.photo ? [f.photo] : []))];
    for (const src of photos) {
      expect(src.startsWith("/dev/founders/")).toBe(true);
      expect(existsSync(path.join(root, "public", src))).toBe(false);
    }
    expect(existsSync(path.join(root, "public", "founders"))).toBe(false);
  });
});
