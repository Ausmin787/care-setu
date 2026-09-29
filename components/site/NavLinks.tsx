"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Nav links that mark the page you are on (aria-current="page"), for the bar and the mobile sheet alike.
// "/#how" is a section of Home, so it is never the current page.
export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return links.map((l) => (
    <Link key={l.href} href={l.href} aria-current={l.href === pathname ? "page" : undefined}>
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
