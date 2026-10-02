import { z } from "zod";
import messages from "@/content/messages/en.json";
import servicesData from "@/content/services.json";
import siteConfig from "@/content/site.config.json";

// Public business facts (D-007). Empty values hide the UI that depends on them.
const SiteConfig = z.object({
  phone: z.union([z.literal(""), z.string().regex(/^\+91\d{10}$/)]),
  // The owners' address (D-024, C-029). Empty hides it.
  email: z.union([z.literal(""), z.email()]),
  // Call hours in Asia/Kolkata, "HH:MM" (D-024, C-031). Null hides the live call status.
  hours: z
    .object({ open: z.string().regex(/^\d{2}:\d{2}$/), close: z.string().regex(/^\d{2}:\d{2}$/) })
    .nullable(),
  promotion: z.object({ text: z.string().min(1), href: z.string().startsWith("/") }).nullable(),
  // Prices stay hidden until the owners confirm them (Q18, D-029).
  showPrices: z.boolean(),
  // The enquiry goes live only after the privacy notice sign-off (Q14) and the alert recipient (Q12), by a D-entry.
  enquiryLive: z.boolean(),
  // The pay flow goes live only when a D-entry wires the quotes backend and the gateway (D-036).
  paymentsLive: z.boolean(),
  // The partner form goes live only when a D-entry answers Q16 and wires the Partner API (D-038, INVARIANT 31).
  partnerEnquiryLive: z.boolean(),
});

export const LINES = ["lime", "blue", "olive"] as const;
export type Line = (typeof LINES)[number];

// Content from the owner's sample site carries its CLAIMS.md id; `pending` until that row is approved (D-029).
const claimed = { claim: z.string().regex(/^C-\d{3}$/), pending: z.boolean() };
// Integer paise, whole rupees only (D-004). A guide price; payment is always against a quote.
const Price = z.object({
  ...claimed,
  paise: z.number().int().positive().multipleOf(100),
  from: z.boolean(),
  unit: z.string(),
});
export type Price = z.infer<typeof Price>;

// A still-life illustration (C-073 and later rows), never presented as our stock, staff or premises; `focus` is the
// vertical crop point.
const Illustration = z.object({
  src: z.string().startsWith("/"),
  alt: z.string().startsWith("Illustration"),
  focus: z.string().regex(/^\d{1,3}%$/),
  claim: z.string().regex(/^C-\d{3}$/),
});

const Service = z.object({
  slug: z.string(),
  name: z.string(),
  who: z.string(),
  text: z.string(),
  scope: z.object({ ...claimed, items: z.array(z.string()).min(1) }).optional(),
  price: Price.optional(),
  image: Illustration.optional(),
});

// The eight launch services (D-024) in three lines (D-025).
const CatalogueLine = z.object({
  slug: z.string(),
  number: z.string(),
  line: z.enum(LINES),
  name: z.string(),
  whoLabel: z.string(),
  services: z.array(Service).min(1),
});

const Equipment = z.object({
  slug: z.string(),
  name: z.string(),
  text: z.string(),
  image: Illustration.optional(),
  ...claimed,
  prices: z.array(Price),
});

export const lines = z.array(CatalogueLine).length(3).parse(servicesData.catalogue);
export const equipment = z.array(Equipment).parse(servicesData.equipment);
export const config = SiteConfig.parse(siteConfig);
// "+917860042009" -> "+91 78600 42009", the grouping Indian mobile numbers are read in.
export const phoneDisplay = config.phone.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2");
export const t = messages;

// D-029: pending content renders in development only, so the owners can review it on localhost;
// a production build shows approved content only. Read at call time so tests can switch it.
export function shown<T extends { pending: boolean }>(item: T | undefined): T | undefined {
  return item && (!item.pending || process.env.NODE_ENV !== "production") ? item : undefined;
}

// D-033: the enquiry form and POST /api/v1/queries run in development until `enquiryLive` is set by a D-entry.
export function enquiryOpen(): boolean {
  return config.enquiryLive || process.env.NODE_ENV !== "production";
}

// D-036: the pay flow runs in development on sample quotes until `paymentsLive` is set by a D-entry.
export function paymentsOpen(): boolean {
  return config.paymentsLive || process.env.NODE_ENV !== "production";
}

// D-038: the partner form runs in development (and sends nothing) until `partnerEnquiryLive` is set by a D-entry.
export function partnerEnquiryOpen(): boolean {
  return config.partnerEnquiryLive || process.env.NODE_ENV !== "production";
}

export function shownPrice(price: Price | undefined): Price | undefined {
  return config.showPrices ? shown(price) : undefined;
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
// Display only: paise are whole rupees by schema, so the division is exact.
export const formatPaise = (paise: number) => inr.format(paise / 100);
