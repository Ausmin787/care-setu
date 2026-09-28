"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import s from "./Thread.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Where the drawing tip sits: the same line the trip's live marker rides (LiveTrip, "top 65%"), so the marker
// hands over to the thread and the line keeps going exactly where the reader is looking.
const TIP = 0.65;

// The thread (D-030, after Skiper UI 19): one segment of the trip's line per Home section (a pinned section keeps
// its own piece). It runs down a rail in the middle of the section's left gutter, stops at a station beside the
// element marked `data-thread-stop`; `enter` starts at the trip's end cap and swings over to the rail, `end` finishes
// with a terminus. With motion allowed the line is drawn up to the tip and a faint route shows ahead of it; scrolling
// up takes it back. Without JS or with reduced motion the finished line is the resting state (Blueprint 9.5).
//
// Drawing uses the path's real length in px. (The first version normalised it with pathLength="1" and tweened the
// dash offset 1 -> 0; GSAP auto-rounds px CSS values, so it snapped between hidden and fully drawn.)
export function Thread({ enter, end }: { enter?: boolean; end?: boolean }) {
  const svg = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const el = svg.current;
      const section = el?.parentElement;
      if (!el || !section) return;
      const inks = Array.from(el.querySelectorAll<SVGPathElement>("[data-ink]"));
      const route = Array.from(el.querySelectorAll<SVGPathElement>("[data-route]"));
      const [stop, terminus] = Array.from(el.querySelectorAll<SVGCircleElement>("circle"));

      // Geometry, measured on layout. `top` is the viewBox's first y (negative when the path starts in the trip).
      let top = 0;
      let total = 0;
      let stopLen = Infinity;
      let lut: { y: number; len: number }[] = [];

      const layout = () => {
        const box = section.getBoundingClientRect();
        const h = section.offsetHeight;
        const rail = Math.max(12, parseFloat(getComputedStyle(section).paddingLeft) / 2);
        const mark = section.querySelector<HTMLElement>("[data-thread-stop]");
        const sy = mark ? mark.getBoundingClientRect().top - box.top + mark.offsetHeight / 2 : 0;

        top = 0;
        let d = `M ${rail} 0`;
        if (enter) {
          const from = document
            .querySelector<HTMLElement>("[data-thread-from] > [data-station]:last-child > span")
            ?.getBoundingClientRect();
          if (from) {
            const fx = from.left + from.width / 2 - box.left;
            const fy = from.bottom - box.top - 10; // tuck under the rounded end cap
            const bendTop = Math.max(fy + 24, 8);
            const bendEnd = Math.max(bendTop + 60, sy - 56);
            const mid = (bendTop + bendEnd) / 2;
            top = Math.min(0, fy);
            d = `M ${fx} ${fy} L ${fx} ${bendTop} C ${fx} ${mid} ${rail} ${mid} ${rail} ${bendEnd}`;
          }
        }
        d += ` L ${rail} ${end ? h - 28 : h + 1}`;
        [...inks, ...route].forEach((p) => p.setAttribute("d", d));
        stop.setAttribute("cx", String(rail));
        stop.setAttribute("cy", String(sy));
        stop.style.display = mark ? "" : "none";
        terminus.setAttribute("cx", String(rail));
        terminus.setAttribute("cy", String(h - 28));
        terminus.style.display = end ? "" : "none";
        el.setAttribute("viewBox", `0 ${top} ${box.width} ${h - top}`);
        el.style.top = `${top}px`;
        el.style.height = `${h - top}px`;

        // y -> length lookup. The path only ever travels downward, so y is monotonic along its length.
        total = inks[0].getTotalLength();
        lut = [];
        for (let len = 0; len <= total; len += 6) lut.push({ y: inks[0].getPointAtLength(len).y, len });
        lut.push({ y: inks[0].getPointAtLength(total).y, len: total });
        stopLen = mark ? lengthAt(sy) : Infinity;
      };

      const lengthAt = (y: number) => {
        if (!lut.length || y <= lut[0].y) return 0;
        if (y >= lut[lut.length - 1].y) return total;
        let lo = 0;
        let hi = lut.length - 1;
        while (hi - lo > 1) {
          const m = (lo + hi) >> 1;
          if (lut[m].y < y) lo = m;
          else hi = m;
        }
        const a = lut[lo];
        const b = lut[hi];
        return a.len + ((y - a.y) / (b.y - a.y || 1)) * (b.len - a.len);
      };

      layout();

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 901px)", () => {
        el.setAttribute("data-live", "");
        const drawn = { len: 0 };
        const paint = () => {
          const offset = Math.max(0, total - drawn.len);
          inks.forEach((p) => {
            p.style.strokeDasharray = `${total} ${total}`;
            p.style.strokeDashoffset = String(offset);
          });
          stop.toggleAttribute("data-passed", drawn.len >= stopLen - 1);
          terminus.toggleAttribute("data-passed", drawn.len >= total - 1);
        };
        // quickTo eases the tip towards the scroll target (a short catch-up, like scrub), on a plain object so
        // nothing is rounded.
        const toLen = gsap.quickTo(drawn, "len", { duration: 0.35, ease: "power3.out", onUpdate: paint });
        // The tip's target: the viewport's TIP line, in this SVG's coordinates (1 user unit = 1px).
        const target = () => lengthAt(window.innerHeight * TIP - el.getBoundingClientRect().top + top);

        const st = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: () => toLen(target()),
          onRefresh: () => {
            drawn.len = target();
            toLen(drawn.len);
            paint();
          },
        });
        drawn.len = target();
        paint();

        return () => {
          st.kill();
          el.removeAttribute("data-live");
          inks.forEach((p) => {
            p.style.strokeDasharray = "";
            p.style.strokeDashoffset = "";
          });
          stop.removeAttribute("data-passed");
          terminus.removeAttribute("data-passed");
        };
      });

      // Layout changes (fonts, pins, resize) re-measure the path before triggers recalculate.
      ScrollTrigger.addEventListener("refreshInit", layout);
      const ro = new ResizeObserver(() => ScrollTrigger.refresh());
      ro.observe(section);
      document.fonts.ready.then(() => ScrollTrigger.refresh());

      return () => {
        ro.disconnect();
        ScrollTrigger.removeEventListener("refreshInit", layout);
        mm.revert();
      };
    },
    { scope: svg },
  );

  return (
    <svg ref={svg} className={s.thread} aria-hidden="true" focusable="false">
      <g className={s.route}>
        <path className={s.case} data-route />
        <path className={s.line} data-route />
      </g>
      <path className={s.case} data-ink />
      <path className={s.line} data-ink />
      <circle className={s.stop} r={10} />
      <circle className={s.stop} r={14} data-end />
    </svg>
  );
}
