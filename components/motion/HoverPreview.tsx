"use client";

import { useEffect, useRef } from "react";

// Hover preview (D-031, after the Malvah case index and the Inkfish work hover): on a fine pointer with motion
// allowed, hovering a row with `data-preview="<n>"` shows figure <n> beside the cursor. The figure trails the pointer
// by a CSS transform transition; only transform and opacity change. Touch and reduced motion never see it (the rows
// carry thumbnails instead), so it is decoration with an empty alt.
export function HoverPreview({ className, children }: { className: string; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const fig = el?.querySelector<HTMLElement>("[data-preview-figure]");
    if (!el || !fig) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;
    el.setAttribute("data-live", "");
    const move = (e: PointerEvent) => {
      const row = (e.target as HTMLElement).closest<HTMLElement>("[data-preview]");
      fig.dataset.show = row ? row.dataset.preview : "";
      fig.style.transform = `translate3d(${e.clientX + 28}px, ${e.clientY - 120}px, 0)`;
    };
    const leave = () => {
      fig.dataset.show = "";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeAttribute("data-live");
    };
  }, []);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
