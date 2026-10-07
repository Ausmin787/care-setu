"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MIN_IMAGE = 200; // the least height an image keeps above its caption in the pinned strip

// Horizontal reel (D-030, after the Akaru homepage): on desktop the stage pins and vertical scroll moves the track
// sideways; the stage's thread segment draws in the same scrub. Touch and reduced motion keep the native
// scroll-snap strip (Blueprint 9.4: no pinned horizontal scroll on touch). The stage is pinned inside this
// component's own <div>, so React never removes a node GSAP has re-parented (Blueprint 11).
export function Reel({
  className,
  trackSelector,
  children,
}: {
  className: string;
  trackSelector: string;
  children: React.ReactNode;
}) {
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = stage.current;
      const track = el?.querySelector<HTMLElement>(trackSelector);
      if (!el || !track) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 901px) and (pointer: fine)", () => {
        el.setAttribute("data-live", "");
        // Short windows: the header and strip keep a designed height of 440px and scale down to the
        // room under the nav, so the pinned stage never runs past the bottom of the screen. Re-measured on refresh.
        const fitBox = el.querySelector<HTMLElement>("[data-reel-fit]");
        const setFit = () => {
          if (!fitBox) return;
          const cs = getComputedStyle(el);
          const room = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
          // Captions differ in length (prices, wrapping), so they are all set to the tallest one's content height
          // and the images above them match; the design height grows with it when the caption needs more than 440px.
          el.style.removeProperty("--cap-h");
          el.style.setProperty("--fit", "1");
          const caps = Array.from(el.querySelectorAll<HTMLElement>("[data-reel-caption]"));
          const capH = Math.max(0, ...caps.map((c) => c.scrollHeight)) + 6; // 6px: scaled text can round a line up
          if (capH > 6) el.style.setProperty("--cap-h", `${capH}px`);
          const head = fitBox.firstElementChild as HTMLElement | null;
          const above = head ? head.offsetHeight + (parseFloat(getComputedStyle(fitBox).rowGap) || 0) : 0;
          const design = Math.max(440, above + capH + MIN_IMAGE);
          el.style.setProperty("--room", `${room}px`);
          el.style.setProperty("--fit", String(Math.min(1, room / design)));
        };
        setFit();
        ScrollTrigger.addEventListener("refreshInit", setFit);
        // Travel = the track's overflow past its clipping window (the parent), not past the stage.
        const frame = track.parentElement ?? el;
        const distance = () => Math.max(0, track.scrollWidth - frame.clientWidth);
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
        tl.to(track, { x: () => -distance() }, 0);
        // Keyboard: a focused panel may sit off-screen in the track; scroll the page to the pin position that
        // brings it into the window, so focus is never invisible (WCAG 2.4.11).
        const onFocus = (e: FocusEvent) => {
          const panel = (e.target as HTMLElement).closest("li");
          const st = tl.scrollTrigger;
          if (!panel || !st || !track.contains(panel)) return;
          const x = Math.min(Math.max(0, panel.offsetLeft - 24), distance());
          const y = st.start + (distance() ? x / distance() : 0) * (st.end - st.start);
          window.scrollTo({ top: y, behavior: "instant" });
        };
        track.addEventListener("focusin", onFocus);
        return () => {
          ScrollTrigger.removeEventListener("refreshInit", setFit);
          el.style.removeProperty("--room");
          el.style.removeProperty("--fit");
          el.style.removeProperty("--cap-h");
          track.removeEventListener("focusin", onFocus);
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set(track, { clearProps: "transform" });
          el.removeAttribute("data-live");
        };
      });
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: stage },
  );

  return (
    <div>
      <div ref={stage} className={className}>
        {children}
      </div>
    </div>
  );
}
