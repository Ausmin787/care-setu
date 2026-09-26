import Link from "next/link";
import { t } from "@/lib/content";
import s from "./PartnerBand.module.css";

// Care24 partner band: ink band, a question headline, the action on the right, three role tiles.
export function PartnerBand() {
  return (
    <section className={`${s.band} wrap`} id="partner" aria-labelledby="partner-title">
      <div className={s.top}>
        <h2 id="partner-title" className="t-head">
          {t.partner.title}
        </h2>
        <Link className="btn rev" href="/partner">
          {t.partner.cta}
        </Link>
      </div>
      <ul className={s.roles}>
        {t.partner.roles.map((r) => (
          <li key={r.title} data-line={r.line}>
            <span className={`badge ${s.badge}`}>
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
