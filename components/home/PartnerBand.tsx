import Link from "next/link";
import { IconCircleArrowRightFilled } from "@tabler/icons-react";
import { t } from "@/lib/content";
import s from "./PartnerBand.module.css";

// Care24 partner band re-set as myhealthprac's sand block (D-027): a question headline, the pill, three roles.
export function PartnerBand() {
  return (
    <section className={`${s.band} wrap`} id="partner" aria-labelledby="partner-title">
      <div className={s.top}>
        <h2 id="partner-title" className="t-head">
          {t.partner.title}
        </h2>
        <Link className="btn" href="/partner">
          {t.partner.cta}
          <IconCircleArrowRightFilled aria-hidden="true" />
        </Link>
      </div>
      <ul className={s.roles}>
        {t.partner.roles.map((r) => (
          <li key={r.title} data-line={r.line}>
            <span className="badge">
              <i style={{ background: "var(--line)" }} />
              {r.lineName}
            </span>
            <h3>{r.title}</h3>
            <p>{r.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
