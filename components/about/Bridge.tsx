"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  IconBuildingHospital,
  IconDeviceMobileFilled,
  IconFlaskFilled,
  IconNurse,
  IconStethoscope,
  IconWheelchair,
} from "@tabler/icons-react";
import type { AboutContent } from "@/lib/about";
import type { Line } from "@/lib/content";
import { LogoMark } from "@/components/LogoMark";
import s from "./Manifesto.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const icons = {
  hospital: IconBuildingHospital,
  stethoscope: IconStethoscope,
  nurse: IconNurse,
  flask: IconFlaskFilled,
  wheelchair: IconWheelchair,
  device: IconDeviceMobileFilled,
};

type Group = AboutContent["mission"]["groups"]["items"][number] & { line: Line };

// The merge drawing: six 56px rows on the left, one trunk on the right (the SVG is 200 x 336, drawn 1:1).
const ROW = 56;
const TRUNK_Y = (ROW * 6) / 2;
const branch = (i: number) => `M0,${ROW / 2 + ROW * i} C86,${ROW / 2 + ROW * i} 64,${TRUNK_Y} 150,${TRUNK_Y}`;

// The mission as a bridge (D-034; GetLayers Relay's canvas, where separate steps are joined by lines into one run).
// The six groups the founders want to bring together are stations; each one's line, in a logo colour, merges into a
// single line that reaches the Care Setu mark and the founders' own closing sentence. A station is a real <button>
// that opens its part (one open at a time): hover on a fine pointer (closing on a short delay), a click or tap pins
// it, keyboard focus opens it, Escape closes it and returns focus, a tap elsewhere closes it. On wide screens the
// part shows in one place beside the drawing; on narrow ones, under its station.
// The lines draw with scroll: one scrubbed timeline moves --p0..--p5 and --pt from 0 to 1 and the CSS turns them
// into a clip on each lead-in and a dash offset on each path (pathLength 1, so nothing is measured and GSAP never
// rounds a pixel offset: Blueprint section 11). Without JS, with reduced motion, or on narrow screens they are 1.
export function Bridge({ items, change, hint }: { items: Group[]; change: string; hint: string }) {
  const [open, setOpen] = useState(-1);
  const root = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const parts = useRef<(HTMLParagraphElement | null)[]>([]);
  const pinned = useRef(false);
  const timer = useRef(0);

  const show = (i: number, pin: boolean) => {
    window.clearTimeout(timer.current);
    pinned.current = pin;
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

  // While a part is open: Escape closes it (focus back on its station) and a tap outside it closes it.
  useEffect(() => {
    if (open < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      close();
      buttons.current[open]?.focus();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (buttons.current[open]?.contains(t) || parts.current[open]?.contains(t)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 960px) and (prefers-reduced-motion: no-preference)", () => {
        const vars = [...items.map((_, i) => `--p${i}`), "--pt"];
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top 82%", end: "top 28%", scrub: 0.5 },
        });
        items.forEach((_, i) => tl.fromTo(el, { [`--p${i}`]: 0 }, { [`--p${i}`]: 1, duration: 1 }, i * 0.22));
        tl.fromTo(el, { "--pt": 0 }, { "--pt": 1, duration: 0.8 }, (items.length - 1) * 0.22 + 0.7);
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          vars.forEach((v) => el.style.removeProperty(v));
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={s.bridge} data-active={open >= 0 ? "" : undefined}>
      <p className={s.hint}>{hint}</p>
      <ol className={s.stations}>
        {items.map((g, i) => {
          const Icon = icons[g.icon];
          const isOpen = open === i;
          return (
            <li
              key={g.name}
              className={s.station}
              data-line={g.line}
              data-on={isOpen || undefined}
              style={{ "--p": `var(--p${i}, 1)` } as React.CSSProperties}
            >
              <button
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                type="button"
                className={s.stationBtn}
                aria-expanded={isOpen}
                aria-controls={`part-${i}`}
                onClick={() => (isOpen && pinned.current ? close() : show(i, true))}
                onPointerEnter={() => fine() && show(i, false)}
                onPointerLeave={hideSoon}
                onFocus={(e) => e.currentTarget.matches(":focus-visible") && show(i, false)}
                onBlur={hideSoon}
              >
                <span className={s.disc} aria-hidden="true">
                  <Icon />
                </span>
                <span className={s.stationName}>{g.name}</span>
              </button>
              <span className={s.leader} aria-hidden="true" />
              <p
                ref={(el) => {
                  parts.current[i] = el;
                }}
                id={`part-${i}`}
                className={s.part}
                hidden={!isOpen}
                onPointerEnter={() => window.clearTimeout(timer.current)}
                onPointerLeave={hideSoon}
              >
                <strong className={s.partName}>{g.name}</strong>
                <span>{g.role}</span>
              </p>
            </li>
          );
        })}
      </ol>
      <svg className={s.merge} viewBox={`0 0 200 ${ROW * 6}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {items.map((g, i) => (
          <path
            key={g.name}
            className={s.branch}
            data-line={g.line}
            data-on={open === i || undefined}
            d={branch(i)}
            pathLength={1}
            style={{ "--p": `var(--p${i}, 1)` } as React.CSSProperties}
          />
        ))}
        <path className={s.trunk} d={`M150,${TRUNK_Y} L200,${TRUNK_Y}`} pathLength={1} />
      </svg>
      <div className={s.end}>
        <span className={s.terminus} aria-hidden="true">
          <LogoMark id="cs-tile-mission" />
        </span>
        <p className={s.change}>{change}</p>
      </div>
    </div>
  );
}
