"use client";

import { useEffect, useRef, useState } from "react";
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react";
import { t } from "@/lib/content";

// The hero loop (CLAIMS C-034): AI mood footage, decorative, never presented as a patient (Invariant 16).
// The server renders it paused on its poster; the client starts it only when motion is welcome, so reduced
// motion and no-JS both keep the still. The button satisfies WCAG 2.2.2 (pause for motion over 5 s).
export function HeroVideo({ className, buttonClassName }: { className: string; buttonClassName: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {}); // autoplay can be refused (data saver); the poster stays
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <>
      <video
        ref={ref}
        className={className}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/video/hero-care-poster.webp"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/video/hero-care.webm" type="video/webm" />
        <source src="/video/hero-care.mp4" type="video/mp4" />
      </video>
      <button type="button" className={buttonClassName} onClick={toggle} aria-pressed={!playing}>
        {playing ? <IconPlayerPauseFilled aria-hidden="true" /> : <IconPlayerPlayFilled aria-hidden="true" />}
        <span className="sr">{playing ? t.hero.videoPause : t.hero.videoPlay}</span>
      </button>
    </>
  );
}
