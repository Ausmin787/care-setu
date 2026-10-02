import { z } from "zod";
import { NOTICE_VERSION } from "@/lib/privacy";
import { PARTNER_KINDS } from "./enums";
import { phone } from "./queries";

// A partner enquiry (D-038), shaped to TRD's `partner_enquiries` (org_name, contact_name, phone, email, kind,
// message). Today only the form uses it, in development, and nothing is sent (INVARIANT 31); the Partner API will parse
// the same schema when it is built.
export const PartnerInput = z
  .strictObject({
    kind: z.enum(PARTNER_KINDS),
    // A hospital names itself; a doctor's clinic name is optional; a professional has none.
    orgName: z.string().trim().min(1).max(150).nullable(),
    name: z.string().trim().min(1).max(100),
    phone,
    email: z.email().max(254).nullable(),
    message: z.string().trim().min(1).max(1000),
    // INVARIANT 12: explicit consent against the current notice.
    consent: z.literal(true),
    noticeVersion: z.literal(NOTICE_VERSION),
    sourcePage: z.string().startsWith("/").max(200),
    // Honeypot: hidden from people, filled by bots.
    website: z.literal(""),
  })
  .refine((v) => v.kind !== "hospital" || v.orgName !== null, { path: ["orgName"] });

export type PartnerInput = z.infer<typeof PartnerInput>;
export type PartnerKind = PartnerInput["kind"];

// The page's `?for=` value: one of the kinds, or nothing.
export function parsePartnerKind(value: unknown): PartnerKind | undefined {
  return (PARTNER_KINDS as readonly unknown[]).includes(value) ? (value as PartnerKind) : undefined;
}
