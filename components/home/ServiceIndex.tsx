"use client";

import { useState } from "react";
import Link from "next/link";
import { IconCircleArrowRightFilled } from "@tabler/icons-react";
import { services, t } from "@/lib/content";
import s from "./ServiceIndex.module.css";

type Service = (typeof services)[number];

function Detail({ svc }: { svc: Service }) {
  return (
    <>
      <dl className={s.dl}>
        <div>
          <dt>{t.services.whenLabel}</dt>
          <dd>{svc.when}</dd>
        </div>
        <div>
          <dt>{t.services.coversLabel}</dt>
          <dd>{svc.covers}</dd>
        </div>
      </dl>
      <Link className="btn" href="/contact">
        {t.services.ask}
        <IconCircleArrowRightFilled aria-hidden="true" />
      </Link>
    </>
  );
}

// Cue Kit split panel: one row open at a time; +/- from one bar; the side panel follows the open row.
export function ServiceIndex() {
  const [open, setOpen] = useState(services[0].slug);
  const active = services.find((x) => x.slug === open) ?? services[0];

  return (
    <section className={`${s.svc} wrap`} id="lines" aria-labelledby="lines-title">
      <h2 id="lines-title" className="t-head">
        {t.services.title}
      </h2>
      <div className={s.grid}>
        <div>
          <ul className={s.rows}>
            {services.map((svc) => {
              const isOpen = svc.slug === open;
              return (
                <li key={svc.slug} className={s.item} data-line={svc.line} data-open={isOpen}>
                  <button
                    type="button"
                    className={s.row}
                    aria-expanded={isOpen}
                    aria-controls={`svc-${svc.slug}`}
                    onClick={() => setOpen(svc.slug)}
                  >
                    <span className={s.n}>
                      {t.services.lineLabel} {svc.number}
                    </span>
                    <span className={s.sw} aria-hidden="true" />
                    <span className={s.name}>{svc.name}</span>
                    <span className={s.pm} aria-hidden="true" />
                  </button>
                  <div className={s.inline} id={`svc-${svc.slug}`}>
                    <div className={s.inlineInner}>
                      <Detail svc={svc} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className={s.note}>{t.services.examplesNote}</p>
        </div>
        {/* Desktop only; the inline regions carry the same content on mobile (one is always display:none). */}
        <article className={s.panel} data-line={active.line} aria-live="polite">
          <div className={s.bar} />
          <h3>{active.name}</h3>
          <Detail svc={active} />
        </article>
      </div>
    </section>
  );
}
