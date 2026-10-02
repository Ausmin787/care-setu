import Link from "next/link";
import { IconCircleArrowRightFilled } from "@tabler/icons-react";
import { config, t } from "@/lib/content";
import s from "./PromoBanner.module.css";

// The promotions banner (D-013), built but off: `promotion` in site.config.json is null until the owners set the
// rules (Q9), and null renders nothing. The text and target are the owners' words; this never computes a discount,
// since any discount is server-side on the quote (D-004).
export function PromoBanner() {
  const promo = config.promotion;
  if (!promo) return null;
  return (
    <aside className={s.promo} aria-label={t.promo.label}>
      <Link className={s.link} href={promo.href}>
        <span>{promo.text}</span>
        <IconCircleArrowRightFilled aria-hidden="true" />
      </Link>
    </aside>
  );
}
