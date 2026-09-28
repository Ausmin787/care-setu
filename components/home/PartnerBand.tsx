import Link from "next/link";
import { IconCircleArrowRightFilled } from "@tabler/icons-react";
import { t } from "@/lib/content";
import { Thread } from "@/components/motion/Thread";
import s from "./PartnerBand.module.css";

// Partner band (D-030): the sand block (D-027) set as an editorial index, after Awwwards "Index" (The Line):
// three large rows; hover or focus slides the row's line colour in behind the text and brings in the arrow disc.
// The Home thread ends here with a terminus, just above the footer.
export function PartnerBand() {
  return (
    <section className={`${s.band} wrap`} id="partner" aria-labelledby="partner-title">
      <Thread end />
      <div className={s.top}>
        <h2 id="partner-title" className="t-head" data-thread-stop>
          {t.partner.title}
        </h2>
        <Link className="btn" href="/partner">
          {t.partner.cta}
          <IconCircleArrowRightFilled aria-hidden="true" />
        </Link>
      </div>
      <ul className={s.rows}>
        {t.partner.roles.map((r, i) => (
          <li key={r.title} data-line={r.line}>
            <Link className={s.row} href="/partner">
              <span className={s.n}>{String(i + 1).padStart(2, "0")}</span>
              <span className={s.title}>{r.title}</span>
              <span className={s.text}>{r.text}</span>
              <IconCircleArrowRightFilled className={s.arrow} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
