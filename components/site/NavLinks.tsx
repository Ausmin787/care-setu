"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Nav links that mark the page you are on (aria-current="page"), for the bar and the mobile sheet alike.
// "/#how" is a section of Home, so it is never the current page. A page under a link (a service detail page under
// /services, D-043) marks that link as the current section, aria-current="true".
export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const current = (href: string) =>
    href === pathname ? "page" : href !== "/" && pathname.startsWith(`${href}/`) ? "true" : undefined;
  return links.map((l) => (
    <Link key={l.href} href={l.href} aria-current={current(l.href)}>
      {l.label}
    </Link>
  ));
}

// The "Talk to us" pill marks /contact as the current page too (Blueprint #36).
export function NavTalk({ label }: { label: string }) {
  const pathname = usePathname();
  return (
    <Link className="btn sm" href="/contact" aria-current={pathname === "/contact" ? "page" : undefined}>
      {label}
    </Link>
  );
}

// The phone menu is a native <details>, which never closes by itself. It closes when a link in it is tapped (the
// "/#how" link changes no route, so the path alone is not enough), on a route change, on Escape, on a tap outside it
// and when the page is scrolled more than a thumb's flick (48px) from where it was opened.
export function NavMenu({ className, children }: { className: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let from = 0;
    const close = () => {
      el.open = false;
    };
    const onToggle = () => {
      from = window.scrollY;
    };
    const onScroll = () => {
      if (el.open && Math.abs(window.scrollY - from) > 48) close();
    };
    const onOutside = (e: PointerEvent) => {
      if (el.open && !el.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (el.open && e.key === "Escape") {
        close();
        el.querySelector("summary")?.focus();
      }
    };
    el.addEventListener("toggle", onToggle);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("toggle", onToggle);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return (
    <details
      ref={ref}
      className={className}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a") && ref.current) ref.current.open = false;
      }}
    >
      {children}
    </details>
  );
}
