"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconBuildingHospital,
  IconDeviceMobileFilled,
  IconFlaskFilled,
  IconNurse,
  IconStethoscope,
  IconWheelchair,
} from "@tabler/icons-react";
import type { AboutContent } from "@/lib/about";
import s from "./Manifesto.module.css";

const icons = {
  hospital: IconBuildingHospital,
  stethoscope: IconStethoscope,
  nurse: IconNurse,
  flask: IconFlaskFilled,
  wheelchair: IconWheelchair,
  device: IconDeviceMobileFilled,
};

type Group = AboutContent["mission"]["groups"]["items"][number];
type Place = { above: boolean; shift: number };

// The mission's six groups as enriched words that open their role (D-032; Smooth UI "Inline Testimonials"): each is a
// real <button> keeping the prose's size, marked by a small icon and a rule that turns the logo blue while open. One
// card open at a time. Hover opens on a fine pointer (closing on a short delay, so moving onto the card never
// flickers); a click pins it open (touch); keyboard focus opens it; Escape closes it and returns focus to its word; a
// tap elsewhere closes it. The card is positioned under its word inside the text, so it scrolls with it (no scroll
// listener); when it opens, it flips above if there is no room below and shifts in to stay on screen.
export function Groups({ items }: { items: Group[] }) {
  const [open, setOpen] = useState(-1);
  const [place, setPlace] = useState<Place>({ above: false, shift: 0 });
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const cards = useRef<(HTMLSpanElement | null)[]>([]);
  const pinned = useRef(false);
  const timer = useRef(0);

  const show = (i: number, pin: boolean) => {
    window.clearTimeout(timer.current);
    pinned.current = pin;
    const btn = triggers.current[i];
    if (btn) {
      const r = btn.getBoundingClientRect();
      const w = Math.min(320, window.innerWidth - 32);
      const above = r.bottom + 10 + 220 > window.innerHeight && r.top > 240;
      const shift = Math.min(0, window.innerWidth - 16 - w - r.left);
      setPlace({ above, shift: Math.round(shift) });
    }
    setOpen(i);
  };
  const close = () => {
    window.clearTimeout(timer.current);
    pinned.current = false;
    setOpen(-1);
  };
  const hideSoon = () => {
    if (pinned.current) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(close, 180);
  };
  const fine = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // While a card is open: Escape closes it (focus back on its word) and a tap outside its word and card closes it.
  useEffect(() => {
    if (open < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      close();
      triggers.current[open]?.focus();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (triggers.current[open]?.contains(t) || cards.current[open]?.contains(t)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <>
      {items.map((g, i) => {
        const Icon = icons[g.icon];
        const id = `group-${i}`;
        const sep = i === items.length - 1 ? "." : i === items.length - 2 ? " and " : ", ";
        const isOpen = open === i;
        return (
          <span key={g.name} className={s.group}>
            <button
              ref={(el) => {
                triggers.current[i] = el;
              }}
              type="button"
              className={s.trigger}
              aria-expanded={isOpen}
              aria-controls={id}
              onClick={() => (isOpen && pinned.current ? close() : show(i, true))}
              onPointerEnter={() => fine() && show(i, false)}
              onPointerLeave={hideSoon}
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && show(i, false)}
              onBlur={hideSoon}
            >
              <Icon aria-hidden="true" />
              {g.name}
            </button>
            <span className={s.sep}>{sep}</span>
            <span
              ref={(el) => {
                cards.current[i] = el;
              }}
              id={id}
              role="note"
              hidden={!isOpen}
              className={s.card}
              data-above={isOpen && place.above ? "" : undefined}
              style={isOpen ? { translate: `${place.shift}px 0` } : undefined}
              onPointerEnter={() => window.clearTimeout(timer.current)}
              onPointerLeave={hideSoon}
            >
              <span className={s.cardIcon} aria-hidden="true">
                <Icon />
              </span>
              <span className={s.cardName}>{g.name}</span>
              <span className={s.cardRole}>{g.role}</span>
            </span>
          </span>
        );
      })}
    </>
  );
}
