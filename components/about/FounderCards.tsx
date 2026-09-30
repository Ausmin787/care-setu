"use client";

import { useState } from "react";
import Image from "next/image";
import type { AboutContent } from "@/lib/about";
import s from "./Founders.module.css";

type Person = AboutContent["founders"]["people"][number];

const initials = (name: string) =>
  name
    .replace(/^Dr\s+/, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
const pad = (n: number) => String(n).padStart(2, "0");

// Cue Kit "Collapsing Cards Accordion" (refs/care-setu/cuekit, kept for the founders in D-031), rebuilt without its
// `flex` transition (a layout animation, Blueprint 9.4). Every card is the open card's full width, placed by
// translateX; a clip window (paint only, no layout) shows the narrow or the wide part, and the photo slides inside
// so a narrow card still shows the face. One card is open: hover on a fine pointer, focus, or a tap opens it. The
// sample's timing: .75s cubic-bezier(.2, 1, .3, 1), photo scale 1.04 -> 1, the words rising in .15s later.
// The look is the sample's too (D-034, "Ink gallery"): ink cards, the image dimmed under a scrim until its card
// opens, an index at the top, the name over the scrim. The index and the large numeral are decoration (aria-hidden).
export function FounderCards({ people, photoSlot, dev }: { people: Person[]; photoSlot: string; dev: boolean }) {
  const [active, setActive] = useState(0);
  return (
    <ol className={s.cards}>
      {people.map((f, i) => {
        const on = i === active;
        return (
          <li
            key={f.name}
            className={s.card}
            data-mode="ink"
            data-line={f.line}
            data-on={on || undefined}
            data-nophoto={f.photo ? undefined : ""}
            style={{ "--i": i, "--on": on ? 1 : 0, "--after": i > active ? 1 : 0 } as React.CSSProperties}
          >
            <div className={s.media}>
              {f.photo ? (
                <Image src={f.photo} alt="" width={900} height={1200} unoptimized className={s.photo} />
              ) : (
                <span className={s.initials} aria-hidden="true">
                  {initials(f.name)}
                </span>
              )}
            </div>
            <span className={s.idx} aria-hidden="true">
              <i className={s.dot} />
              {pad(i + 1)}
            </span>
            <span className={s.ghost} aria-hidden="true">
              {pad(i + 1)}
            </span>
            {!f.photo && dev && <span className={s.slotNote}>{photoSlot}</span>}
            <button
              type="button"
              className={s.hit}
              aria-expanded={on}
              aria-controls={`founder-${i}`}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              <span className={s.vname}>{f.name}</span>
            </button>
            <div id={`founder-${i}`} className={s.bio}>
              <h3 className={s.name}>
                {f.name}
                {f.known && <span className={s.known}> ({f.known})</span>}
              </h3>
              <p className={s.role}>{f.role}</p>
              {f.text && <p className={s.text}>{f.text}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
