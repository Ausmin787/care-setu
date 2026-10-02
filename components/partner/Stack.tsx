"use client";

import { useEffect, useRef, useState } from "react";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { motionOK } from "./audience";
import s from "./Switchboard.module.css";

const STEP_MS = 550;

// Card one of the bento (D-038): Cue Kit Morphing Bento's highlight walking down a stack, made cumulative: each
// service inks in the audience's line colour as the highlight passes, until the whole stack is one team's. It walks
// once (8 x 550ms, under WCAG 2.2.2's five seconds) when it scrolls into view or when the audience changes, and never
// loops. Server HTML, no-JS and reduced motion show the finished stack; the cleared state exists only once JS starts
// a walk.
export function Stack({ items, replay }: { items: string[]; replay: boolean }) {
  const ref = useRef<HTMLOListElement>(null);
  // null = finished (every item inked); a number = how many are inked so far.
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionOK()) return;
    // Already on screen at first paint: leave it finished rather than clear what the reader can see.
    if (!replay && el.getBoundingClientRect().top < window.innerHeight) return;
    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        let n = 0;
        setStep(0);
        timer = window.setInterval(() => {
          n += 1;
          setStep(n >= items.length ? null : n);
          if (n >= items.length) window.clearInterval(timer);
        }, STEP_MS);
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [items.length, replay]);

  return (
    <ol ref={ref} className={s.pills}>
      {items.map((item, i) => {
        const on = step === null || i < step;
        return (
          <li key={item} data-on={on || undefined} data-head={step !== null && i === step - 1 ? "" : undefined}>
            <span>{item}</span>
            <IconCircleCheckFilled aria-hidden="true" />
          </li>
        );
      })}
    </ol>
  );
}
