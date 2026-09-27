import { describe, expect, it } from "vitest";
import { callsOpenAt } from "@/lib/hours";
import siteConfig from "@/content/site.config.json";

// The live call status (D-027) must match the published hours in India time (D-024, C-031), whatever the
// visitor's own time zone. IST is UTC+05:30, so 07:00 IST = 01:30Z and 22:00 IST = 16:30Z.
const hours = { open: "07:00", close: "22:00" };
const at = (iso: string) => new Date(iso);

describe("callsOpenAt", () => {
  it("is closed a minute before opening", () => {
    expect(callsOpenAt(at("2026-09-27T01:29:00Z"), hours)).toBe(false); // 06:59 IST
  });
  it("opens at 07:00 IST", () => {
    expect(callsOpenAt(at("2026-09-27T01:30:00Z"), hours)).toBe(true);
  });
  it("is open at 21:59 IST", () => {
    expect(callsOpenAt(at("2026-09-27T16:29:00Z"), hours)).toBe(true);
  });
  it("closes at 22:00 IST", () => {
    expect(callsOpenAt(at("2026-09-27T16:30:00Z"), hours)).toBe(false);
  });
  it("is closed after midnight IST", () => {
    expect(callsOpenAt(at("2026-09-26T19:00:00Z"), hours)).toBe(false); // 00:30 IST
  });
  it("uses the hours the site publishes", () => {
    expect(siteConfig.hours).toEqual(hours);
  });
});
