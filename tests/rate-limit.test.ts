import { describe, expect, it } from "vitest";
import { allow } from "@/server/rate-limit";

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
