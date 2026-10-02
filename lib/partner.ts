import { z } from "zod";
import partnerData from "@/content/partner.json";
import { PARTNER_KINDS } from "@/server/contracts/enums";

// Partner page (D-038): the founders' deck p.24A/24B/25 in their own words. Every block carries its CLAIMS.md row and
// stays `pending` until the owners approve it, so `shown()` renders it in development only (D-029).
const claimed = { claim: z.string().regex(/^C-\d{3}$/), pending: z.boolean() };
const point = z.object({ head: z.string(), text: z.string().optional() });
const kind = z.enum(PARTNER_KINDS);

const Audience = z.object({
  slug: kind,
  ...claimed,
  headline: z.object({ lead: z.string(), rest: z.string() }),
  lede: z.string(),
  stack: z.object({ title: z.string(), items: z.array(z.string()).min(3).max(8) }),
  why: z.object({ title: z.string(), items: z.array(point).min(1).max(5) }),
  offer: z.object({ title: z.string(), items: z.array(point).min(1).max(4) }),
  quote: z.string(),
});
export type Audience = z.infer<typeof Audience>;

const Partner = z.object({
  // One per kind, in the switch's order (the Home partner band's order: lime, blue, olive).
  audiences: z
    .array(Audience)
    .length(PARTNER_KINDS.length)
    .refine((list) => list.every((a, i) => a.slug === PARTNER_KINDS[i])),
  start: z.object({
    ...claimed,
    title: z.string(),
    steps: z.record(kind, z.array(z.string()).length(3)),
  }),
  checks: z.object({
    ...claimed,
    title: z.string(),
    lede: z.string(),
    items: z.array(z.object({ name: z.string(), text: z.string() })).length(5),
  }),
});

export const partner = Partner.parse(partnerData);
