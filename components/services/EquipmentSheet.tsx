import Image from "next/image";
import Link from "next/link";
import { IconCircleArrowRightFilled } from "@tabler/icons-react";
import { equipment, formatPaise, shown, shownPrice, t } from "@/lib/content";
import { HoverPreview } from "@/components/motion/HoverPreview";
import s from "./EquipmentSheet.module.css";

const e = t.servicesPage.sheet;
const two = (n: number) => String(n).padStart(2, "0");

// The equipment side by side (D-031), after the Malvah case index (a quiet table whose hovered row inverts) and the
// Inkfish work hover (the item's image beside the cursor). Items are C-041, pending (D-029): development only.
// Amounts show only when showPrices is on; "rent" and "buy" are read from each item's price rows.
export function EquipmentSheet() {
  const items = equipment.filter((item) => shown(item));
  if (items.length === 0) return null;
  const withPrices = items.some((item) => item.prices.some((pr) => shownPrice(pr)));

  return (
    <section className={`${s.sec} wrap`} id="equipment" aria-labelledby="sheet-title" data-line="olive">
      <header className={s.head}>
        <h2 id="sheet-title" className="t-head">
          {e.title}
          {items.some((i) => i.pending) && (
            <span className="pending" title={t.pending.title}>
              {t.pending.tag}
            </span>
          )}
        </h2>
        <p>{e.lede}</p>
      </header>
      <HoverPreview className={s.frame}>
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col" className={s.no}>
                <span className="sr">No.</span>
              </th>
              <th scope="col">{e.item}</th>
              <th scope="col">{e.what}</th>
              <th scope="col">{e.ways}</th>
              <th scope="col">
                <span className="sr">{e.ask}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const ways = [
                item.prices.some((pr) => pr.unit.includes("rent")) && e.rent,
                item.prices.some((pr) => pr.unit.includes("buy")) && e.buy,
              ].filter(Boolean);
              const prices = item.prices.map((pr) => shownPrice(pr)).filter((pr) => pr !== undefined);
              return (
                <tr key={item.slug} data-preview={item.image ? i : undefined}>
                  <td className={s.no}>
                    {item.image && (
                      <span className={s.thumb}>
                        <Image src={item.image.src} alt="" fill sizes="64px" style={{ objectPosition: `50% ${item.image.focus}` }} />
                      </span>
                    )}
                    <span className={s.num}>{two(i + 1)}</span>
                  </td>
                  <th scope="row" className={s.name}>
                    <span>{item.name}</span>
                  </th>
                  <td className={s.what}>{item.text}</td>
                  <td className={s.ways}>
                    {ways.join(" · ")}
                    {withPrices &&
                      prices.map((pr) => (
                        <span key={pr.unit} className={s.amount}>
                          {formatPaise(pr.paise)} {pr.unit}
                        </span>
                      ))}
                  </td>
                  <td className={s.ask}>
                    <Link href="/contact">
                      <span className="sr">
                        {e.ask} {item.name}
                      </span>
                      <IconCircleArrowRightFilled aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* The cursor figure: every still-life is loaded once and the hovered one is shown. */}
        <div className={s.figure} data-preview-figure aria-hidden="true">
          {items.map((item, i) =>
            item.image ? (
              <span key={item.slug} data-n={i}>
                <Image src={item.image.src} alt="" fill sizes="240px" style={{ objectPosition: `50% ${item.image.focus}` }} />
              </span>
            ) : null,
          )}
        </div>
      </HoverPreview>
    </section>
  );
}
