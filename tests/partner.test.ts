import { afterEach, describe, expect, it, vi } from "vitest";
import { config, partnerEnquiryOpen, shown, t } from "@/lib/content";
import { partner } from "@/lib/partner";
import { NOTICE_VERSION } from "@/lib/privacy";
import { PARTNER_KINDS } from "@/server/contracts/enums";
import { PartnerInput, parsePartnerKind } from "@/server/contracts/partners";

// D-038: the Partner page's deck content is pending (development only) and the partner form sends nothing and stays
// off in production (INVARIANT 31).
const blocks = [...partner.audiences, partner.start, partner.checks];

describe("Partner content gate (D-038)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is all pending until the owners approve it", () => {
    for (const b of blocks) expect(b.pending).toBe(true);
  });

  it("shows in development and hides every block in production", () => {
    vi.stubEnv("NODE_ENV", "development");
    for (const b of blocks) expect(shown(b)).toBeDefined();
    vi.stubEnv("NODE_ENV", "production");
    for (const b of blocks) expect(shown(b)).toBeUndefined();
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
