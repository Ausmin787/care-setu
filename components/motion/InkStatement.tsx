"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Ghost → ink reading reveal (Blueprint 9.3; Skiper UI 31; D-030): words are server-rendered `[data-w]` spans, so
// nothing is split or hidden on first paint. With motion allowed, JS sets `data-live` (ghost) and inks the words in
// order as the statement scrolls through the middle of the screen. Text stays readable the whole way.
export function InkStatement({ className, children }: { className: string; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const words = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        el.setAttribute("data-live", "");
        let inked = -1;
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 78%",
          end: "bottom 45%",
          onUpdate: ({ progress }) => {
            const n = Math.round(progress * words.length);
            if (n === inked) return;
            inked = n;
            words.forEach((w, i) => w.toggleAttribute("data-inked", i < n));
          },
        });
        return () => {
          st.kill();
          el.removeAttribute("data-live");
          words.forEach((w) => w.removeAttribute("data-inked"));
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
