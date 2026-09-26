import type { Metadata } from "next";
import Link from "next/link";
import {
  IconAlertTriangleFilled,
  IconCircleArrowRightFilled,
  IconPhoneFilled,
} from "@tabler/icons-react";
import { config, lines, phoneDisplay, t } from "@/lib/content";
import s from "./page.module.css";

const p = t.servicesPage;

export const metadata: Metadata = {
  title: p.metaTitle,
  description: p.metaDescription,
};

// The line catalogue (D-025): Superpower's "What we test" structure (sticky rail with counts, quiet rows that
// open to one sentence) with each line's rows hung on its coloured spine, as on the Home trip.
// Rows are native <details>: no JS, keyboard and screen-reader behaviour for free, all closed by default.
export default function Page() {
  return (
    <>
      <section className={`${s.head} wrap`}>
        <div className={s.intro}>
          <h1 className="t-display">{p.title}</h1>
          <p className={s.lede}>{p.lede}</p>
        </div>
        <div className={s.reach}>
          <p className={s.promise}>{p.promise.text}</p>
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
      </section>

      <div className={`${s.body} wrap`}>
        <nav className={s.rail} aria-label={p.railTitle}>
          <p className={s.railTitle}>{p.railTitle}</p>
          <ul>
            {lines.map((line) => (
              <li key={line.slug} data-line={line.line}>
                <a href={`#${line.slug}`}>
                  <i aria-hidden="true" />
                  {line.name}
                  <span className={s.count}>({line.services.length})</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={s.lines}>
          {lines.map((line) => (
            <section
              key={line.slug}
              id={line.slug}
              className={s.line}
              data-line={line.line}
              aria-labelledby={`${line.slug}-title`}
            >
              <header className={s.lineHead}>
                <h2 id={`${line.slug}-title`}>
                  {line.name}{" "}
                  <span className={s.count}>{line.services.length}</span>
                </h2>
                <span className="badge">
                  <i style={{ background: "var(--line)" }} />
                  {t.services.lineLabel} {line.number}
                </span>
              </header>
              <div className={s.cols} aria-hidden="true">
                <span>{p.serviceCol}</span>
                <span>{line.whoLabel}</span>
              </div>
              <ul className={s.stops}>
                {line.services.map((svc) => (
                  <li key={svc.slug}>
                    <details className={s.stop}>
                      <summary>
                        <span className={s.name}>{svc.name}</span>
                        <span className={s.who}>{svc.who}</span>
                        <span className={s.pm} aria-hidden="true" />
                      </summary>
                      <div className={s.open}>
                        <p>{svc.text}</p>
                        <Link className={s.ask} href="/contact">
                          {p.ask} {svc.name}
                          <IconCircleArrowRightFilled aria-hidden="true" />
                        </Link>
                        <p className={s.fine}>{p.note.text}</p>
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
