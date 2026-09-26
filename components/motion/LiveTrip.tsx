"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Signature motion "live trip" (D-021): a position marker rides the trip spine with scroll and each row
// turns from ghost to full as the marker reaches it. Transient state lives in the JS-set `data-live`,
// so no-JS and reduced motion render the finished trip (Blueprint 9.5). GSAP lane: scroll only (9.1).
export function LiveTrip({
  className,
  markerClassName,
  children,
}: {
  className?: string;
  markerClassName?: string;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const dot = marker.current;
      if (!el || !dot) return;
      const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-seg]"));
      const stations = rows.filter((r) => r.hasAttribute("data-station"));
      if (stations.length < 2) return;

      // Row tops are read once per layout (mount + every ScrollTrigger refresh), never per frame.
      let tops = rows.map((r) => r.offsetTop);
      const measure = () => {
        tops = rows.map((r) => r.offsetTop);
      };
      ScrollTrigger.addEventListener("refreshInit", measure);
      const setPassed = (y: number) => {
        rows.forEach((r, i) => r.toggleAttribute("data-passed", tops[i] <= y + 1));
      };
      const spineHalf = () => parseFloat(getComputedStyle(el).getPropertyValue("--spine")) / 2 || 14;
      const top = (r: HTMLElement) => r.offsetTop + spineHalf();

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 901px)", () => {
        el.setAttribute("data-live", "");
        const first = stations[0];
        const last = stations[stations.length - 1];
        gsap.set(dot, { y: () => top(first) });
        const tween = gsap.fromTo(
          dot,
          { y: () => top(first) },
          {
            y: () => top(last),
            ease: "none",
            immediateRender: false,
            // Follow the marker's rendered position every frame, not the scroll target (scrub lags it).
            onUpdate: () => setPassed(Number(gsap.getProperty(dot, "y")) - spineHalf()),
            scrollTrigger: {
              trigger: el,
              start: "top 65%",
              end: "bottom 65%",
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          },
        );
        setPassed(top(first) - spineHalf());
        return () => {
          tween.scrollTrigger?.kill();
          el.removeAttribute("data-live");
          rows.forEach((r) => r.removeAttribute("data-passed"));
        };
      });

      mm.add("(prefers-reduced-motion: no-preference) and (max-width: 900px)", () => {
        el.setAttribute("data-live", "");
        const triggers = rows.map((r) =>
          ScrollTrigger.create({
            trigger: r,
            start: "top 70%",
            onEnter: () => r.setAttribute("data-passed", ""),
            onLeaveBack: () => r.removeAttribute("data-passed"),
          }),
        );
        return () => {
          triggers.forEach((t) => t.kill());
          el.removeAttribute("data-live");
          rows.forEach((r) => r.removeAttribute("data-passed"));
        };
      });

      // Anek changes line boxes when it lands; measure again after (Blueprint 9.4).
      document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => ScrollTrigger.removeEventListener("refreshInit", measure);
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      <i ref={marker} className={markerClassName} aria-hidden="true" />
      {children}
    </div>
  );
}
