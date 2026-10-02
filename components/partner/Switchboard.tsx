"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { IconCircleArrowDownFilled, IconMapPinFilled } from "@tabler/icons-react";
import { t, type Line } from "@/lib/content";
import type { Audience } from "@/lib/partner";
import type { PartnerKind } from "@/server/contracts/partners";
import { CallStatus } from "@/components/home/CallStatus";
import { Pending } from "@/components/about/Pending";
import { chooseAudience, motionOK, useAudience } from "./audience";
import { Stack } from "./Stack";
import s from "./Switchboard.module.css";

const p = t.partnerPage;

export type View = {
  kind: PartnerKind;
  tab: string;
  line: Line;
  // Home's approved partner-band row: what production shows while the deck content is pending.
  title: string;
  text: string;
  content?: Audience;
  steps?: string[];
};

type Dir = "next" | "prev";

// Words of a headline as inline blocks, so a swap can move them one by one (Unlumen Smart Animate Text, Smooth UI
// per-word crossfade). The motion only runs after the visitor has switched (data-dir), never on first paint.
function words(text: string) {
  return text.split(" ").map((word, i, all) => (
    <span key={i} className={s.w} style={{ "--i": i } as CSSProperties}>
      {word}
      {i < all.length - 1 ? " " : ""}
    </span>
  ));
}

