import { IconCheck } from "@tabler/icons-react";
import type { Line } from "@/lib/content";
import { t } from "@/lib/content";
import { CallStatus } from "@/components/home/CallStatus";
import s from "./Enquiry.module.css";

// "Your route" (D-033): the trip's grammar (spine + stations, D-021) re-aimed at the family's own enquiry, after
// 21st.dev's Appointment Intake Match (a live card beside the questions). Each answered station inks; the service
// station takes its line colour (INVARIANT 27); the terminus is the callback, with the live call status.
export type RouteStop = {
  key: string;
  label: string;
  // The answer as the family gave it, once answered.
  value?: string;
  line?: Line;
  state: "done" | "current" | "next";
};

const r = t.enquiry.route;

export function Route({ stops, arrived }: { stops: RouteStop[]; arrived: boolean }) {
  return (
    <>
      <aside className={s.route} data-mode="ink" aria-label={r.label} data-arrived={arrived || undefined}>
        <p className={s.routeLabel}>{r.label}</p>
        <ol className={s.stops}>
          {stops.map((stop) => (
            <li
              key={stop.key}
              className={s.stop}
              data-state={stop.state}
              data-line={stop.line}
              aria-current={stop.state === "current" ? "step" : undefined}
            >
              <span className={s.rail} aria-hidden="true">
                <i className={s.fill} />
                <i className={s.disc} />
              </span>
              <span className={s.stopText}>
                <span className={s.stopLabel}>{stop.label}</span>
                {stop.value && <span className={s.stopValue}>{stop.value}</span>}
              </span>
            </li>
          ))}
          <li className={`${s.stop} ${s.home}`} data-state={arrived ? "done" : "next"}>
            <span className={s.rail} aria-hidden="true">
              <i className={s.disc}>{arrived && <IconCheck />}</i>
            </span>
            <span className={s.stopText}>
              <span className={s.stopValue}>{r.end}</span>
              <span className={s.stopLabel}>{r.endText}</span>
              <CallStatus className={s.routeStatus} dotClassName={s.dot} />
            </span>
          </li>
        </ol>
      </aside>

      {/* Phones: the same route as a thin track above the question; "Question n of 5" carries it for screen readers. */}
      <ol className={s.track} aria-hidden="true" data-arrived={arrived || undefined}>
        {stops.map((stop) => (
          <li key={stop.key} data-state={stop.state} data-line={stop.line} />
        ))}
        <li className={s.trackHome} data-state={arrived ? "done" : "next"} />
      </ol>
    </>
  );
}
