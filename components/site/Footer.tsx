import Link from "next/link";
import { FooterWordmark } from "@/components/motion/FooterWordmark";
import { lines, t } from "@/lib/content";
import s from "./Footer.module.css";

const L = t.footer.links;
const links: { href: string; label: string; draft?: boolean }[] = [
  { href: "/services", label: L.services },
  { href: "/about", label: L.about },
  { href: "/#how", label: L.how },
  { href: "/partner", label: L.partner },
  { href: "/contact", label: L.contact },
  { href: "/pay", label: L.pay },
  { href: "/faq", label: L.faq },
  { href: "/privacy", label: L.privacy, draft: true },
  { href: "/terms", label: L.terms, draft: true },
  { href: "/refunds", label: L.refunds, draft: true },
];

// The footer is the network legend: every line listed as on a metro map. It closes on the wordmark (D-023).
export function Footer() {
  return (
    <footer className={`${s.foot} wrap`} data-mode="ink">
      <div className={s.legend}>
        <h2>{t.footer.legendTitle}</h2>
        <ul>
          {lines.map((l) => (
            <li key={l.slug} data-line={l.line}>
              <span className={s.ln} />
              {l.name}
            </li>
          ))}
          <li>
            <span className={`${s.ln} ${s.more}`} />
            {t.footer.moreLines}
          </li>
        </ul>
      </div>
      <nav className={s.links} aria-label="Footer">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
            {l.draft && <span className={s.draft}>{t.footer.draft}</span>}
          </Link>
        ))}
      </nav>
      <div className={s.wordmark}>
        <FooterWordmark text="care setu" />
      </div>
      {/* Legal name and copyright holder wait on Q5 (LLP status). */}
      <p className={s.legal}>{t.footer.legal}</p>
    </footer>
  );
}
