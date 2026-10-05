"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { IconArrowRight, IconBrandWhatsappFilled, IconPhoneFilled } from "@tabler/icons-react";
import { t, type Line } from "@/lib/content";
import { LogoMark } from "@/components/LogoMark";
import { CallStatus } from "@/components/home/CallStatus";
import { Pending } from "@/components/about/Pending";
import s from "./Thread.module.css";

type ThreadItem = {
  slug: string;
  q: string;
  answer: string[];
  lines?: { line: Line; name: string; services: string[] }[];
  link?: { href: string; label: string };
  wa: string;
  pending: boolean;
};
export type ThreadStage = { slug: string; label: string; items: ThreadItem[] };

const p = t.faqPage;

// Hydrated: false on the server and in the first client render (so the HTML matches), true after. The server HTML has
// every reply open, which is what no-JS readers keep (Blueprint 9.5); the client then collapses them.
const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const useHash = () => useSyncExternalStore(subscribeHash, () => window.location.hash, () => "");

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Cue Kit Scrollspy Line: a 1000ms easeInOutQuart scroll, landing clear of the fixed nav. Reduced motion jumps.
function scrollToEl(el: HTMLElement) {
  const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
  const to = el.getBoundingClientRect().top + window.scrollY - nav - 32;
  if (reduced()) return window.scrollTo(0, to);
  const from = window.scrollY;
  const start = performance.now();
  const ease = (x: number) => (x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2);
  const step = (now: number) => {
    const k = Math.min(1, (now - start) / 1000);
    window.scrollTo(0, from + (to - from) * ease(k));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function Thread({
  stages,
  phone,
  phoneDisplay,
  whatsapp,
}: {
  stages: ThreadStage[];
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
}) {
  const hydrated = useHydrated();
  const hash = useHash();
  // What the reader opened or closed; anything untouched is closed, except the item a link pointed at.
  const [chosen, setChosen] = useState<Record<string, boolean>>({});
  const [anim, setAnim] = useState(false);
  const [active, setActive] = useState<string | undefined>(stages[0]?.slug);
  const thread = useRef<HTMLDivElement>(null);

  const isOpen = (slug: string) => !hydrated || (chosen[slug] ?? hash === `#q-${slug}`);

  const toggle = (slug: string) => {
    setAnim(true);
    setChosen((c) => ({ ...c, [slug]: !isOpen(slug) }));
  };

  // A deep link (/faq#q-areas): the server had every reply open, so once the others collapse, bring it back into view.
  useEffect(() => {
    if (!hash.startsWith("#q-")) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ block: "start" });
  }, [hash]);

  // The scrollspy: the stage whose block crosses a thin band a third of the way down the viewport (Cue Kit's detection
  // line). Between blocks nothing crosses it, so the last stage stays current.
  useEffect(() => {
    const root = thread.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.stage);
      },
      { rootMargin: "-33% 0px -66% 0px" },
    );
    root.querySelectorAll("[data-stage]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const jump = useCallback((slug: string) => {
    const heading = document.getElementById(`stage-${slug}`);
    if (!heading) return;
    scrollToEl(heading);
    heading.focus({ preventScroll: true });
  }, []);

  return (
    <div className={`${s.root} wrap`} data-js={hydrated || undefined} data-anim={anim || undefined}>
      <aside className={s.card} data-mode="ink" aria-label={p.card.name}>
        <p className={s.who} translate="no">
          <LogoMark className={s.mark} id="cs-faq-card" />
          {p.card.name}
        </p>
        <CallStatus className={s.status} dotClassName={s.dot} />
        <p className={s.promise}>{p.card.promise.text}</p>

        <nav className={s.index} aria-labelledby="faq-index">
          <p id="faq-index" className={s.indexTitle}>
            {p.card.index}
          </p>
          <ul>
            {stages.map((st) => (
              <li key={st.slug}>
                <a
                  href={`#stage-${st.slug}`}
                  className={s.stop}
                  aria-current={active === st.slug ? "true" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    jump(st.slug);
                  }}
                >
                  <i aria-hidden="true" />
                  {st.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={s.ways}>
          <a className="btn sm" href={`tel:${phone}`}>
            {p.card.call}
            <IconPhoneFilled aria-hidden="true" />
          </a>
          <a className={s.wa} href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
            <IconBrandWhatsappFilled aria-hidden="true" />
            {p.card.whatsapp}
          </a>
        </div>
      </aside>

      <div className={s.thread} ref={thread}>
        {stages.map((st) => (
          <section key={st.slug} className={s.stage} data-stage={st.slug} aria-labelledby={`stage-${st.slug}`}>
            <h2 id={`stage-${st.slug}`} tabIndex={-1}>
              {st.label}
            </h2>
            {st.items.map((item) => {
              const open = isOpen(item.slug);
              return (
                <div key={item.slug} id={`q-${item.slug}`} className={s.item} data-open={open}>
                  <h3>
                    <button
                      type="button"
                      className={s.ask}
                      aria-expanded={open}
                      aria-controls={`a-${item.slug}`}
                      onClick={() => toggle(item.slug)}
                    >
                      <span>
                        {item.q}
                        <Pending on={item.pending} />
                      </span>
                      <span className={s.toggle} aria-hidden="true" />
                    </button>
                  </h3>
                  <div className={s.body}>
                    <div className={s.clip}>
                      <div id={`a-${item.slug}`} role="region" aria-label={item.q} className={s.reply} data-mode="ink">
                        <p className={s.from} aria-hidden="true" translate="no">
                          <LogoMark id={`cs-faq-${item.slug}`} />
                          {p.replyFrom}
                        </p>
                        {item.answer.map((para) => (
                          <p key={para}>{para}</p>
                        ))}
                        {item.lines && (
                          <ul className={s.lines}>
                            {item.lines.map((l) => (
                              <li key={l.name} data-line={l.line}>
                                <i aria-hidden="true" />
                                <span>
                                  <b>{l.name}</b>
                                  {l.services.join(", ")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className={s.links}>
                          {item.link && (
                            <Link className={s.go} href={item.link.href}>
                              {item.link.label}
                              <IconArrowRight aria-hidden="true" />
                            </Link>
                          )}
                          <a className={s.go} href={item.wa} target="_blank" rel="noopener noreferrer">
                            <IconBrandWhatsappFilled aria-hidden="true" />
                            {p.askWa}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        ))}

        <section className={s.close} aria-labelledby="faq-close">
          <div className={s.reply} data-mode="ink">
            <p className={s.from} aria-hidden="true" translate="no">
              <LogoMark id="cs-faq-close" />
              {p.replyFrom}
            </p>
            <h2 id="faq-close">{p.close.title}</h2>
            <p>{p.close.text.replace("{phone}", phoneDisplay)}</p>
            <div className={s.closeWays}>
              <a className="btn sm" href={`tel:${phone}`}>
                {p.card.call}
                <IconPhoneFilled aria-hidden="true" />
              </a>
              <a className={s.wa} href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                <IconBrandWhatsappFilled aria-hidden="true" />
                {p.card.whatsapp}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
