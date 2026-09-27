import Link from "next/link";
import { IconMenu2, IconPhoneFilled } from "@tabler/icons-react";
import { LogoMark } from "@/components/LogoMark";
import { config, phoneDisplay, t } from "@/lib/content";
import s from "./Nav.module.css";

const links = [
  { href: "/services", label: t.nav.services },
  { href: "/#how", label: t.nav.how },
  { href: "/partner", label: t.nav.partner },
];

// Full-width bar (D-028, after Biograph and myhealthprac): solid parchment by default; over a hero marked
// data-nav-over it starts transparent and solidifies on scroll (CSS only, see the module). Warm-toned mark.
export function Nav() {
  return (
    <header className={`${s.nav} wrap`}>
      <Link className={s.brand} href="/" aria-label={t.nav.home}>
        <LogoMark className={s.mark} tone="warm" />
        <b translate="no">CARE SETU</b>
      </Link>
      <nav className={s.links} aria-label="Main">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className={s.right}>
        {/* Phone shows only when the owners have published a real number (Q3 answered in D-024). */}
        {config.phone && (
          <a className={s.phone} href={`tel:${config.phone}`}>
            <IconPhoneFilled aria-hidden="true" />
            {phoneDisplay}
          </a>
        )}
        <Link className="btn sm" href="/contact">
          {t.nav.talk}
        </Link>
        <details className={s.menu}>
          <summary aria-label={t.nav.menu}>
            <IconMenu2 aria-hidden="true" />
          </summary>
          <div className={s.sheet}>
            {links.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </header>
  );
}
