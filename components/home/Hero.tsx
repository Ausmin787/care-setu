import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import {
  IconAlertTriangleFilled,
  IconCircleArrowRightFilled,
  IconFileInvoiceFilled,
  IconMapPinFilled,
  IconPhoneCallFilled,
} from "@tabler/icons-react";
import { t } from "@/lib/content";
import s from "./Hero.module.css";

// Supplied by Sasanka from ChatGPT image (D-021, CLAIMS C-027). Until then the panel is a placeholder.
const ILLUSTRATION = "/illustrations/hero-care-scene.png";
const illustrationPath = path.join(process.cwd(), "public", ILLUSTRATION);

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

export function Hero() {
  const [before, highlight, after] = t.hero.title.split(/(at home)/);
  const lead = before.trim().split(" ");
  const hl = (highlight + after).split(" "); // the full stop rides with the last word
  const hasIllustration = existsSync(illustrationPath); // checked per render, so a dropped-in file shows at once
  return (
    <section className={`${s.hero} wrap`} aria-labelledby="hero-title">
      <h1 id="hero-title" className={`${s.title} t-display`}>
        <Words words={lead} from={0} />{" "}
        <span className={s.hl} style={{ "--i": lead.length + hl.length } as React.CSSProperties}>
          <Words words={hl} from={lead.length} />
        </span>
      </h1>
      <p className={s.lede}>{t.hero.lede}</p>
      <div className={s.actions}>
        <Link className="btn" href="/contact">
          {t.hero.cta}
          <IconCircleArrowRightFilled aria-hidden="true" />
        </Link>
      </div>
      <ul className={s.reassure}>
        {t.hero.reassure.map((r) => {
          const Icon = icons[r.icon as keyof typeof icons];
          return (
            <li key={r.claim}>
              <span className={s.tile}>
                <Icon aria-hidden="true" />
              </span>
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
      <figure className={s.panel} data-hero-panel>
        {hasIllustration ? (
          <Image
            src={ILLUSTRATION}
            alt={t.hero.illustrationAlt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 45vw"
            className={s.img}
          />
        ) : (
          <figcaption className={s.pending}>{t.hero.illustrationPending}</figcaption>
        )}
      </figure>
    </section>
  );
}
