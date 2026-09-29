import Image from "next/image";
import Link from "next/link";
import { IconCircleArrowRightFilled, IconCircleCheckFilled } from "@tabler/icons-react";
import { formatPaise, lines, shown, shownPrice, t, type Line } from "@/lib/content";
import { Deck } from "@/components/motion/Deck";
import s from "./ServiceDeck.module.css";

const p = t.servicesPage;
const d = p.deck;

type Service = (typeof lines)[number]["services"][number];
export type DeckCard = {
  id: string;
  line: Line;
  lineName: string;
  name: string;
  who: string;
  text?: string;
  parts?: Service[];
  scope?: Service["scope"];
  price?: Service["price"];
  image?: Service["image"];
  ask: string;
  // The service the card's "Talk to us" pre-selects on /contact (D-033); the equipment card has none.
  service?: string;
};

// Eight cards, one per launch service (D-024); the equipment line is one card holding rent, buy and sell back (D-031).
export const deckCards: DeckCard[] = lines.flatMap((line): DeckCard[] =>
  line.slug === "equipment"
    ? [
        {
          id: `card-${line.slug}`,
          line: line.line,
          lineName: line.name,
          name: line.name,
          who: d.equipmentWho,
          parts: line.services,
          // No item list here: the equipment sheet right after the deck lists the items side by side.
          price: line.services[0].price,
          image: line.services[0].image,
          ask: line.name.toLowerCase(),
        },
      ]
    : line.services.map((svc) => ({
        id: `card-${svc.slug}`,
        line: line.line,
        lineName: line.name,
        name: svc.name,
        who: svc.who,
        text: svc.text,
        scope: svc.scope,
        price: svc.price,
        image: svc.image,
        ask: svc.name,
        service: svc.slug,
      })),
);

const two = (n: number) => String(n).padStart(2, "0");

function PendingTag({ pending }: { pending: boolean }) {
  return pending ? (
    <span className="pending" title={t.pending.title}>
      {t.pending.tag}
    </span>
  ) : null;
}

// The services as a stacked deck (D-031), after Cue Kit's "Stacked Deck Scroll Reveal" (spec in
// refs/care-setu/cuekit/stacked-deck-spec.md): flat colour cards, text | image, on a dark stage, plus GetLayers Cards
// Cascade's chapter counter. Resting state (no JS, touch, reduced motion) is the cards in order; Deck pins and deals them.
export function ServiceDeck() {
  const total = two(deckCards.length);
  return (
    <section className={s.sec} data-mode="ink" id="services" aria-labelledby="deck-title">
      <Deck className={s.stage}>
        <header className={s.head}>
          <h2 id="deck-title" className={s.title}>
            {d.title}
          </h2>
          <p className={s.sub}>{p.note.text}</p>
        </header>
        <div className={s.body}>
          <ol className={s.deck} data-deck aria-describedby="deck-hint">
            {deckCards.map((card, i) => {
              const scope = shown(card.scope);
              const price = shownPrice(card.price);
              return (
                <li
                  key={card.id}
                  id={card.id}
                  className={s.card}
                  data-line={card.line}
                  data-card
                  data-line-name={card.lineName}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <article className={s.inner} aria-labelledby={`${card.id}-name`}>
                    <div className={s.text}>
                      <div className={s.top}>
                        <h3 id={`${card.id}-name`}>{card.name}</h3>
                        <span className={s.idx} aria-hidden="true">
                          {two(i + 1)}
                        </span>
                      </div>
                      <p className={s.meta}>
                        <i aria-hidden="true" />
                        {card.who} · {card.lineName}
                      </p>
                      {card.text && <p className={s.lede}>{card.text}</p>}
                      {card.parts && (
                        <dl className={s.parts}>
                          {card.parts.map((part) => (
                            <div key={part.slug}>
                              <dt>{part.name}</dt>
                              <dd>{part.text}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      {scope && (
                        <div className={s.covers}>
                          <h4>
                            {p.covers}
                            <PendingTag pending={scope.pending} />
                          </h4>
                          <ul>
                            {scope.items.map((item) => (
                              <li key={item}>
                                <IconCircleCheckFilled aria-hidden="true" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {price && (
                        <p className={s.price}>
                          {price.from && `${p.from} `}
                          {formatPaise(price.paise)} {price.unit}
                          <PendingTag pending={price.pending} />
                          <span className={s.fine}> {p.priceNote}</span>
                        </p>
                      )}
                      <div className={s.foot}>
                        <Link
                          className="btn"
                          href={card.service ? `/contact?service=${card.service}#enquiry` : "/contact"}
                        >
                          {p.ask} {card.ask}
                          <IconCircleArrowRightFilled aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                    <div className={s.media}>
                      {card.image ? (
                        <Image
                          className={s.img}
                          src={card.image.src}
                          alt={card.image.alt}
                          fill
                          sizes="(max-width: 900px) 92vw, 540px"
                          style={{ objectPosition: `50% ${card.image.focus}` }}
                        />
                      ) : (
                        <>
                          <span className={s.n} aria-hidden="true">
                            {two(i + 1)}
                          </span>
                          {/* A note for the owners' review only; visitors see the type-led slot. */}
                          {process.env.NODE_ENV !== "production" && <span className={s.soon}>{d.imageSlot}</span>}
                        </>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
          {/* Chapter counter (Cards Cascade): the number, the three lines in proportion, the current line's name.
              Only shown while the deck is live; each card carries its own number and line otherwise. */}
          <div className={s.rail} aria-hidden="true" data-rail>
            <p className={s.count}>
              <span data-rail-n>01</span>
              <small>
                {d.of} {total}
              </small>
            </p>
            <div className={s.track}>
              {lines.map((line) => (
                <span
                  key={line.slug}
                  data-line={line.line}
                  style={{ flexGrow: deckCards.filter((c) => c.line === line.line).length }}
                />
              ))}
              <b data-rail-dot />
            </div>
            <p className={s.label} data-rail-label>
              {deckCards[0].lineName}
            </p>
          </div>
        </div>
        <p id="deck-hint" className="sr">
          {d.hint}
        </p>
      </Deck>
    </section>
  );
}
