"use client";

import { useState } from "react";
import Link from "next/link";
import { IconCircleArrowRightFilled } from "@tabler/icons-react";
import { lines, t } from "@/lib/content";
import s from "./ServiceIndex.module.css";

type Line = (typeof lines)[number];

function Detail({ line }: { line: Line }) {
  return (
    <>
      <dl className={s.dl}>
        <div>
          <dt>{t.services.onLine}</dt>
          <dd>
            <ul className={s.list}>
              {line.services.map((svc) => (
                <li key={svc.slug}>{svc.name}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
      <Link className="btn" href="/contact">
        {t.services.ask}
        <IconCircleArrowRightFilled aria-hidden="true" />
      </Link>
      <Link className={s.more} href={`/services#${line.slug}`}>
        {t.services.seeLine}
      </Link>
    </>
  );
}

// Cue Kit split panel: one row open at a time; +/- from one bar; the side panel follows the open row.
// Rows are the three lines (D-025); the Services page lists every service on them.
export function ServiceIndex() {
  const [open, setOpen] = useState(lines[0].slug);
  const active = lines.find((x) => x.slug === open) ?? lines[0];

  return (
    <section className={`${s.svc} wrap`} id="lines" aria-labelledby="lines-title">
      <h2 id="lines-title" className="t-head">
        {t.services.title}
      </h2>
      <div className={s.grid}>
        <div>
          <ul className={s.rows}>
            {lines.map((line) => {
              const isOpen = line.slug === open;
              return (
                <li key={line.slug} className={s.item} data-line={line.line} data-open={isOpen}>
                  <button
                    type="button"
                    className={s.row}
                    aria-expanded={isOpen}
                    aria-controls={`svc-${line.slug}`}
                    onClick={() => setOpen(line.slug)}
                  >
                    <span className={s.n}>
                      {t.services.lineLabel} {line.number}
                    </span>
                    <span className={s.sw} aria-hidden="true" />
                    <span className={s.name}>{line.name}</span>
                    <span className={s.pm} aria-hidden="true" />
                  </button>
                  <div className={s.inline} id={`svc-${line.slug}`}>
                    <div className={s.inlineInner}>
                      <Detail line={line} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className={s.note}>{t.services.note}</p>
        </div>
        {/* Desktop only; the inline regions carry the same content on mobile (one is always display:none). */}
        <article className={s.panel} data-line={active.line} aria-live="polite">
          <div className={s.bar} />
          <h3>{active.name}</h3>
          <Detail line={active} />
        </article>
      </div>
    </section>
  );
}
