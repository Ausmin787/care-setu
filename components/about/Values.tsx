import Image from "next/image";
import { about } from "@/lib/about";
import { shown, t } from "@/lib/content";
import { Odometer } from "@/components/motion/Odometer";
import { Pending } from "./Pending";
import s from "./Values.module.css";

const p = t.aboutPage;
const num = (i: number) => String(i + 1).padStart(2, "0");

// The four values on the sand block (D-032). The list is the page: numbered rows that read well frozen and are all
// that touch, reduced motion and screen readers get. On desktop the Odometer pins the block and shows the same four
// on a stage (aria-hidden, the list stays for assistive tech): the number rolls, the name follows, a card in the
// value's logo tint turns, and the text beside it swaps. The card holds the value's still-life (C-086, an
// illustration, so the stage image is decorative and its alt stays in the content file).
export function Values() {
  const values = shown(about.values);
  if (!values) return null;
  const items = values.items;

  const face = (side: "front" | "back") => (
    <div className={s[side]}>
      {items.map((v, i) => (
        <div key={v.name} className={s.slot} data-slot={i} data-line={v.line}>
          <Image
            src={v.image.src}
            alt=""
            fill
            sizes="368px"
            style={{ objectFit: "cover", objectPosition: `50% ${v.image.focus}` }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <section className={s.values} aria-labelledby="values-title">
      <Odometer className={s.stage} count={items.length}>
        <header className={`${s.head} wrap`}>
          <p className={s.kicker}>
            {p.valuesKicker}
            <Pending on={values.pending} />
          </p>
          <h2 id="values-title" className={`t-head ${s.title}`}>
            {p.valuesTitle}
          </h2>
          <p className={s.intro}>{values.intro}</p>
        </header>

        <ol className={`${s.list} wrap`}>
          {items.map((v, i) => (
            <li key={v.name} data-line={v.line}>
              <span className={s.listN} aria-hidden="true">
                {num(i)}
              </span>
              <h3 className={s.listName}>{v.name}</h3>
              <div className={s.listText}>
                <p className={s.lead}>{v.lead}</p>
                <p>{v.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className={`${s.visual} wrap`} aria-hidden="true">
          <div className={s.odo}>
            <div className={s.digits}>
              <span className={s.zero}>0</span>
              <span className={s.roll}>
                {items.map((v, i) => (
                  <span key={v.name} className={s.piece} data-k={i}>
                    {i + 1}
                  </span>
                ))}
              </span>
            </div>
            <div className={s.names}>
              {items.map((v, i) => (
                <span key={v.name} className={s.piece} data-k={i}>
                  {v.name}
                </span>
              ))}
            </div>
            <ol className={s.ticks}>
              {items.map((v, i) => (
                <li key={v.name} className={s.tick} data-k={i} data-line={v.line} />
              ))}
            </ol>
          </div>

          <div className={s.card}>
            <div className={s.rotor} data-rotor data-front="0" data-back="1">
              {face("front")}
              {face("back")}
            </div>
          </div>

          <div className={s.texts}>
            {items.map((v, i) => (
              <div key={v.name} className={s.piece} data-k={i}>
                <p className={s.lead}>{v.lead}</p>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Odometer>
    </section>
  );
}