// The re-deal (D-038): Cue Kit's Morphing Bento Product Showcase. One switch ("I'm a…", ARIA tabs) re-deals the same
// five cards for a hospital, a doctor or a care professional without changing the layout: card frames stay put while
// their contents slide in from the side the visitor moved towards, 45ms apart. The choice lives in `?for=` (replaced,
// not pushed, so Back still leaves the page) and is shared with the form. Not taken from the spec: tilt, cursor
// spotlight, magnetic buttons, shadows (DESIGN.md 6).
export function Switchboard(props: { views: View[]; initial: PartnerKind; startTitle?: string; formOpen: boolean }) {
  const { views, startTitle, formOpen } = props;
  const kind = useAudience(props.initial);
  const at = Math.max(
    0,
    views.findIndex((v) => v.kind === kind)
  );
  const view = views[at];
  const content = view.content;
  const [dir, setDir] = useState<Dir | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const bento = useRef<HTMLDivElement>(null);

  function choose(next: number, focus = false) {
    if (next === at) return;
    setDir(next > at ? "next" : "prev");
    const nextKind = views[next].kind;
    chooseAudience(nextKind);
    const url = new URL(window.location.href);
    url.searchParams.set("for", nextKind);
    window.history.replaceState(window.history.state, "", url);
    if (focus) tabs.current[next]?.focus();
  }

  // ARIA tabs: arrows move and select (automatic activation), Home and End jump to the ends.
  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    const last = views.length - 1;
    const keys: Record<string, number> = {
      ArrowRight: at === last ? 0 : at + 1,
      ArrowLeft: at === 0 ? last : at - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    choose(keys[event.key], true);
  }

  // First view: the five frames are dealt onto the table once (Cue Kit's per-card vectors, made small). Armed only if
  // the bento starts below the fold, so nothing a reader can already see is hidden; a JS-added attribute, so server
  // HTML, no-JS and reduced motion show the cards in place.
  useEffect(() => {
    const el = bento.current;
    if (!el || !motionOK() || el.getBoundingClientRect().top < window.innerHeight) return;
    el.dataset.armed = "";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.in = "";
        io.disconnect();
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const lineStyle = { "--at": at } as CSSProperties;
  const anyPending = views.some((v) => v.content?.pending);

  return (
    <div className={s.root} data-line={view.line}>
      <section className={`${s.opener} wrap`} aria-labelledby="partner-title">
        <div className={s.head}>
          <p className={s.kicker}>
            <i aria-hidden="true" />
            {p.kicker}
            <Pending on={anyPending} />
          </p>
          <h1 id="partner-title" key={kind} className={`t-display ${s.title}`} data-dir={dir ?? undefined}>
            {content ? (
              <>
                {words(content.headline.lead)} <em>{words(content.headline.rest)}</em>
              </>
            ) : (
              t.partner.title
            )}
          </h1>
          <p key={`lede-${kind}`} className={s.lede} data-dir={dir ?? undefined}>
            {content ? content.lede : view.text}
          </p>
        </div>

        {/* The instrument (Blueprint 8.3): where visits happen (C-032) and whether calls are taken right now. */}
        <div className={s.instrument}>
          <p className={s.area}>
            <IconMapPinFilled aria-hidden="true" />
            {p.area.text}
          </p>
          <CallStatus className={s.status} dotClassName={s.dot} />
        </div>

        <div className={s.switchRow}>
          <span id="partner-switch-label" className={s.switchLabel}>
            {p.switchLabel}
          </span>
          <div
            className={s.track}
            role="tablist"
            aria-labelledby="partner-switch-label"
            style={lineStyle}
            onKeyDown={onKey}
          >
            <span className={s.indicator} aria-hidden="true" />
            {views.map((v, i) => (
              <button
                key={v.kind}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                id={`partner-tab-${v.kind}`}
                type="button"
                role="tab"
                className={s.tab}
                data-line={v.line}
                aria-selected={i === at}
                aria-controls="partner-panel"
                tabIndex={i === at ? 0 : -1}
                onClick={() => choose(i)}
              >
                <i aria-hidden="true" />
                {v.tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div
        id="partner-panel"
        role="tabpanel"
        aria-labelledby={`partner-tab-${view.kind}`}
        className={`${s.panel} wrap`}
      >
        {content ? (
          <div ref={bento} className={s.bento} data-dir={dir ?? undefined}>
            <article className={`${s.card} ${s.stack}`} data-mode="ink" style={{ "--i": 0 } as CSSProperties}>
              {/* Cue Kit's card one: a lighter tray nested in the ink frame holds the stack; the title sits below. */}
              <div key={kind} className={s.body}>
                <div className={s.tray}>
                  <Stack items={content.stack.items} replay={dir !== null} />
                </div>
                <p className={s.ck}>
                  <i aria-hidden="true" />
                  {p.cards.stack}
                </p>
                <h2>{content.stack.title}</h2>
              </div>
            </article>

            <article className={`${s.card} ${s.why}`} style={{ "--i": 1 } as CSSProperties}>
              <div key={kind} className={s.body}>
                <p className={s.ck}>
                  <i aria-hidden="true" />
                  {p.cards.why}
                </p>
                <h2>{content.why.title}</h2>
                <ul className={s.points}>
                  {content.why.items.map((item) => (
                    <li key={item.head}>
                      <b>{item.head}</b>
                      {item.text && <span>{item.text}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <article className={`${s.card} ${s.start}`} data-mode="ink" style={{ "--i": 2 } as CSSProperties}>
              <div key={kind} className={s.body}>
                <p className={s.ck}>
                  <i aria-hidden="true" />
                  {p.cards.start}
                </p>
                <h2>{startTitle}</h2>
                {view.steps && (
                  <ol className={s.steps}>
                    {view.steps.map((step, i) => (
                      <li key={step}>
                        <span className={s.n} aria-hidden="true">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
                {formOpen && (
                  <a className="btn sm" href="#partner-form">
                    {p.startCta}
                    <IconCircleArrowDownFilled aria-hidden="true" />
                  </a>
                )}
              </div>
            </article>

            <article className={`${s.card} ${s.offer}`} style={{ "--i": 3 } as CSSProperties}>
              <div key={kind} className={s.body}>
                <p className={s.ck}>
                  <i aria-hidden="true" />
                  {p.cards.offer}
                </p>
                <h2>{content.offer.title}</h2>
                <ul className={s.points}>
                  {content.offer.items.map((item) => (
                    <li key={item.head}>
                      <b>{item.head}</b>
                      {item.text && <span>{item.text}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <article className={`${s.card} ${s.quote}`} style={{ "--i": 4 } as CSSProperties}>
              <div key={kind} className={s.body}>
                <p className={s.ck}>
                  <i aria-hidden="true" />
                  {p.cards.quote}
                </p>
                <blockquote>
                  <p>&ldquo;{content.quote}&rdquo;</p>
                </blockquote>
              </div>
            </article>
          </div>
        ) : (
          <div key={kind} className={s.role} data-dir={dir ?? undefined}>
            <h2>{view.title}</h2>
          </div>
        )}
      </div>
    </div>
  );
}
