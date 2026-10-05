import Link from "next/link";
import { IconMenu2, IconPhoneFilled } from "@tabler/icons-react";
import { LogoMark } from "@/components/LogoMark";
import { config, phoneDisplay, t } from "@/lib/content";
import { NavLinks, NavMenu, NavTalk } from "./NavLinks";
import s from "./Nav.module.css";

const links = [
  { href: "/services", label: t.nav.services },
  { href: "/about", label: t.nav.about },
  { href: "/#how", label: t.nav.how },
  { href: "/partner", label: t.nav.partner },
];

// Full-width ink bar (D-028, after Biograph and myhealthprac): one colour set everywhere (white wordmark, the
// logo in its own colours, a cream pill); over a hero marked data-nav-over only the fill fades in on scroll.
export function Nav() {
  return (
    <header className={`${s.nav} wrap`} data-mode="ink">
      <Link className={s.brand} href="/" aria-label={t.nav.home}>
        <LogoMark className={s.mark} />
        <b translate="no">CARE SETU</b>
      </Link>
      <nav className={s.links} aria-label="Main">
        <NavLinks links={links} />
      </nav>
      <div className={s.right}>
        {/* Phone shows only when the owners have published a real number (Q3 answered in D-024). */}
        {config.phone && (
          <a className={s.phone} href={`tel:${config.phone}`}>
            <IconPhoneFilled aria-hidden="true" />
            {phoneDisplay}
          </a>
        )}
        <NavTalk label={t.nav.talk} />
        <NavMenu className={s.menu}>
          <summary aria-label={t.nav.menu}>
            <IconMenu2 aria-hidden="true" />
          </summary>
          <div className={s.sheet}>
            <NavLinks links={links} />
          </div>
        </NavMenu>
      </div>
    </header>
  );
}
