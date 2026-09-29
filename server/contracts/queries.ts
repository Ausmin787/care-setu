import { z } from "zod";
import { lines } from "@/lib/content";
import { NOTICE_VERSION } from "@/lib/privacy";
import { AREAS, PATIENT_LOCATIONS } from "./enums";

// POST /api/v1/queries (TRD §3, D-033). One schema for the API, the form and future apps (D-006). Unknown keys are
// rejected; limits match the columns in server/db/schema.ts.

export const serviceSlugs = lines.flatMap((line) => line.services.map((service) => service.slug));

// Indian mobile numbers: 10 digits starting 6-9, written with or without +91 / 0 and spaces or dashes.
// Stored as +91XXXXXXXXXX.
const phone = z
  .string()
  .max(20)
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|0091|91|0)(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/))
  .transform((v) => `+91${v}`);

export const QueryInput = z.strictObject({
  patientLocation: z.enum(PATIENT_LOCATIONS),
  // Null = "not sure yet".
  service: z
    .string()
    .refine((slug) => serviceSlugs.includes(slug))
    .nullable(),
  area: z.enum(AREAS),
  message: z.string().trim().min(1).max(1000),
  name: z.string().trim().min(1).max(100),
  phone,
  email: z.email().max(254).nullable(),
  // INVARIANT 12: explicit consent against the current notice, or nothing is stored.
  consent: z.literal(true),
  noticeVersion: z.literal(NOTICE_VERSION),
  sourcePage: z.string().startsWith("/").max(200),
  // Honeypot: hidden from people, filled by bots.
  website: z.literal(""),
});

export type QueryInput = z.infer<typeof QueryInput>;

export const QueryCreated = z.object({ reference: z.string().length(10) });
