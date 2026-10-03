import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import {
  IconAlertTriangleFilled,
  IconCircleArrowRightFilled,
  IconFileInvoiceFilled,
  IconPhoneFilled,
  IconUserFilled,
} from "@tabler/icons-react";
import { config, formatPaise, phoneDisplay, shown, shownPrice, t } from "@/lib/content";
import { morphName, nextLineOf, servicePages, siblingsOf, type ServicePage } from "@/lib/services";
import { CallStatus } from "@/components/home/CallStatus";
import { Dolly } from "@/components/motion/Dolly";
import { Ticks } from "@/components/motion/Ticks";
import s from "./Detail.module.css";

const d = t.serviceDetail;
const sp = t.servicesPage;
const fill = (text: string, values: Record<string, string>) =>
  text.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? "");
const two = (n: number) => String(n).padStart(2, "0");

function PendingTag({ pending }: { pending: boolean }) {
  return pending ? (
    <span className="pending" title={t.pending.title}>
      {t.pending.tag}
    </span>
  ) : null;
}

const askHref = (page: ServicePage) => (page.parts ? "/contact" : `/contact?service=${page.slug}#enquiry`);

function Actions({ page }: { page: ServicePage }) {
  return (
    <div className={s.actions}>
      <Link className="btn" href={askHref(page)}>
        {sp.ask} {page.parts ? page.name.toLowerCase() : page.name}
        <IconCircleArrowRightFilled aria-hidden="true" />
      </Link>
      {config.phone && (
        <a className={s.tel} href={`tel:${config.phone}`}>
          <IconPhoneFilled aria-hidden="true" />
          {phoneDisplay}
        </a>
      )}
    </div>
  );
}

// The still-life in its tinted frame. The frame is the shared element: the deck card's image panel and the tiles carry
// the same name, so React morphs one into the other on navigation (D-043). The hero arrives with `share="morph"`; a
// tile arriving on the next page carries `share="tile"`, whose group globals.css doesn't animate, so the other tiles
// and the deck cards behind don't slide about (`"none"` would cancel the clicked tile's own morph too, tested).
function Still({
  page,
  className,
  sizes,
  priority,
  share,
}: {
  page: ServicePage;
  className: string;
  sizes: string;
  priority?: boolean;
  share: "morph" | "tile";
}) {
  return (
    <ViewTransition name={morphName(page.slug)} share={share} default="none">
      <div className={className}>
        {page.image ? (
          <Image
            className={s.img}
            src={page.image.src}
            alt={page.image.alt}
            fill
            sizes={sizes}
            priority={priority}
            style={{ objectPosition: `50% ${page.image.focus}` }}
          />
        ) : (
          <span className={s.n} aria-hidden="true">
            {page.number}
          </span>
        )}
      </div>
    </ViewTransition>
  );
}

// Hero (GetLayers Aerra): on the ink stage of the Services deck, the name and the ask, then the service's tinted panel,
// which opens to full bleed as the page scrolls (Dolly).
function Hero({ page }: { page: ServicePage }) {
  return (
    <section className={s.hero} data-mode="ink" aria-labelledby="svc-title">
      <div className={`${s.heroTop} wrap`}>
        <nav aria-label={d.crumbs}>
          <ol className={s.crumbs}>
            <li>
              <Link href="/services">{d.services}</Link>
            </li>
            <li aria-current="page">{page.name}</li>
          </ol>
        </nav>
        <p className={s.count} aria-hidden="true">
          {page.number}
          <small>
            {sp.deck.of} {two(servicePages.length)}
          </small>
        </p>
      </div>
      <div className={`${s.heroHead} wrap`}>
        <h1 id="svc-title" className={`t-display ${s.title}`}>
          {page.name}
        </h1>
        <div className={s.heroSide}>
          <p className={s.meta}>
            <i aria-hidden="true" />
            {page.who} · {page.lineName}
          </p>
          <Actions page={page} />
        </div>
      </div>
      <Dolly className={s.dolly}>
        <Still page={page} className={s.panel} sizes="100vw" priority share="morph" />
      </Dolly>
    </section>
  );
}

