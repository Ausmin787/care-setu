import type { Metadata } from "next";
import Link from "next/link";
import { IconPhoneFilled } from "@tabler/icons-react";
import { config, paymentsOpen, phoneDisplay, t } from "@/lib/content";
import { showReference } from "@/server/contracts/payments";
import { SAMPLE_REFERENCES } from "@/server/domain/quotes";
import { CallStatus } from "@/components/home/CallStatus";
import { ReferenceField } from "@/components/pay/ReferenceField";
import s from "./page.module.css";

const p = t.payPage;

export const metadata: Metadata = {
  title: p.metaTitle,
  description: p.metaDescription,
};

// /pay (D-004, D-036): find a quote by its reference. In development it also lists the sample quotes, one per screen,
// so the owners can see each; production shows the call card until `paymentsLive` is set by a D-entry.
export default function Page() {
  if (!paymentsOpen()) {
    return (
      <section className={`${s.opener} wrap`}>
        <div className={s.intro}>
          <h1 className="t-display">{p.closedTitle}</h1>
          <p className={s.lede}>{p.closedText}</p>
        </div>
        {config.phone && (
          <div className={s.card} data-mode="ink">
            <h2>{t.contactPage.cardTitle}</h2>
            <p className={s.number}>
              <a href={`tel:${config.phone}`}>{phoneDisplay}</a>
            </p>
            <a className="btn" href={`tel:${config.phone}`}>
              {p.call}
              <IconPhoneFilled className={s.icon} aria-hidden="true" />
            </a>
            <CallStatus className={s.status} dotClassName={s.dot} />
          </div>
        )}
      </section>
    );
  }

  const label = (q: (typeof SAMPLE_REFERENCES)[number]) =>
    q.status === "open"
      ? p.sampleStates[q.outcome]
      : q.status === "paid"
        ? p.sampleStates.alreadyPaid
        : p.sampleStates[q.status];

  return (
    <>
      <section className={`${s.opener} wrap`}>
        <div className={s.intro}>
          <h1 className="t-display">{p.title}</h1>
          <p className={s.lede}>{p.lede}</p>
          <ReferenceField />
        </div>
        <div>
          <h2 className={s.stepsTitle}>{p.stepsTitle}</h2>
          <ol className={s.steps}>
            {p.steps.map((step, i) => (
              <li key={step.title}>
                <span className={s.n}>{String(i + 1).padStart(2, "0")}</span>
                <span className={s.t}>{step.title}</span>
                <span className={s.m}>{step.meta}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {process.env.NODE_ENV !== "production" && (
        <section className={`${s.samples} wrap`}>
          <h2>{p.samplesTitle}</h2>
          <p>{p.samplesText}</p>
          <ul>
            {SAMPLE_REFERENCES.map((q) => (
              <li key={q.reference}>
                <Link href={`/pay/${q.reference}`}>
                  {label(q)}
                  <span translate="no">{showReference(q.reference)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
