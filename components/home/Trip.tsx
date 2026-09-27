import { IconCircleArrowRightFilled, IconPhoneCallFilled } from "@tabler/icons-react";
import { lines, t } from "@/lib/content";
import { LiveTrip } from "@/components/motion/LiveTrip";
import s from "./Trip.module.css";

// Design Spells #332, Transit trip view (refs/designspells-transit-trip/): a trip is legs; a leg is one
// continuous rounded spine headed by its badge; stations are small white discs inset in the spine;
// a walk link between legs is a column of dots with an icon and a bold label.
const careLine = lines[0];

type Stop = { title: string; text: string };

function Station({ stop, last }: { stop: Stop; last?: boolean }) {
  return (
    <li className={`${s.row} ${last ? s.end : ""}`} data-seg data-station>
      <span className={s.spine} aria-hidden="true">
        <i className={s.disc} />
      </span>
      <div className={s.body}>
        <h3>{stop.title}</h3>
        <p>{stop.text}</p>
      </div>
    </li>
  );
}

export function Trip() {
  return (
    <section className={`${s.how} wrap`} id="how" aria-labelledby="how-title" data-mode="ink">
      <div className={s.intro}>
        <h2 id="how-title" className="t-head">
          {t.trip.title}
        </h2>
        <p>{t.trip.lede}</p>
      </div>

      <LiveTrip className={s.trip} markerClassName={s.marker}>
        <ol className={`${s.leg} ${s.ink}`}>
          <li className={`${s.row} ${s.head}`} data-seg>
            <span className={s.spine} aria-hidden="true" />
            <div className={s.body}>
              <span className="badge">
                <i style={{ background: "var(--c-ink)" }} />
                {t.trip.legEnquiry}
              </span>
            </div>
          </li>
          <Station stop={t.trip.stopAsk} last />
        </ol>

        <div className={s.walk} data-seg>
          <svg className={s.dots} aria-hidden="true" preserveAspectRatio="none">
            <line x1="3" y1="3" x2="3" y2="100%" />
          </svg>
          <div className={s.body}>
            <h3 className={s.walkTitle}>
              <IconPhoneCallFilled aria-hidden="true" />
              {t.trip.walk.title}
            </h3>
            <p>{t.trip.walk.text}</p>
          </div>
        </div>

        <ol className={s.leg} data-line={careLine.line}>
          <li className={`${s.row} ${s.head}`} data-seg>
            <span className={s.spine} aria-hidden="true" />
            <div className={s.body}>
              <span className="badge">
                <i style={{ background: "var(--line)" }} />
                {careLine.name}
              </span>
              <p className={s.dir}>
                <IconCircleArrowRightFilled aria-hidden="true" />
                {t.trip.legCareDir}
              </p>
            </div>
          </li>
          <Station stop={t.trip.stopPlan} />
          <Station stop={t.trip.stopPay} />
          <Station stop={t.trip.stopHome} last />
        </ol>
      </LiveTrip>
    </section>
  );
}