// About (Aerra's "About the house"): the owners' one-line description, then three facts. The equipment page lists its
// three ways (rent, buy, sell back) instead.
function About({ page }: { page: ServicePage }) {
  const price = shownPrice(page.price);
  const parts = page.parts && shown(page.ways) ? page.parts : undefined;
  return (
    <section className={`${s.split} ${s.sec} wrap`} aria-labelledby="about-title">
      <h2 id="about-title" className={s.label}>
        <i aria-hidden="true" />
        {d.about}
      </h2>
      <div>
        {page.text && <p className={s.aboutText}>{page.text}</p>}
        {parts && (
          <dl className={s.parts}>
            {parts.map((part) => (
              <div key={part.slug}>
                <dt>{part.name}</dt>
                <dd>
                  <b>{part.who}.</b> {part.text}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <dl className={s.facts}>
          {/* The equipment page's three ways already say who does what, and its line is its name. */}
          {!page.parts && (
            <>
              <div>
                <dt>
                  <IconUserFilled aria-hidden="true" />
                  {d.facts.who}
                </dt>
                <dd>{page.who}</dd>
              </div>
              <div>
                <dt>
                  <i className={s.disc} aria-hidden="true" />
                  {d.facts.line}
                </dt>
                <dd>{page.lineName}</dd>
              </div>
            </>
          )}
          <div>
            <dt>
              <IconFileInvoiceFilled aria-hidden="true" />
              {d.facts.quote}
            </dt>
            <dd>{sp.note.text}</dd>
          </div>
        </dl>
        {price && (
          <p className={s.price}>
            {price.from && `${sp.from} `}
            {formatPaise(price.paise)} {price.unit}
            <PendingTag pending={price.pending} />
            <span className={s.fine}> {sp.priceNote}</span>
          </p>
        )}
      </div>
    </section>
  );
}

// Who it's for (Aerra's "Who this is for"): the deck's situations as a numbered serif index, not a card row.
function ForWhom({ page }: { page: ServicePage }) {
  const detail = shown(page.detail);
  if (!detail?.forWhom.length) return null;
  return (
    <section className={`${s.split} ${s.sec} wrap`} aria-labelledby="for-title">
      <header>
        <h2 id="for-title" className={s.label}>
          <i aria-hidden="true" />
          {d.forWhom.title}
          <PendingTag pending={detail.pending} />
        </h2>
        <p className={s.lede}>{d.forWhom.lede}</p>
      </header>
      <ol className={s.index}>
        {detail.forWhom.map((item, i) => (
          <li key={item}>
            <span className={s.num} aria-hidden="true">
              {two(i + 1)}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// What's included (Superpower's rows): beside the sticky still-life, each item ticks as it crosses 70% of the screen
// (Ticks, the mechanic of About's wishes, D-032, here packing the kit).
function Includes({ page }: { page: ServicePage }) {
  const detail = shown(page.detail);
  if (!detail?.includes.length) return null;
  return (
    <section className={`${s.kitSec} ${s.sec} wrap`} aria-labelledby="inc-title">
      <div className={s.kitAside}>
        <h2 id="inc-title" className={s.label}>
          <i aria-hidden="true" />
          {d.includes.title}
          <PendingTag pending={detail.pending} />
        </h2>
        <p className={s.lede}>{d.includes.lede}</p>
        <div className={s.kitFrame} aria-hidden="true">
          {page.image && (
            <Image
              className={s.img}
              src={page.image.src}
              alt=""
              fill
              sizes="(max-width: 900px) 0px, 36vw"
              style={{ objectPosition: `50% ${page.image.focus}` }}
            />
          )}
        </div>
      </div>
      <Ticks className={s.kit}>
        {detail.includes.map((item) => (
          <li key={item} data-tick>
            <span className={s.tick} aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} />
              </svg>
            </span>
            <p>{item}</p>
          </li>
        ))}
      </Ticks>
    </section>
  );
}

// Your route: this service's own stops on a horizontal line in its colour, the live call status at the first stop
// (the instrument). The shared stops are approved copy (C-024, C-025, C-031); the service's own are its pending row.
function Route({ page }: { page: ServicePage }) {
  const detail = shown(page.detail);
  const r = d.route;
  const stops = [
    { ...r.call, status: true },
    r.callback,
    ...(detail?.assess ? [{ ...detail.assess, pending: detail.pending }] : []),
    r.quote,
    ...(detail ? [{ ...detail.begins, pending: detail.pending }] : []),
  ];
  return (
    <section className={`${s.route} ${s.sec} wrap`} aria-labelledby="route-title">
      <header className={s.routeHead}>
        <h2 id="route-title" className={s.label}>
          <i aria-hidden="true" />
          {r.title}
        </h2>
        <p className={s.lede}>{r.lede}</p>
      </header>
      <ol className={s.stops} style={{ "--n": stops.length } as React.CSSProperties}>
        {stops.map((stop, i) => (
          <li key={stop.title}>
            <span className={s.stopDisc} aria-hidden="true">
              {i + 1}
            </span>
            <h3>
              {stop.title}
              {"pending" in stop && <PendingTag pending={stop.pending} />}
            </h3>
            <p>{stop.text}</p>
            {"status" in stop && <CallStatus className={s.status} dotClassName={s.dot} />}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Tile({ page, label }: { page: ServicePage; label?: string }) {
  return (
    <li data-line={page.line}>
      <Link className={s.tile} href={`/services/${page.slug}`}>
        <Still page={page} className={s.tileStill} sizes="(max-width: 900px) 92vw, 300px" share="tile" />
        <span className={s.tileText}>
          {label && <span className={s.tileLabel}>{label}</span>}
          <span className={s.tileName}>{page.name}</span>
          <span className={s.tileWho}>
            {page.who} · {page.number}
          </span>
        </span>
        <IconCircleArrowRightFilled className={s.tileArrow} aria-hidden="true" />
      </Link>
    </li>
  );
}

// The other services in the line (Skiper 23: the chosen tile becomes the page) and the next line's first service.
function More({ page }: { page: ServicePage }) {
  const siblings = siblingsOf(page);
  const next = nextLineOf(page);
  return (
    <nav className={`${s.sec} wrap`} aria-labelledby="more-title">
      <h2 id="more-title" className={s.label}>
        <i aria-hidden="true" />
        {siblings.length ? fill(d.siblings, { line: page.lineName }) : fill(d.nextLine, { line: next.lineName })}
      </h2>
      <ul className={s.tiles}>
        {siblings.map((p) => (
          <Tile key={p.slug} page={p} />
        ))}
        <Tile page={next} label={siblings.length ? fill(d.nextLine, { line: next.lineName }) : undefined} />
      </ul>
    </nav>
  );
}

function Close({ page }: { page: ServicePage }) {
  return (
    <section className={s.close} aria-labelledby="close-title">
      <div className={`${s.closeIn} wrap`}>
        <div>
          <h2 id="close-title" className="t-head">
            {fill(d.close.title, { name: page.parts ? page.name.toLowerCase() : page.name })}
          </h2>
          <Link className={s.back} href="/services">
            {d.back}
          </Link>
        </div>
        <div className={s.closeSide}>
          <p className={s.closeText}>{d.close.text}</p>
          <p className={s.promise}>{sp.promise.text}</p>
          <CallStatus className={s.status} dotClassName={s.dot} />
          <Actions page={page} />
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
  );
}

// A service detail page (D-043, "the card opens"). Development only until `serviceDetailsLive` (INVARIANT 32).
export function ServiceDetail({ page }: { page: ServicePage }) {
  return (
    <article data-line={page.line}>
      <Hero page={page} />
      <About page={page} />
      <ForWhom page={page} />
      <Includes page={page} />
      <Route page={page} />
      <More page={page} />
      <Close page={page} />
    </article>
  );
}
