import Link from "next/link";
import { IconCircleArrowRightFilled, IconPhoneFilled } from "@tabler/icons-react";
import { config, phoneDisplay, shown, t } from "@/lib/content";
import { CallStatus } from "@/components/home/CallStatus";
import { InkStatement } from "@/components/motion/InkStatement";
import { Thread } from "@/components/motion/Thread";
import s from "./HowWeWork.module.css";

const p = t.promise;

// How we work with you (D-030): the approved promises (C-024, C-025, C-031, C-032) as one statement that inks in
// as it is read, beside the live call status (the instrument, Blueprint 8.3) and the two ways to reach us.
export function HowWeWork() {
  const kicker = shown(t.story.line);
  let w = 0;
  return (
    <section className={`${s.sec} wrap`} id="promise" aria-labelledby="promise-title">
      <Thread />
      <div className={s.side}>
        <h2 id="promise-title" className={s.label} data-thread-stop>
          {p.label}
        </h2>
        <CallStatus className={s.status} dotClassName={s.dot} />
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
      </div>
      <div className={s.main}>
        {kicker && (
          <p className={s.kicker}>
            {kicker.text}
            <span className="pending" title={t.pending.title}>
              {t.pending.tag}
            </span>
          </p>
        )}
        <InkStatement className={s.statement}>
          <p>
            {p.sentences.map((sentence) => (
              <span key={sentence.text}>
                {sentence.text.split(" ").map((word) => (
                  <span key={w} data-w style={{ "--w": w++ } as React.CSSProperties}>
                    {word}{" "}
                  </span>
                ))}
              </span>
            ))}
          </p>
        </InkStatement>
      </div>
    </section>
  );
}
