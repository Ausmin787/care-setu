import { lines, t, type Detail, type Line, type Price } from "@/lib/content";

type Service = (typeof lines)[number]["services"][number];

// One detail page per deck card (D-031, D-043): seven services and the equipment line, in deck order.
export type ServicePage = {
  slug: string;
  number: string; // "01".."08", the deck card's number
  line: Line;
  lineSlug: string;
  lineName: string;
  name: string;
  who: string;
  text?: string;
  image?: Service["image"];
  price?: Price;
  parts?: Service[]; // the equipment line's rent, buy and sell back, shown only while `ways` is (C-099, D-044)
  ways?: { claim: string; pending: boolean };
  detail: Detail;
};

function need(detail: Detail | undefined, slug: string): Detail {
  if (!detail) throw new Error(`content/services.json: ${slug} has no detail block (D-043)`);
  return detail;
}

export const servicePages: ServicePage[] = lines
  .flatMap((line): Omit<ServicePage, "number">[] =>
    line.slug === "equipment"
      ? [
          {
            slug: line.slug,
            line: line.line,
            lineSlug: line.slug,
            lineName: line.name,
            name: line.name,
            // The approved summary (C-098) stands in for the unconfirmed ways (D-044).
            who: line.summary?.who ?? t.servicesPage.deck.equipmentWho,
            text: line.summary?.text,
            image: line.services[0].image,
            price: line.services[0].price,
            parts: line.services,
            ways: line.ways,
            detail: need(line.detail, line.slug),
          },
        ]
      : line.services.map((svc) => ({
          slug: svc.slug,
          line: line.line,
          lineSlug: line.slug,
          lineName: line.name,
          name: svc.name,
          who: svc.who,
          text: svc.text,
          image: svc.image,
          price: svc.price,
          detail: need(svc.detail, svc.slug),
        })),
  )
  .map((page, i) => ({ ...page, number: String(i + 1).padStart(2, "0") }));

export const servicePage = (slug: string) => servicePages.find((p) => p.slug === slug);

// The other services in the same line, in deck order.
export const siblingsOf = (page: ServicePage) =>
  servicePages.filter((p) => p.lineSlug === page.lineSlug && p.slug !== page.slug);

// The first service of the next line (the equipment line wraps round to the first).
export function nextLineOf(page: ServicePage): ServicePage {
  const i = lines.findIndex((l) => l.slug === page.lineSlug);
  const next = lines[(i + 1) % lines.length];
  return servicePages.find((p) => p.lineSlug === next.slug)!;
}

// The shared element name that morphs a deck card or tile into its page's hero (React <ViewTransition>, D-043).
export const morphName = (slug: string) => `svc-${slug}`;
