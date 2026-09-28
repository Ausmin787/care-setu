"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The manifesto's inline capsules open with scroll (D-032; GetLayers Halden: small images between the words). Their
// space is reserved in the line, so opening is a scaleX from the centre, never a width change (Blueprint 9.4). One
// scrubbed timeline for the sentence, capsules in reading order. The closed state is set only when motion is
// allowed, so no-JS and reduced motion show them open.
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
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 52%", scrub: 0.5 },
        });
        caps.forEach((cap, i) => {
          tl.fromTo(cap, { scaleX: 0.12 }, { scaleX: 1, duration: 1 }, i * 0.7);
          if (icons[i]) tl.fromTo(icons[i], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5 }, i * 0.7 + 0.5);
        });
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set([...caps, ...icons], { clearProps: "transform,opacity" });
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
