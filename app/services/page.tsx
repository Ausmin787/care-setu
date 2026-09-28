import type { Metadata } from "next";
import Link from "next/link";
import {
  IconAlertTriangleFilled,
  IconArrowDown,
  IconCircleArrowRightFilled,
  IconPhoneFilled,
} from "@tabler/icons-react";
import { config, lines, phoneDisplay, t } from "@/lib/content";
import { CallStatus } from "@/components/home/CallStatus";
import { deckCards, ServiceDeck } from "@/components/services/ServiceDeck";
import { EquipmentSheet } from "@/components/services/EquipmentSheet";
import s from "./page.module.css";

const p = t.servicesPage;

export const metadata: Metadata = {
  title: p.metaTitle,
  description: p.metaDescription,
};

function Actions() {
  return (
    <div className={s.actions}>
      <Link className="btn" href="/contact">
        {p.cta}
        <IconCircleArrowRightFilled aria-hidden="true" />
      </Link>
      {config.phone && (
        <a className={s.tel} href={`tel:${config.phone}`}>
          <IconPhoneFilled aria-hidden="true" />
          {phoneDisplay}
        </a>
      )}
    </div>
  );
}

// Services (D-031): a type-led opener whose three lines jump into the deck, the stacked deck on an ink band, the
// equipment side by side (development only while C-041 is pending), and a closing band with the live call status.
export default function Page() {
  return (
    <>
      <section className={`${s.head} wrap`}>
        <h1 className="t-display">{p.title}</h1>
        <div className={s.headFoot}>
          <div className={s.intro}>
            <p className={s.lede}>{p.lede}</p>
            <Actions />
            <p className="sos">
              <IconAlertTriangleFilled aria-hidden="true" />
              <span>
                <b>{t.hero.emergencyTitle}</b>
                {t.hero.emergencyText}
              </span>
            </p>
          </div>
          <nav className={s.lines} aria-label={p.linesLabel}>
            <ol>
              {lines.map((line) => {
                const cards = deckCards.filter((c) => c.line === line.line);
                const first = deckCards.indexOf(cards[0]) + 1;
                const last = first + cards.length - 1;
                return (
                  <li key={line.slug} data-line={line.line}>
                    <a href={`#${cards[0].id}`} data-deck-link>
                      <span className={s.range}>
                        {String(first).padStart(2, "0")}
                        {last > first && `-${String(last).padStart(2, "0")}`}
                      </span>
                      <span className={s.lineName}>
                        <i aria-hidden="true" />
                        {line.name}
                      </span>
                      <IconArrowDown className={s.down} aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </section>

      <ServiceDeck />
      <EquipmentSheet />

      <section className={s.closing} aria-labelledby="closing-title">
        <div className={`${s.closingIn} wrap`}>
          <h2 id="closing-title" className="t-head">
            {p.closing.title}
          </h2>
          <div className={s.closingSide}>
            <p className={s.closingText}>{p.closing.text}</p>
            <p className={s.promise}>{p.promise.text}</p>
            <CallStatus className={s.status} dotClassName={s.dot} />
            <Actions />
          </div>
        </div>
      </section>
    </>
  );
}
