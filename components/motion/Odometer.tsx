"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The values odometer (D-032; GetLayers Northwall's pinned 01 -> 05, Unlumen "Animate Digits", Design Spells Abode's
// card flip). Desktop, fine pointer and motion allowed: the stage pins and its scroll runway is cut into one step per
// value. A step change sets `data-state` (past / now / next) on every `[data-k]` piece, and CSS moves them: only the
// changing digit rolls, from below going forward and from above going back (direction-aware for free), with
// Unlumen's y + scale .7 + blur entrance; the card turns half a revolution per step, its hidden face given the next
// value first. Everything else (touch, reduced motion, no JS, short or narrow screens) reads the plain list.
export function Odometer({ className, count, children }: { className: string; count: number; children: React.ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = stage.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      // The Deck's gate (D-031): down to 480px tall, so scaled laptops (1280x537) get it too.
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 901px) and (min-height: 480px) and (pointer: fine)", () => {
        el.setAttribute("data-live", "");
        const pieces = gsap.utils.toArray<HTMLElement>("[data-k]", el);
        const rotor = el.querySelector<HTMLElement>("[data-rotor]");
        const n = count;
        let step = -1;

        const apply = (next: number) => {
          if (next === step) return;
          // One half-turn per step (back again when scrolling up). The face that turns into view gets this value
          // first: the front on even steps, the back on odd ones; the other face is hidden while it changes.
          step = next;
          if (rotor) {
            rotor.style.setProperty("--turn", String(step));
            rotor.setAttribute(step % 2 === 0 ? "data-front" : "data-back", String(step));
          }
          el.setAttribute("data-step", String(step));
          pieces.forEach((p) => {
            const k = Number(p.dataset.k);
            p.dataset.state = k < step ? "past" : k === step ? "now" : "next";
          });
        };

        let st: ScrollTrigger | undefined;
        const build = () => {
          const per = Math.round(window.innerHeight * 0.6);
          st = ScrollTrigger.create({
            trigger: el,
            start: "top top",
            end: `+=${per * n}`,
            pin: true,
            onUpdate: ({ progress }) => apply(Math.min(n - 1, Math.floor(progress * n))),
          });
          apply(Math.min(n - 1, Math.floor(st.progress * n)));
        };

        let lastH = window.innerHeight;
        let timer = 0;
        const onResize = () => {
          window.clearTimeout(timer);
          timer = window.setTimeout(() => {
            if (window.innerHeight === lastH) return;
            lastH = window.innerHeight;
            st?.kill();
            build();
            ScrollTrigger.refresh();
          }, 200);
        };

        build();
        window.addEventListener("resize", onResize);
        return () => {
          window.clearTimeout(timer);
          window.removeEventListener("resize", onResize);
          st?.kill();
          el.removeAttribute("data-live");
          el.removeAttribute("data-step");
          pieces.forEach((p) => delete p.dataset.state);
          rotor?.style.removeProperty("--turn");
        };
      });
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: stage, dependencies: [count] },
  );

  // The pinned stage sits inside this component's own <div> (Blueprint 11: the pin re-parents it).
  return (
    <div>
      <div ref={stage} className={className}>
        {children}
      </div>
    </div>
  );
}
