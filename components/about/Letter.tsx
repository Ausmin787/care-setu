import Image from "next/image";
import { about } from "@/lib/about";
import { shown, t } from "@/lib/content";
import { Ticks } from "@/components/motion/Ticks";
import { Pending } from "./Pending";
import s from "./Letter.module.css";

const p = t.aboutPage;

// Shiva's letter (D-032; GetLayers Artist + Mobbin Superr "Our story": a first-person letter in a narrow serif
// measure beside the writer). The portrait sticks while the letter scrolls; his four wishes tick in on the logo
// colours (Ticks). The photo shares the founders' treatment: warm monochrome multiplied onto a logo-colour tint, so
// the deck's mismatched backgrounds read as one set (Blueprint 15). Development only until approved (C-074, C-021).
export function Letter() {
  const letter = shown(about.letter);
  if (!letter) return null;
  const photo = shown(letter.photo);

  return (
    <section className={s.letter} aria-labelledby="letter-title">
      <div className={`${s.grid} wrap`}>
        <figure className={s.portrait} data-line="lime">
          <div className={s.frame}>
            {photo && (
              <Image src={photo.src} alt={photo.alt} width={600} height={800} unoptimized className={s.photo} />
            )}
          </div>
          <figcaption>
            <b>{letter.name}</b>
            <span>{letter.role}</span>
          </figcaption>
        </figure>

        <div className={s.body}>
          <h2 id="letter-title" className={s.kicker}>
            {p.letterTitle}
            <Pending on={letter.pending} />
          </h2>
          <blockquote className={s.quote}>
            <p>&ldquo;{letter.quote}&rdquo;</p>
          </blockquote>
          {letter.paras.map((text, i) => (
            <p key={i} className={s.para}>
              {text}
            </p>
          ))}
          <p className={s.pull}>{letter.pull}</p>
          {letter.trust.map((text, i) => (
            <p key={i} className={s.para}>
              {text}
            </p>
          ))}

          <h3 className={s.wishesTitle}>{p.wishesTitle}</h3>
          <Ticks className={s.wishes}>
            {letter.wishes.map((w, i) => (
              <li key={i} data-tick data-line={w.line}>
                <span className={s.disc} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} />
                  </svg>
                </span>
                <p>{w.text}</p>
              </li>
            ))}
          </Ticks>

          <p className={s.para}>{letter.closing}</p>
          <p className={s.dream}>
            <span>{letter.dreamLead}</span> {letter.dream}
          </p>
        </div>
      </div>
    </section>
  );
}
