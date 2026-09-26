import { z } from "zod";
import messages from "@/content/messages/en.json";
import servicesData from "@/content/services.json";
import siteConfig from "@/content/site.config.json";

// Public business facts (D-007). Empty values hide the UI that depends on them.
const SiteConfig = z.object({
  phone: z.union([z.literal(""), z.string().regex(/^\+91\d{10}$/)]),
  hours: z.null(), // Q12: shape decided when the owners publish hours
  promotion: z.object({ text: z.string().min(1), href: z.string().startsWith("/") }).nullable(),
});

export const LINES = ["lime", "blue", "olive"] as const;
export type Line = (typeof LINES)[number];

const Service = z.object({
  slug: z.string(),
  number: z.string(),
  line: z.enum(LINES),
  name: z.string(),
  when: z.string(),
  covers: z.string(),
});

export const config = SiteConfig.parse(siteConfig);
export const services = z.array(Service).parse(servicesData.lines);
export const t = messages;
