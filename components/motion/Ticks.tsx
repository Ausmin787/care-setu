"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The founder's wishes tick in (D-032): each `[data-tick]` row's disc fills with its line colour and its check draws
// as the row passes 70% of the screen, and un-ticks when scrolled back above it. One batch observer for the list
// (Blueprint 9.4). The unticked state exists only under the JS-added `data-live`, so no-JS and reduced motion show
// every wish ticked.
export function Ticks({ className, children }: { className: string; children: React.ReactNode }) {
  const root = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        el.setAttribute("data-live", "");
        const rows = gsap.utils.toArray<HTMLElement>("[data-tick]", el);
        const triggers = ScrollTrigger.batch(rows, {
          start: "top 70%",
          onEnter: (batch) => batch.forEach((r) => r.setAttribute("data-ticked", "")),
          onLeaveBack: (batch) => batch.forEach((r) => r.removeAttribute("data-ticked")),
        });
        return () => {
          triggers.forEach((st) => st.kill());
          rows.forEach((r) => r.removeAttribute("data-ticked"));
          el.removeAttribute("data-live");
        };
      });
    },
    { scope: root },
  );

  return (
    <ul ref={root} className={className}>
      {children}
    </ul>
  );
}
