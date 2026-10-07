import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { config, equipment, lines, shown, shownPrice } from "@/lib/content";

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
  [/caresetu\.(com|in)\b/i, "domain (C-013, C-065, Q2)"],
  [/1800[\s-]?CARE/i, "unconfirmed phone (C-064, Q19)"],
  [/98765\s?43210/, "placeholder phone (C-066)"],
  [/\bNAB[HL]\b|\bDISHA\b/, "accreditation (C-060)"],
  [/\bPvt\.?\s?Ltd\b/i, "legal name (C-069, Q5)"],
  [/\b(Gurugram|Gurgaon|Faridabad)\b/, "service area (C-067, Q19)"],
  [/\b(Ananya Sen|Mary Kutty|Arvind Sehgal|Vikram Malhotra|Ritu Khurana)\b/, "invented people (C-058, C-062)"],
  [/\b\d\.\d{1,2}\s?\/\s?5\b/, "rating (C-059)"],
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
  [/incentive|revenue[- ]shar|commission/i, "referral money (C-085, Q21, IMC Regulations 2002 cl. 6.4.1)"],
];

describe("claims register (D-007)", () => {
  const rows = claimRows();

  it("parses the register", () => {
    expect(rows.size).toBeGreaterThan(20);
  });

  // D-029: every object in the content files that names a claim must agree with the register.
  // `pending: true` ⇔ the row is pending (it renders in development only); otherwise the row is approved/sourced.
  it("pending flags in content match the register", () => {
    const tagged: { claim: string; pending: boolean; file: string }[] = [];
    const walk = (node: unknown, file: string) => {
      if (Array.isArray(node)) return node.forEach((n) => walk(n, file));
      if (!node || typeof node !== "object") return;
      const o = node as Record<string, unknown>;
      if (typeof o.claim === "string") tagged.push({ claim: o.claim, pending: o.pending === true, file });
      Object.values(o).forEach((v) => walk(v, file));
    };
    for (const f of files(path.join(root, "content"), [".json"])) {
      walk(JSON.parse(readFileSync(f, "utf8")), path.relative(root, f));
    }
    expect(tagged.some((x) => x.pending)).toBe(true);
    for (const { claim, pending, file } of tagged) {
      const status = rows.get(claim) ?? "missing";
      const want = pending ? /^pending/ : /^(approved|sourced)/;
      expect(status, `${file}: ${claim} is ${status} but marked ${pending ? "pending" : "live"}`).toMatch(want);
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

describe("pending content gate (D-029)", () => {
  afterEach(() => vi.unstubAllEnvs());
  // The detail pages stay pending until C-088..C-095 are approved (D-043, INVARIANT 32).
  const details = lines.flatMap((l) => [l.detail, ...l.services.map((svc) => svc.detail)]).filter((d) => d?.pending);

  it("shows pending content in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(details.length).toBeGreaterThan(0);
    for (const d of details) expect(shown(d)).toBeDefined();
  });

  it("hides every pending item in a production build", () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const d of details) expect(shown(d)).toBeUndefined();
    for (const svc of lines.flatMap((l) => l.services)) {
      if (svc.scope?.pending) expect(shown(svc.scope)).toBeUndefined();
      if (svc.price?.pending) expect(shownPrice(svc.price)).toBeUndefined();
    }
    for (const item of equipment) {
      if (item.pending) expect(shown(item)).toBeUndefined();
      for (const price of item.prices) if (price.pending) expect(shownPrice(price)).toBeUndefined();
    }
  });

  it("shows the approved prices in a production build (Q18, D-052)", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(config.showPrices).toBe(true);
    for (const svc of lines.flatMap((l) => l.services)) {
      if (svc.price) expect(shownPrice(svc.price)).toBeDefined();
    }
  });
});
