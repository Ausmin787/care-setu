import Link from "next/link";
import {
  IconAlertTriangleFilled,
  IconCircleArrowRightFilled,
  IconFileInvoiceFilled,
  IconMapPinFilled,
  IconPhoneCallFilled,
} from "@tabler/icons-react";
import { t } from "@/lib/content";
import { CallStatus } from "./CallStatus";
import { HeroVideo } from "./HeroVideo";
import s from "./Hero.module.css";

const icons = {
  phone: IconPhoneCallFilled,
  invoice: IconFileInvoiceFilled,
  pin: IconMapPinFilled,
} as const;

// Word masks for the CSS entrance (server-rendered, so nothing hides after first paint).
function Words({ words, from }: { words: string[]; from: number }) {
  return words.map((w, i) => (
    <span key={i}>
      {i > 0 && " "}
      <span className={s.w} style={{ "--i": from + i } as React.CSSProperties}>
        <span>{w}</span>
      </span>
    </span>
  ));
}

// Warm Room hero (D-027). Function Health's layout (a face at right in warm light, a light serif at left, a
// divided fact row, a pause control) carrying myhealthprac's full-bleed loop and pill. Text sits on an ink
// scrim, so the section runs in ink mode.
export function Hero() {
  const [before, highlight, after] = t.hero.title.split(/(at home)/);
  const lead = before.trim().split(" ");
  const hl = (highlight + after).split(" "); // the full stop rides with the last word
  return (
    <section className={s.hero} data-mode="ink" data-nav-over aria-labelledby="hero-title">
      <div className={s.media}>
        <HeroVideo className={s.video} buttonClassName={s.pause} />
      </div>
      <div className={`${s.inner} wrap`}>
        <h1 id="hero-title" className={`${s.title} t-display`}>
          <Words words={lead} from={0} /> <em className={s.hl}><Words words={hl} from={lead.length} /></em>
        </h1>
        <p className={s.lede}>{t.hero.lede}</p>
        <div className={s.actions}>
          <Link className="btn" href="/contact">
            {t.hero.cta}
            <IconCircleArrowRightFilled aria-hidden="true" />
          </Link>
          <CallStatus className={s.status} dotClassName={s.dot} />
        </div>
        <ul className={s.facts}>
          {t.hero.reassure.map((r) => {
            const Icon = icons[r.icon as keyof typeof icons];
            return (
              <li key={r.claim}>
                <Icon aria-hidden="true" />
                {r.text}
              </li>
            );
          })}
        </ul>
        <p className={`sos ${s.sos}`}>
          <IconAlertTriangleFilled aria-hidden="true" />
          <span>
            <b>{t.hero.emergencyTitle}</b>
            {t.hero.emergencyText}
          </span>
        </p>
      </div>
    </section>
  );
}
