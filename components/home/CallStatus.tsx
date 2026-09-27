"use client";

import { useSyncExternalStore } from "react";
import { config, t } from "@/lib/content";
import { callsOpenAt } from "@/lib/hours";

// The instrument (Blueprint 8.3): whether calls are being taken right now, from the published hours
// (D-024, C-031). Nothing renders on the server, so no clock time is baked into the HTML.
const isOpen = () => (config.hours ? callsOpenAt(new Date(), config.hours) : false);

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(id);
}

export function CallStatus({ className, dotClassName }: { className: string; dotClassName: string }) {
  const open = useSyncExternalStore(subscribe, isOpen, () => null);
  if (open === null || !config.hours) return null;
  return (
    <p className={className} data-open={open}>
      <i className={dotClassName} aria-hidden="true" />
      {open ? t.hero.status.open : t.hero.status.closed}
    </p>
  );
}
