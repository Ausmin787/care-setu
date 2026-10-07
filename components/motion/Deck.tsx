"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Cue Kit "Stacked Deck Scroll Reveal" (refs/care-setu/cuekit/stacked-deck-spec.md): cards 42px apart (the stage's
// --peek; 24px on short screens), each 4.5% smaller behind, scaled from the top edge; the front card flies out
// (-115vh, -25deg, .94) while the rest step forward.
const STEP = 0.045;
const DEPTH = 3; // eight cards: show four, the rest wait behind the fourth
let peek = 42;
const pose = (i: number) => {
  const k = Math.min(i, DEPTH);
  return { y: k * peek, scale: 1 - k * STEP };
};

// The stacked deck (D-031). One timeline measured in scroll pixels: the cards rise into the stack while the ink band
// scrolls in (the sample does this after pinning, leaving an empty stage), then the stage pins and each step of
// `per` pixels flies the front card out. Desktop, fine pointer and motion allowed only; everything else keeps the
// resting cards. The stage sits inside this component's own <div> (Blueprint 11: the pin re-parents it).
export function Deck({ className, children }: { className: string; children: React.ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = stage.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      // Down to 480px tall: laptops at 125-150% Windows scaling give 480-600px windows (Sasanka's: 1280x537).
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 901px) and (min-height: 480px) and (pointer: fine)", () => {
        el.setAttribute("data-live", "");
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el);
        const n = cards.length;
        const railN = el.querySelector<HTMLElement>("[data-rail-n]");
        const railLabel = el.querySelector<HTMLElement>("[data-rail-label]");
        const railDot = el.querySelector<HTMLElement>("[data-rail-dot]");
        const track = railDot?.parentElement;

        let tl: gsap.core.Timeline | undefined;
        let pin: ScrollTrigger | undefined;
        let enter = 0; // scroll pixels of the entrance (one viewport)
        let per = 0; // scroll pixels per card
        let front = -1;
        let trackH = 0; // measured once per build, never per scrub frame

        const paint = (time: number) => {
          const at = gsap.utils.clamp(0, n - 1, (time - enter) / per);
          const i = Math.round(at);
          if (i !== front) {
            front = i;
            if (railN) railN.textContent = String(i + 1).padStart(2, "0");
            if (railLabel) railLabel.textContent = cards[i].dataset.lineName ?? "";
          }
          if (railDot) gsap.set(railDot, { y: ((at + 0.5) / n) * trackH });
        };

        const build = () => {
          peek = parseFloat(getComputedStyle(el).getPropertyValue("--peek")) || 42;
          trackH = track?.clientHeight ?? 0;
          // Short windows: scale the deck and rail down to the room left under the header instead of switching the
          // deck off. The cards keep their designed size inside, so their content never overflows.
          el.style.setProperty("--fit", "1");
          // The deck is as tall as the fullest card's content (prices, wrapped lines, zoom), so nothing is clipped.
          el.style.removeProperty("--deck-need");
          const need = Math.max(...cards.map((c) => c.scrollHeight));
          el.style.setProperty("--deck-need", `${need}px`);
          const deck = el.querySelector<HTMLElement>("[data-deck]");
          const body = deck?.parentElement;
          let fit = 1;
          if (deck && body) {
            const room =
              el.getBoundingClientRect().bottom -
              parseFloat(getComputedStyle(el).paddingBottom) -
              body.getBoundingClientRect().top;
            fit = Math.min(1, room / (deck.offsetHeight + 3 * peek));
            el.style.setProperty("--fit", String(fit));
          }
          enter = window.innerHeight;
          per = Math.round(window.innerHeight * 0.55);
          const runway = (n - 1) * per + Math.round(per * 0.5);
          cards.forEach((card, i) =>
            gsap.set(card, {
              zIndex: n - i,
              y: (enter * 0.72) / fit + pose(i).y,
              scale: pose(i).scale * 0.9,
              rotate: 0,
              transformOrigin: "50% 0%",
            }),
          );
          pin = ScrollTrigger.create({ trigger: el, start: "top top", end: `+=${runway}`, pin: true });
          tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: el, start: "top bottom", end: `+=${enter + runway}`, scrub: 0.5 },
            onUpdate: () => paint(tl!.time()),
          });
          // Phase 1: into the stack (power3.out, staggered), finished as the stage pins.
          cards.forEach((card, i) =>
            tl!.to(card, { ...pose(i), ease: "power3.out", duration: enter * 0.7 }, i * enter * 0.04),
          );
          // Phase 2: the front card flies out; the cards behind step forward.
          for (let i = 0; i < n - 1; i++) {
            const at = enter + i * per;
            tl.to(cards[i], { y: (-window.innerHeight * 1.15) / fit, rotate: -25, scale: 0.94, duration: per }, at);
            for (let j = i + 1; j < n; j++) {
              const from = pose(j - i);
              const to = pose(j - i - 1);
              if (from.y !== to.y) tl.to(cards[j], { ...to, duration: per }, at);
            }
          }
          tl.to({}, { duration: Math.round(per * 0.5) }, enter + (n - 1) * per);
          front = -1;
          paint(0);
        };

        const teardown = () => {
          tl?.scrollTrigger?.kill();
          tl?.kill();
          pin?.kill();
          gsap.set(cards, { clearProps: "transform,zIndex" });
        };

        // The scroll position at which card i is fully at the front.
        const scrollFor = (i: number) => (tl?.scrollTrigger ? tl.scrollTrigger.start + enter + i * per : 0);

        // Keyboard: focus inside a card brings that card to the front (WCAG 2.4.11, focus never hidden).
        const onFocus = (e: FocusEvent) => {
          const card = (e.target as HTMLElement).closest<HTMLElement>("[data-card]");
          const i = card ? cards.indexOf(card) : -1;
          if (i >= 0) window.scrollTo({ top: scrollFor(i), behavior: "instant" });
        };
        // The opener's line links jump to the pin position of their first card, not to the card's resting spot.
        const onClick = (e: MouseEvent) => {
          const link = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-deck-link]");
          const card = link && el.querySelector<HTMLElement>(link.hash);
          const i = card ? cards.indexOf(card) : -1;
          if (i < 0) return;
          e.preventDefault();
          window.scrollTo({ top: scrollFor(i), behavior: "smooth" });
        };

        let lastH = window.innerHeight;
        let lastW = window.innerWidth;
        let timer = 0;
        const rebuild = () => {
          teardown();
          build();
          ScrollTrigger.refresh();
        };
        const onResize = () => {
          window.clearTimeout(timer);
          timer = window.setTimeout(() => {
            if (window.innerHeight === lastH && window.innerWidth === lastW) return;
            lastH = window.innerHeight;
            lastW = window.innerWidth;
            rebuild();
          }, 200);
        };

        build();
        // Web fonts change how the cards wrap, so measure again once they are in.
        document.fonts.ready.then(() => {
          if (el.hasAttribute("data-live")) rebuild();
        });
        el.addEventListener("focusin", onFocus);
        document.addEventListener("click", onClick);
        window.addEventListener("resize", onResize);
        return () => {
          window.clearTimeout(timer);
          el.removeEventListener("focusin", onFocus);
          document.removeEventListener("click", onClick);
          window.removeEventListener("resize", onResize);
          teardown();
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
