import { z } from "zod";
import faqData from "@/content/faq.json";
import { config, enquiryOpen, paymentsOpen, phoneDisplay, shown, t } from "@/lib/content";

// FAQ (D-041): answers only from confirmed owner facts (D-013), grouped by the family's stage (GOV.UK: start with user
// needs). Each item cites its CLAIMS.md rows; pending items render in development only (D-029).
const Item = z.object({
  slug: z.string().regex(/^[a-z-]+$/),
  q: z.string(),
  a: z.array(z.string()).min(1).max(3),
  // While the flow is off in production, the closed answer shows instead (D-033, D-036).
  gate: z.enum(["enquiry", "payments"]).optional(),
  aClosed: z.array(z.string()).min(1).max(3).optional(),
  list: z.literal("services").optional(),
  link: z.object({ href: z.string().startsWith("/"), label: z.string() }).optional(),
  claims: z.array(z.string().regex(/^C-\d{3}$/)),
  pending: z.boolean(),
});
export type FaqItem = z.infer<typeof Item>;

const Stage = z.object({ slug: z.string().regex(/^[a-z]+$/), label: z.string(), items: z.array(Item).min(1).max(8) });
export type FaqStage = z.infer<typeof Stage>;

export const faq = z
  .object({ stages: z.array(Stage).min(1).max(8) })
  .refine((f) => {
    const slugs = f.stages.flatMap((s) => s.items.map((i) => i.slug));
    return new Set(slugs).size === slugs.length;
  }, "item slugs must be unique")
  .refine((f) => f.stages.every((s) => s.items.every((i) => !i.gate || i.aClosed)), "a gated item needs aClosed")
  .parse(faqData);

// Contact details come from the site config and the Contact copy, never from the FAQ file.
export function fill(text: string): string {
  return text
    .replaceAll("{phone}", phoneDisplay)
    .replaceAll("{email}", config.email)
    .replaceAll("{office}", t.contactPage.office.text);
}

const gateOpen = { enquiry: enquiryOpen, payments: paymentsOpen };

// The answer as this environment should show it. Read at call time so tests can switch NODE_ENV.
export function answerOf(item: FaqItem): string[] {
  const open = !item.gate || gateOpen[item.gate]();
  return (open ? item.a : (item.aClosed ?? item.a)).map(fill);
}

// A closed gate also hides the item's link (the page it points to doesn't offer that flow in production).
export function linkOf(item: FaqItem): FaqItem["link"] {
  return !item.gate || gateOpen[item.gate]() ? item.link : undefined;
}

// Stages with only the items this environment may show; a stage left empty is dropped.
export function visibleStages(): FaqStage[] {
  return faq.stages
    .map((s) => ({ ...s, items: s.items.filter((i) => shown(i)) }))
    .filter((s) => s.items.length > 0);
}

// "Ask this on WhatsApp": opens a chat with the published number, the question pre-filled. Only the question text goes
// in the URL, never anything the visitor typed (wa.me click-to-chat format).
export function whatsappLink(question: string): string {
  const text = t.faqPage.waText.replace("{q}", question);
  return `https://wa.me/${config.phone.replace(/^\+/, "")}?text=${encodeURIComponent(text)}`;
}
