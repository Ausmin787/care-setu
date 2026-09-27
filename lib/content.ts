import { z } from "zod";
import messages from "@/content/messages/en.json";
import servicesData from "@/content/services.json";
import siteConfig from "@/content/site.config.json";

// Public business facts (D-007). Empty values hide the UI that depends on them.
const SiteConfig = z.object({
  phone: z.union([z.literal(""), z.string().regex(/^\+91\d{10}$/)]),
  // Call hours in Asia/Kolkata, "HH:MM" (D-024, C-031). Null hides the live call status.
  hours: z
    .object({ open: z.string().regex(/^\d{2}:\d{2}$/), close: z.string().regex(/^\d{2}:\d{2}$/) })
    .nullable(),
  promotion: z.object({ text: z.string().min(1), href: z.string().startsWith("/") }).nullable(),
});

export const LINES = ["lime", "blue", "olive"] as const;
export type Line = (typeof LINES)[number];

// The eight launch services (D-024) in three lines (D-025).
const CatalogueLine = z.object({
  slug: z.string(),
  number: z.string(),
  line: z.enum(LINES),
  name: z.string(),
  whoLabel: z.string(),
  services: z.array(z.object({ slug: z.string(), name: z.string(), who: z.string(), text: z.string() })).min(1),
});

export const lines = z.array(CatalogueLine).length(3).parse(servicesData.catalogue);
export const config = SiteConfig.parse(siteConfig);
// "+918448912820" -> "+91 84489 12820", the grouping Indian mobile numbers are read in.
export const phoneDisplay = config.phone.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2");
export const t = messages;
