import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { IconCircleArrowLeftFilled } from "@tabler/icons-react";
import { config, formatPaise, paymentsOpen, phoneDisplay, t } from "@/lib/content";
import { formatIst } from "@/lib/hours";
import { QuoteReference, showReference } from "@/server/contracts/payments";
import { getQuote } from "@/server/domain/quotes";
import { PayCard } from "@/components/pay/PayCard";
import s from "./page.module.css";

const p = t.payPage;
const q = p.quote;

// A quote's page carries its reference in the URL: keep it out of search results.
export const metadata: Metadata = {
  title: p.metaTitle,
  robots: { index: false, follow: false },
};

// /pay/<reference> (D-004, D-036): the quote beside the ink payment card. The amount is read here, on the server, and
// only the reference goes back (INVARIANT 4). Production redirects to /pay until `paymentsLive` is set by a D-entry.
export default async function Page({ params }: PageProps<"/pay/[reference]">) {
  if (!paymentsOpen()) redirect("/pay");
  const { reference } = await params;
  const parsed = QuoteReference.safeParse(decodeURIComponent(reference));
  const quote = parsed.success ? getQuote(parsed.data) : undefined;
  const call = config.phone && <a href={`tel:${config.phone}`}>{phoneDisplay}</a>;

  if (!quote) {
    return (
      <section className={`${s.split} wrap`}>
        <div className={s.copy}>
          <h1 className="t-display">{q.notFoundTitle}</h1>
          <p className={s.text}>{q.notFoundText}</p>
          {call && <p className={s.wrong}>{call}</p>}
          <Link className={`btn ${s.back}`} href="/pay">
            {q.again}
            <IconCircleArrowLeftFilled aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  const shown = showReference(quote.reference);
  const amount = formatPaise(quote.amountPaise);
  const title = {
    open: (
      <>
        {q.titleOpen}
        <em>{q.titleOpenEm}</em>.
      </>
    ),
    paid: q.titlePaid,
    expired: q.titleExpired,
    cancelled: q.titleCancelled,
  }[quote.status];

  return (
    <section className={`${s.split} wrap`}>
      <div className={s.copy}>
        <p className={s.ref}>
          <span translate="no">
            {q.kicker} {shown}
          </span>
          <span className="pending">{q.sample}</span>
        </p>
        <h1 className="t-display">{title}</h1>
        {quote.status === "expired" && <p className={s.text}>{q.textExpired}</p>}
        {quote.status === "cancelled" && <p className={s.text}>{q.textCancelled}</p>}
        <dl className={s.covers}>
          <div>
            <dt>{q.service}</dt>
            <dd>
              {quote.service}, {quote.detail}
            </dd>
          </div>
          <div>
            <dt>{q.starts}</dt>
            <dd>{formatIst(quote.startsOn)}</dd>
          </div>
          <div>
            <dt>{q.validUntil}</dt>
            <dd>{formatIst(quote.validUntil, true)}</dd>
          </div>
          <div>
            <dt>{q.preparedBy}</dt>
            <dd>{q.coordinator}</dd>
          </div>
        </dl>
        {call && (
          <p className={s.wrong}>
            {q.wrong}
            {call}
            {quote.status === "open" && q.wrongAfter}
          </p>
        )}
      </div>

      <div>
        {quote.status === "open" && (
          <noscript>
            <p className={s.noscript}>{p.card.noscript}</p>
          </noscript>
        )}
        <PayCard
          reference={quote.reference}
          shown={shown}
          service={quote.service}
          detail={quote.detail}
          amount={amount}
          initial={quote.status === "open" ? "ready" : quote.status}
          paid={quote.paid && { at: formatIst(quote.paid.at, true), paymentId: quote.paid.paymentId }}
          sample
        />
      </div>
    </section>
  );
}
