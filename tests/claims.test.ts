import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// D-007 / TRD §6: copy may only carry claims whose CLAIMS.md row is approved or sourced.
const root = path.resolve(__dirname, "..");

function claimRows() {
  const md = readFileSync(path.join(root, "docs/CLAIMS.md"), "utf8");
  const rows = new Map<string, string>();
  for (const line of md.split(/\r?\n/)) {
    const m = line.match(/^\|\s*(C-\d{3})\s*\|(?:[^|]*\|){3}\s*([^|]*)\|/);
    if (m) rows.set(m[1], m[2].trim());
  }
  return rows;
}

function files(dir: string, exts: string[]): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) return files(p, exts);
    return exts.includes(path.extname(p)) ? [p] : [];
  });
}

const copyFiles = [
  ...files(path.join(root, "content"), [".json"]),
  ...files(path.join(root, "app"), [".tsx", ".ts"]),
  ...files(path.join(root, "components"), [".tsx", ".ts"]),
];

// Risky patterns that never ship without an approved row (CLAIMS C-001..C-020, content rules).
const risky: [RegExp, string][] = [
  [/caresetu\.com/i, "domain (C-013, Q2)"],
  [/\+91[\s-]*123/, "placeholder phone (C-012)"],
  [/123\s?456\s?7890/, "placeholder phone (C-012)"],
  [/\bISO\s?\d{4,5}/i, "ISO certification (C-001/C-002)"],
  [/HIPAA/i, "HIPAA (C-003)"],
  [/trusted by/i, "trusted by (C-007)"],
  [/\b(AIIMS|Apollo|Fortis|Medanta|BLK|Ganga Ram|CK Birla|Venkateshwar|Jaypee|Kokilaben)\b/, "hospital name (C-006)"],
  [/\b(Max Hospital|Max Healthcare)\b/, "hospital name (C-006)"],
  [/\d+\s?%/, "percentage statistic (C-008..C-011)"],
  [/\blakh\b|\bcrore\b|\bCr\+/i, "market statistic (C-008..C-011)"],
  [/24\s?[x/×]\s?7/i, "24x7 support (C-016)"],
  [/background[- ]verified/i, "verification claim (C-015)"],
];

describe("claims register (D-007)", () => {
  const rows = claimRows();

  it("parses the register", () => {
    expect(rows.size).toBeGreaterThan(20);
  });

  it("every claim id referenced in copy is approved or sourced", () => {
    const en = readFileSync(path.join(root, "content/messages/en.json"), "utf8");
    const ids = [...en.matchAll(/"claim":\s*"(C-\d{3})"/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      const status = rows.get(id) ?? "missing";
      expect(status, `${id} is ${status}`).toMatch(/^(approved|sourced)/);
    }
  });

  it.each(copyFiles.map((f) => [path.relative(root, f)]))("%s has no risky pattern", (rel) => {
    const text = readFileSync(path.join(root, rel), "utf8")
      // CSS percentages and numeric style values are not claims.
      .replace(/\b\d+%\s*(?=[;)"',}\s])/g, "");
    for (const [re, why] of risky) {
      expect(text, `${rel}: ${why}`).not.toMatch(re);
    }
  });
});
