"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconAlertTriangleFilled,
  IconCircleArrowRightFilled,
  IconCircleCheckFilled,
  IconClockFilled,
  IconFileInvoiceFilled,
} from "@tabler/icons-react";
import { config, phoneDisplay, t } from "@/lib/content";
import { formatIst } from "@/lib/hours";
import { PayResult } from "@/server/contracts/payments";
import s from "./Pay.module.css";

const c = t.payPage.card;
const r = t.payPage.receipt;

type Stage = "ready" | "waiting" | "paid" | "failed" | "pending" | "expired" | "cancelled";
type Paid = { at: string; paymentId: string };

// The ink payment card (D-036, Option A): Cue Kit's Thermal Cut Invoice replicated from its written spec. The screen
// shows the checks the server made, then the bank, then a parchment receipt prints out of the card's slot. The status says
// Paid the moment the bank accepts (D-047, INVARIANT 34); the print is a flourish nothing waits on: the machine hums for 2.0s,
// the paper feeds in 20 steps over 1.75s, and a row lands every 260ms from +60ms. Reduced motion skips the travel. Only the
// reference is ever sent (INVARIANT 4).
export function PayCard(props: {
  reference: string;
  shown: string;
  service: string;
  detail: string;
  amount: string;
  initial: "ready" | "paid" | "expired" | "cancelled";
  paid?: Paid;
  sample: boolean;
}) {
  const [stage, setStage] = useState<Stage>(props.initial);
  const [paid, setPaid] = useState<Paid | undefined>(props.paid);
  const [network, setNetwork] = useState(false);
  const [printing, setPrinting] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  // The Pay button leaves the page when pressed; focus moves to the status line so keyboard users keep their place.
  const statusRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const hold = (ms: number) =>
    new Promise<void>((done) => {
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      timer.current = window.setTimeout(done, still ? 0 : ms);
    });

  async function pay() {
    setNetwork(false);
    setStage("waiting");
    statusRef.current?.focus();
    let result: PayResult | undefined;
    try {
      const res = await fetch("/api/v1/payments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reference: props.reference }),
      });
      const parsed = PayResult.safeParse(await res.json());
      if (res.ok && parsed.success) result = parsed.data;
    } catch {
      result = undefined;
    }
    if (!result) {
      setNetwork(true);
      setStage("failed");
      return;
    }
    if (result.status !== "paid") {
      setStage(result.status);
      return;
    }
    setPaid({ at: formatIst(new Date(result.paidAt), true), paymentId: result.paymentId });
    setStage("paid");
    setPrinting(true);
    await hold(2000);
    setPrinting(false);
  }

  const checks = stage === "ready" || stage === "waiting" || stage === "paid";
  const printed = stage === "paid" && paid;
  const status = {
    ready: c.ready,
    waiting: c.waiting,
    paid: c.paid,
    failed: c.failed,
    pending: c.pending,
    expired: c.expired,
    cancelled: c.cancelled,
  }[stage];

  return (
    <div className={s.device} data-stage={stage} data-printing={printing || undefined}>
      <div className={s.machine} data-mode="ink">
        <p className={s.head}>
          <span>{c.label}</span>
          {props.sample && <span className={s.sample}>{t.payPage.quote.sample}</span>}
        </p>
        <div className={s.screen}>
          <p className={s.svc}>{props.service}</p>
          <p className={s.sub}>{props.detail}</p>
          <p className={s.amt}>{props.amount}</p>
          <p className={s.status} role="status" ref={statusRef} tabIndex={-1}>
            {stage === "waiting" ? (
              <i className={s.spin} aria-hidden="true" />
            ) : stage === "paid" ? (
              <IconCircleCheckFilled className={s.ok} aria-hidden="true" />
            ) : stage === "failed" ? (
              <IconAlertTriangleFilled aria-hidden="true" />
            ) : stage === "pending" ? (
              <IconClockFilled aria-hidden="true" />
            ) : (
              <i className={s.dot} aria-hidden="true" />
            )}
            {status}
          </p>
          {stage === "failed" && <p className={s.note}>{network ? c.network : c.failedText}</p>}
          {stage === "pending" && <p className={s.note}>{c.pendingText}</p>}
          {checks && (
            <ul className={s.checks}>
              {[c.checkFound, c.checkValid, stage === "paid" ? c.checkPaid : c.checkUnpaid].map((text, i) => (
                <li key={i} style={{ "--i": i } as React.CSSProperties}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M7 12.5l3.2 3.2L17 9" />
                  </svg>
                  {text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {stage === "ready" && (
          <>
            <button className={`btn ${s.pay}`} type="button" onClick={pay}>
              {c.pay}
              {props.amount}
              <IconCircleArrowRightFilled aria-hidden="true" />
            </button>
            <p className={s.terms}>
              {c.terms}
              <a href="/terms">{c.termsLink}</a>
              {c.and}
              <a href="/refunds">{c.refundsLink}</a>.
            </p>
          </>
        )}
        {stage === "failed" && (
          <button className={`btn ${s.pay}`} type="button" onClick={pay}>
            {c.retry}
            <IconCircleArrowRightFilled aria-hidden="true" />
          </button>
        )}
        {(stage === "failed" || stage === "pending") && config.phone && (
          <p className={s.terms}>
            {t.payPage.call} <a href={`tel:${config.phone}`}>{phoneDisplay}</a>
          </p>
        )}
      </div>

      {printed && (
        <>
          <div className={s.slot} aria-hidden="true" />
          <div className={s.out}>
            <section className={s.paper} aria-label={r.kicker}>
              <p className={`${s.row} ${s.k}`} style={{ "--i": 0 } as React.CSSProperties}>
                <IconFileInvoiceFilled aria-hidden="true" />
                {r.kicker}
              </p>
              <h2 className={s.row} style={{ "--i": 1 } as React.CSSProperties}>
                {r.title}
              </h2>
              <dl className={s.row} style={{ "--i": 2 } as React.CSSProperties}>
                <dt>{r.for}</dt>
                <dd>
                  {props.service}, {props.detail}
                </dd>
                <dt>{r.quote}</dt>
                <dd translate="no">{props.shown}</dd>
              </dl>
              <dl className={s.row} style={{ "--i": 3 } as React.CSSProperties}>
                <dt>{r.paidOn}</dt>
                <dd>{paid.at}</dd>
                <dt>{r.paymentId}</dt>
                <dd translate="no">{paid.paymentId}</dd>
              </dl>
              <p className={`${s.row} ${s.total}`} style={{ "--i": 4 } as React.CSSProperties}>
                <span>{r.total}</span>
                <b>{props.amount}</b>
              </p>
              <p className={`${s.row} ${s.next}`} style={{ "--i": 5 } as React.CSSProperties}>
                {r.next}
              </p>
              <p className={`${s.row} ${s.acts}`} style={{ "--i": 6 } as React.CSSProperties}>
                <button type="button" onClick={() => window.print()}>
                  {r.print}
                </button>
              </p>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
