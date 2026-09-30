"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The manifesto's inline capsules open with scroll (D-032; GetLayers Halden: small images between the words). Their
// space is reserved in the line, so opening never changes a width (Blueprint 9.4). One scrubbed timeline for the
// sentence, capsules in reading order. The closed state is set only when motion is allowed, so no-JS and reduced
// motion show them open.
// Nothing here is ever scaled. The first build opened each capsule with scaleX and grew its icon with scale: the
// browser then rasterised the pill at its small starting size and stretched that bitmap while the scrub ran, so the
// pill and icon looked pixelated until it caught up. Now the scrub drives --open, which the CSS turns into a
// clip-path window on a full-size pill (paint only), and the icon fades up by translate: every frame is drawn at
// full resolution, and the capsules need no compositor layer of their own (force3D off).
export function Capsules({ className, children }: { className: string; children: React.ReactNode }) {
  const root = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const caps = gsap.utils.toArray<HTMLElement>("[data-capsule]", el);
        const icons = caps.map((c) => c.firstElementChild).filter(Boolean) as Element[];
        const tl = gsap.timeline({
          defaults: { ease: "none", force3D: false },
          scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 52%", scrub: 0.5 },
        });
        caps.forEach((cap, i) => {
          tl.fromTo(cap, { "--open": 0.12 }, { "--open": 1, duration: 1 }, i * 0.7);
          if (icons[i]) tl.fromTo(icons[i], { opacity: 0, yPercent: 45 }, { opacity: 1, yPercent: 0, duration: 0.5 }, i * 0.7 + 0.5);
        });
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          caps.forEach((c) => c.style.removeProperty("--open"));
          gsap.set(icons, { clearProps: "transform,opacity" });
        };
      });
    },
    { scope: root },
  );

  return (
    <p ref={root} className={className}>
      {children}
    </p>
  );
}
