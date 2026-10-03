"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconCircleArrowRightFilled } from "@tabler/icons-react";
import { lines, shown, t } from "@/lib/content";
import { Thread } from "@/components/motion/Thread";
import s from "./Colonnade.module.css";

const c = t.colonnade;
type Slug = keyof typeof c.fields;

// Services on Home (D-030): three columns, one per line. Hover (fine pointers, after a short intent delay), focus or
// tap makes a column active; its field rides up while the previous one leaves through the top.
export function Colonnade() {
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [live, setLive] = useState(false);
  const intent = useRef<number>(0);

  // Marks the conveyor as JS-driven, so the text entrance only plays after a real interaction is possible.
  useEffect(() => {
    const id = requestAnimationFrame(() => setLive(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const activate = (i: number) => {
    window.clearTimeout(intent.current);
    if (i === active) return;
    setLeaving(active);
    setActive(i);
  };
  const hover = (i: number) => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => activate(i), 90);
  };

  return (
    <section className={`${s.sec} wrap`} id="lines" aria-labelledby="lines-title">
      <Thread enter />
      <header className={s.head}>
        <h2 id="lines-title" className="t-head" data-thread-stop>
          {c.title}
        </h2>
        <div className={s.aside}>
          <p>{c.lede.text}</p>
          <Link className={s.all} href="/services">
            {c.all}
            <IconCircleArrowRightFilled aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className={s.cols} data-live={live || undefined} onMouseLeave={() => window.clearTimeout(intent.current)}>
        {lines.map((line, i) => {
          const state = i === active ? "on" : i === leaving ? "off" : "idle";
          const id = `col-${line.slug}`;
          return (
            <article
              key={line.slug}
              className={s.col}
              data-line={line.line}
              data-state={state}
              onMouseEnter={() => hover(i)}
            >
              <div
                className={s.field}
                aria-hidden="true"
                onTransitionEnd={() => i === leaving && setLeaving(null)}
              />
              <h3 className={s.label}>
                <button
                  type="button"
                  aria-expanded={i === active}
                  aria-controls={id}
                  onClick={() => activate(i)}
                  onFocus={() => activate(i)}
                >
                  <span className={s.num}>{line.number}</span>
                  <span className={s.name}>{line.name}</span>
                  <span className={s.count}>
                    {line.services.length} {c.servicesCount}
                  </span>
                </button>
              </h3>
              {/* Every column keeps its headline (muted until active), so the frozen page is never blank paper. */}
              <p className={s.headline}>{c.fields[line.slug as Slug]}</p>
              <div className={s.detail} id={id} hidden={i !== active}>
                <div className={s.foot}>
                  <ul className={s.svcs}>
                    {/* The equipment ways await the owners (C-099, D-044): production names none, only the summary. */}
                    {line.summary && !shown(line.ways) ? (
                      <li style={{ "--i": 0 } as React.CSSProperties}>
                        <span>{line.summary.text}</span>
                      </li>
                    ) : (
                      line.services.map((svc, j) => (
                        <li key={svc.slug} style={{ "--i": j } as React.CSSProperties}>
                          <span>{svc.name}</span>
                          <span>{svc.who}</span>
                        </li>
                      ))
                    )}
                  </ul>
                  <Link className="btn sm" href="/contact">
                    {c.ask}
                    <IconCircleArrowRightFilled aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
