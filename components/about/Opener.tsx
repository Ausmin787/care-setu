import { about } from "@/lib/about";
import { shown, t } from "@/lib/content";
import { Pending } from "./Pending";
import s from "./Opener.module.css";

const p = t.aboutPage;

// Word masks for the CSS entrance, server-rendered like Home's hero (nothing hides after first paint).
function Words({ words, from }: { words: string[]; from: number }) {
  return words.map((w, i) => (
    <span key={i}>
      {i > 0 && " "}
      <span className={s.w} style={{ "--i": from + i } as React.CSSProperties}>
        <span>{w}</span>
      </span>
    </span>
  ));
}

// About opener (D-032; GetLayers Marcus Vane: a founder page that opens on one huge statement). The statement is the
// founder's question, its last two words in italic like Home's hero; under a 2px ink rule, the three situations he
// kept seeing, numbered. Production (nothing approved yet) shows the approved line and tagline instead.
export function Opener() {
  const q = shown(about.opener.question);
  const situations = shown(about.opener.situations);
  const words = (q?.text ?? p.fallbackTitle).split(" ");
  const lead = q ? words.slice(0, -2) : words;
  const tail = q ? words.slice(-2) : [];

  return (
    <section className={`${s.opener} wrap`} aria-labelledby="about-title">
      <p className={s.kicker}>
        {p.kicker}
        <Pending on={!!q?.pending} />
      </p>
      <h1 id="about-title" className={`t-display ${s.title}`}>
        <Words words={lead} from={0} />
        {tail.length > 0 && (
          <>
            {" "}
            <em>
              <Words words={tail} from={lead.length} />
            </em>
          </>
        )}
      </h1>
      {!q && <p className={s.lede}>{p.fallbackLede}</p>}
      {situations && (
        <div className={s.foot}>
          <h2 className={s.label}>{p.situationsLabel}</h2>
          <ol className={s.situations}>
            {situations.items.map((text, i) => (
              <li key={i} style={{ "--i": words.length + i } as React.CSSProperties}>
                <span className={s.n} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
