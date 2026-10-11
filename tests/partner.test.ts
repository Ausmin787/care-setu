import { afterEach, describe, expect, it, vi } from "vitest";
import { config, partnerEnquiryOpen, shown, t } from "@/lib/content";
import { partner } from "@/lib/partner";
import { NOTICE_VERSION } from "@/lib/privacy";
import { PARTNER_KINDS } from "@/server/contracts/enums";
import { PartnerInput, parsePartnerKind } from "@/server/contracts/partners";

// D-038: the partner form sends nothing and stays off in production (INVARIANT 31). D-054 published the page's content.

describe("Partner content gate (D-038)", () => {
  afterEach(() => vi.unstubAllEnvs());

  // D-054: the audiences and the five checks are approved; "How it starts" names the form and a callback (Q16), so it
  // stays pending while the form is off.
  it("approves the audiences and the checks, and holds back the start steps", () => {
    for (const b of [...partner.audiences, partner.checks]) expect(b.pending).toBe(false);
    expect(partner.start.pending).toBe(true);
  });

  it("shows the approved blocks in production and hides the start steps", () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const b of [...partner.audiences, partner.checks]) expect(shown(b)).toBeDefined();
    expect(shown(partner.start)).toBeUndefined();
    vi.stubEnv("NODE_ENV", "development");
    expect(shown(partner.start)).toBeDefined();
  });

  it("keeps the audiences, the Home partner rows and the form kinds in one order", () => {
    expect(partner.audiences.map((a) => a.slug)).toEqual([...PARTNER_KINDS]);
    expect(t.partner.roles.map((r) => r.for)).toEqual([...PARTNER_KINDS]);
  });
});

describe("partner form gate (INVARIANT 31)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is off in production until a D-entry sets partnerEnquiryLive", () => {
    expect(config.partnerEnquiryLive).toBe(false);
    vi.stubEnv("NODE_ENV", "production");
    expect(partnerEnquiryOpen()).toBe(false);
    vi.stubEnv("NODE_ENV", "development");
    expect(partnerEnquiryOpen()).toBe(true);
  });
});

describe("PartnerInput (D-038)", () => {
  const valid = {
    kind: "hospital",
    orgName: "City Hospital",
    name: "A. Kumar",
    phone: "098765 01234",
    email: null,
    message: "We discharge patients to Noida.",
    consent: true,
    noticeVersion: NOTICE_VERSION,
    sourcePage: "/partner",
    website: "",
  };

  it("accepts a hospital and normalises the phone", () => {
    const r = PartnerInput.parse(valid);
    expect(r.phone).toBe("+919876501234");
  });

  it("needs a name for a hospital, but not for a doctor or a professional", () => {
    expect(PartnerInput.safeParse({ ...valid, orgName: null }).success).toBe(false);
    expect(PartnerInput.safeParse({ ...valid, kind: "doctor", orgName: null }).success).toBe(true);
    expect(PartnerInput.safeParse({ ...valid, kind: "professional", orgName: null }).success).toBe(true);
  });

  it("refuses missing consent, a filled honeypot and unknown keys", () => {
    expect(PartnerInput.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(PartnerInput.safeParse({ ...valid, website: "x" }).success).toBe(false);
    expect(PartnerInput.safeParse({ ...valid, price: 1 }).success).toBe(false);
  });

  it("reads ?for= only as one of the kinds", () => {
    expect(parsePartnerKind("doctor")).toBe("doctor");
    expect(parsePartnerKind("admin")).toBeUndefined();
    expect(parsePartnerKind(["doctor"])).toBeUndefined();
    expect(parsePartnerKind(undefined)).toBeUndefined();
  });
});
