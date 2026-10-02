import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { IconAlertTriangleFilled, IconCircleArrowRightFilled } from "@tabler/icons-react";
import { config, phoneDisplay, t } from "@/lib/content";
import { CallStatus } from "@/components/home/CallStatus";
import s from "./not-found.module.css";

const p = t.notFound;

export const metadata: Metadata = { title: p.metaTitle };

// Each station takes a line colour, in the order the trip uses them (D-027: colour only on lines and discs).
const LINE_ORDER = ["lime", "blue", "olive", "lime"] as const;

// The 404 (Next serves it with status 404 and noindex). Offers only pages that exist, never a search box.
export default function NotFound() {
  return (
    <section className={`${s.opener} wrap`}>
      <div className={s.intro}>
        <p className={s.kicker}>{p.kicker}</p>
        <h1 className="t-display">{p.title}</h1>
        <p className={s.lede}>{p.lede}</p>
        <Link className="btn" href="/">
          {t.stub.back}
          <IconCircleArrowRightFilled aria-hidden="true" />
        </Link>
        {config.phone && (
          <div className={s.person}>
            <p className={s.ask}>{p.needPerson}</p>
            <p className={s.number}>
              <a href={`tel:${config.phone}`} aria-label={`${p.call} ${phoneDisplay}`}>
                {phoneDisplay}
              </a>
            </p>
            <CallStatus className={s.status} dotClassName={s.dot} />
          </div>
        )}
        <p className="sos">
          <IconAlertTriangleFilled aria-hidden="true" />
          <span>
            <b>{t.hero.emergencyTitle}</b>
            {t.hero.emergencyText}
          </span>
        </p>
      </div>
      <div>
        <h2 className={s.stationsTitle}>{p.stationsTitle}</h2>
        <ol className={s.stations}>
          <li className={s.here} style={{ "--i": 0 } as CSSProperties}>
            <div className={s.row}>
              <i className={s.disc} aria-hidden="true" />
              <span className={s.label}>{p.here}</span>
              <span className={s.meta}>{p.kicker}</span>
            </div>
          </li>
          {p.stations.map((station, i) => (
            <li key={station.href} data-line={LINE_ORDER[i]} style={{ "--i": i + 1 } as CSSProperties}>
              <Link className={s.row} href={station.href}>
                <i className={s.disc} aria-hidden="true" />
                <span className={s.label}>{station.label}</span>
                <span className={s.meta}>{station.meta}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
