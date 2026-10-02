"use client";

import { useSyncExternalStore } from "react";
import type { PartnerKind } from "@/server/contracts/partners";

// The audience chosen on the Partner page's switch (D-038), shared with the form so its "I'm writing as" follows the
// switch until the visitor picks one themselves. Null until the switch is used, so the server's `?for=` value wins
// on first paint and there is no hydration mismatch.
let chosen: PartnerKind | null = null;
const listeners = new Set<() => void>();

export function chooseAudience(kind: PartnerKind) {
  chosen = kind;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAudience(initial: PartnerKind): PartnerKind {
  return useSyncExternalStore(
    subscribe,
    () => chosen ?? initial,
    () => initial
  );
}

export const motionOK = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
