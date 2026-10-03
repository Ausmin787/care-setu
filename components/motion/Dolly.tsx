"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The service hero's dolly (D-043, after GetLayers Aerra): the inset still-life opens to full bleed as the page scrolls
// from the top until the panel reaches the nav. GSAP scrubs one unitless CSS variable, `--open` 0 -> 1, and the CSS
// turns it into a `clip-path: inset()` window, so the image is never scaled while scrubbing (Blueprint 11, D-034).
// The resting state (no JS, reduced motion) is the inset panel. No pin.
export function Dolly({ className, children }: { className: string; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
        const tween = gsap.fromTo(
          el,
          { "--open": 0 },
          {
            "--open": 1,
            ease: "none",
            scrollTrigger: {
              start: 0,
              end: () => Math.max(1, el.getBoundingClientRect().top + window.scrollY - nav),
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          },
        );
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          el.style.removeProperty("--open");
        };
      });
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
