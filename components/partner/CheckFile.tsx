import type { CSSProperties } from "react";
import { t } from "@/lib/content";
import type { partner } from "@/lib/partner";
import { Pending } from "@/components/about/Pending";
import s from "./CheckFile.module.css";

// "How we check" (D-038): Cue Kit Sticky Cascade's file-folder cards (refs/care-setu/partner/cuekit/
// sticky-cascade-sheet.jpg). Each of the deck's five checks is a folder that sticks a tab's height lower than the one
// before, so the tabs pile up into a professional's file as you scroll. CSS `position: sticky` only: no pin, no JS,
// nothing to switch off for reduced motion. Pending (C-083) until the owners describe the real process.
export function CheckFile({ checks }: { checks: typeof partner.checks }) {
  return (
    <section className={`${s.section} wrap`} aria-labelledby="checks-title">
      <header className={s.head}>
        <p className={s.kicker}>
          {t.partnerPage.checksKicker}
          <Pending on={checks.pending} />
        </p>
        <h2 id="checks-title" className="t-head">
          {checks.title}
        </h2>
        <p className={s.lede}>{checks.lede}</p>
      </header>
      <ol className={s.file}>
        {checks.items.map((item, i) => (
          <li key={item.name} className={s.folder} style={{ "--i": i } as CSSProperties}>
            <h3 className={s.tab}>
              <span className={s.num}>{String(i + 1).padStart(2, "0")}</span>
              {item.name}
            </h3>
            <div className={s.sheet}>
              <span className={s.ghost} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
