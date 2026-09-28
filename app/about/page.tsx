import type { Metadata } from "next";
import Link from "next/link";
import { IconAlertTriangleFilled, IconCircleArrowRightFilled, IconPhoneFilled } from "@tabler/icons-react";
import { about } from "@/lib/about";
import { config, phoneDisplay, shown, t } from "@/lib/content";
import { CallStatus } from "@/components/home/CallStatus";
import { Opener } from "@/components/about/Opener";
import { Letter } from "@/components/about/Letter";
import { Manifesto } from "@/components/about/Manifesto";
import { Values } from "@/components/about/Values";
import { Founders } from "@/components/about/Founders";
import { Pending } from "@/components/about/Pending";
import s from "./page.module.css";

const p = t.aboutPage;

export const metadata: Metadata = {
  title: p.metaTitle,
  description: p.metaDescription,
};

// About (D-032): the founder's question, his letter, the vision and mission, the four values, the founders, and the
// promise with the ways to reach us. Everything from the founders' deck is pending (development only, Q20); a
// production build shows the opener's approved fallback and the close.
export default function Page() {
  const promise = shown(about.promise);

  return (
    <>
      <Opener />
      <Letter />
      <Manifesto />
      <Values />
      <Founders />

      <section className={s.close} aria-labelledby="close-title">
        <div className={`${s.closeIn} wrap`}>
          {promise ? (
            <div className={s.promise}>
              <p className={s.kicker}>
                {p.promiseKicker}
                <Pending on={promise.pending} />
              </p>
              <h2 id="close-title" className={`t-head ${s.lead}`}>
                &ldquo;{promise.lead}&rdquo;
              </h2>
              <ol className={s.lines}>
                {promise.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
              <p className={`t-display ${s.last}`}>{promise.close}</p>
            </div>
          ) : (
            <h2 id="close-title" className="t-head">
              {t.servicesPage.closing.title}
            </h2>
          )}
          <div className={s.side}>
            <p className={s.note}>{t.servicesPage.promise.text}</p>
            <CallStatus className={s.status} dotClassName={s.dot} />
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
            <p className="sos">
              <IconAlertTriangleFilled aria-hidden="true" />
              <span>
                <b>{t.hero.emergencyTitle}</b>
                {t.hero.emergencyText}
              </span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
