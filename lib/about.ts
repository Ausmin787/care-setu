import { z } from "zod";
import aboutData from "@/content/about.json";
import { Illustration, LINES } from "@/lib/content";

// About (D-032): the founders' deck in their own words. Each block carries its CLAIMS.md row and stays `pending`
// until the owners approve it (Q20), so `shown()` renders it in development only (D-029).
const claimed = { claim: z.string().regex(/^C-\d{3}$/), pending: z.boolean() };
const line = z.enum(LINES);
// Founder photos are served by a development-only route until consent is recorded (C-021, Q20); never from public/.
const devPhoto = z.string().regex(/^\/dev\/founders\/[a-z]+\.webp$/);

const About = z.object({
  opener: z.object({
    question: z.object({ text: z.string(), ...claimed }),
    situations: z.object({ items: z.array(z.string()).length(3), ...claimed }),
  }),
  letter: z.object({
    quote: z.string(),
    paras: z.array(z.string()).min(1),
    pull: z.string(),
    trust: z.array(z.string()),
    wishes: z.array(z.object({ text: z.string(), line })).length(4),
    closing: z.string(),
    dreamLead: z.string(),
    dream: z.string(),
    name: z.string(),
    role: z.string(),
    ...claimed,
    photo: z.object({ src: devPhoto, alt: z.string(), ...claimed }),
  }),
  vision: z.object({
    title: z.string(),
    lead: z.string(),
    clauses: z
      .array(z.object({ before: z.string(), after: z.string(), line, icon: z.enum(["home", "family", "heart"]) }))
      .length(3),
    ...claimed,
  }),
  mission: z.object({
    title: z.string(),
    ...claimed,
    groups: z.object({
      lead: z.string(),
      items: z
        .array(
          z.object({
            name: z.string(),
            role: z.string(),
            icon: z.enum(["hospital", "stethoscope", "nurse", "flask", "wheelchair", "device"]),
          }),
        )
        .length(6),
      change: z.string(),
      ...claimed,
    }),
  }),
  values: z.object({
    intro: z.string(),
    items: z
      .array(z.object({ name: z.string(), lead: z.string(), text: z.string(), line, image: Illustration }))
      .length(4),
    ...claimed,
  }),
  founders: z.object({
    people: z
      .array(
        z.object({
          name: z.string(),
          known: z.string().optional(),
          role: z.string(),
          text: z.string().optional(),
          photo: devPhoto.optional(),
          line,
        }),
      )
      .length(4),
    ...claimed,
  }),
  promise: z.object({ lead: z.string(), lines: z.array(z.string()).min(1), close: z.string(), ...claimed }),
});

export type AboutContent = z.infer<typeof About>;
export const about = About.parse(aboutData);
