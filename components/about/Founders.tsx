import { about } from "@/lib/about";
import { shown, t } from "@/lib/content";
import { FounderCards } from "./FounderCards";
import { Pending } from "./Pending";
import s from "./Founders.module.css";

const p = t.aboutPage;

// The founders (D-032): four collapsing cards (FounderCards). Approved with their photos, served from public/founders
// (C-021, C-100, D-052).
export function Founders() {
  const founders = shown(about.founders);
  if (!founders) return null;

  return (
    <section className={`${s.section} wrap`} aria-labelledby="founders-title">
      <header className={s.head}>
        <p className={s.kicker}>
          {p.foundersKicker}
          <Pending on={founders.pending} />
        </p>
        <h2 id="founders-title" className="t-head">
          {p.foundersTitle}
        </h2>
        <p className={s.hint}>{p.foundersHint}</p>
      </header>
      <FounderCards people={founders.people} photoSlot={p.photoSlot} dev={process.env.NODE_ENV !== "production"} />
    </section>
  );
}
