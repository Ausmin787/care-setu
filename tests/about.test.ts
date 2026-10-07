import { existsSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { about } from "@/lib/about";
import { shown } from "@/lib/content";

// D-052: the owners approved About (C-021, C-074..C-078), so a production build shows every block and the founder
// photos are served from public/founders.
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

describe("About content (D-052)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is approved", () => {
    for (const b of blocks) expect(b.pending).toBe(false);
  });

  it("shows every block in a production build", () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const b of blocks) expect(shown(b)).toBeDefined();
  });

  it("serves founder photos from public/founders", () => {
    const photos = [about.letter.photo.src, ...about.founders.people.flatMap((f) => (f.photo ? [f.photo] : []))];
    expect(photos.length).toBeGreaterThan(0);
    for (const src of photos) {
      expect(src.startsWith("/founders/")).toBe(true);
      expect(existsSync(path.join(root, "public", src))).toBe(true);
    }
  });
});
