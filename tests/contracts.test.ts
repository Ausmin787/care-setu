import { describe, expect, it } from "vitest";
import { NOTICE_VERSION } from "@/lib/privacy";
import { QueryInput } from "@/server/contracts/queries";

// TRD §6: every API schema rejects bad input (D-033).
const valid = {
  patientLocation: "hospital",
  service: "nurse",
  area: "noida",
  message: "Needs dressing changes after surgery",
  name: "Test Person",
  phone: "98765 43210",
  email: null,
  consent: true,
  noticeVersion: NOTICE_VERSION,
  sourcePage: "/contact",
  website: "",
};

const rejects = (patch: Record<string, unknown>) => !QueryInput.safeParse({ ...valid, ...patch }).success;

describe("QueryInput", () => {
  it("accepts a complete enquiry and normalises the phone", () => {
    const parsed = QueryInput.parse(valid);
    expect(parsed.phone).toBe("+919876543210");
  });
  it.each(["+91 98765 43210", "09876543210", "919876543210", "98765-43210"])("reads %s as one number", (phone) => {
    expect(QueryInput.parse({ ...valid, phone }).phone).toBe("+919876543210");
  });
  it("accepts 'not sure' as a null service and an optional email", () => {
    expect(QueryInput.safeParse({ ...valid, service: null, email: "a@example.org" }).success).toBe(true);
  });
  it("rejects a missing or refused consent", () => {
    expect(rejects({ consent: false })).toBe(true);
    const withoutConsent: Partial<typeof valid> = { ...valid };
    delete withoutConsent.consent;
    expect(QueryInput.safeParse(withoutConsent).success).toBe(false);
  });
  it("rejects consent given against another notice version", () => {
    expect(rejects({ noticeVersion: "2020-01-01" })).toBe(true);
  });
  it("rejects a filled honeypot", () => {
    expect(rejects({ website: "http://spam.example" })).toBe(true);
  });
  it("rejects unknown keys (a client never sends a price, D-004)", () => {
    expect(rejects({ amountPaise: 100 })).toBe(true);
  });
  it.each(["12345", "5876543210", "98765432101", "abcdefghij"])("rejects the phone %s", (phone) => {
    expect(rejects({ phone })).toBe(true);
  });
  it("rejects a service that isn't on the catalogue", () => {
    expect(rejects({ service: "teleconsultation" })).toBe(true);
  });
  it("rejects values outside the answer sets", () => {
    expect(rejects({ patientLocation: "office" })).toBe(true);
    expect(rejects({ area: "gurugram" })).toBe(true);
  });
  it("enforces the column lengths", () => {
    expect(rejects({ message: "" })).toBe(true);
    expect(rejects({ message: "   " })).toBe(true);
    expect(rejects({ message: "x".repeat(1001) })).toBe(true);
    expect(rejects({ name: "x".repeat(101) })).toBe(true);
    expect(rejects({ email: "not-an-email" })).toBe(true);
    expect(rejects({ sourcePage: "https://elsewhere.example/" })).toBe(true);
  });
});
