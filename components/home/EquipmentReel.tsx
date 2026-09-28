import Image from "next/image";
import Link from "next/link";
import { IconCircleArrowRightFilled } from "@tabler/icons-react";
import { equipment, formatPaise, shown, shownPrice, t } from "@/lib/content";
import { Reel } from "@/components/motion/Reel";
import { Thread } from "@/components/motion/Thread";
import s from "./EquipmentReel.module.css";

const e = t.equipment;

// Equipment at home (D-030): six tall panels, image above an olive caption block (Akaru's colour-blocked captions).
// Items are C-041, pending until the owners confirm (D-029), so production renders nothing here until then.
// Images are Sasanka's generated still-lifes (C-073, illustration only); an item without one keeps the type-led slot.
export function EquipmentReel() {
  const items = equipment.filter((item) => shown(item));
  if (items.length === 0) return null;
  const total = String(items.length).padStart(2, "0");

  return (
    <section className={s.sec} id="equipment" aria-labelledby="equipment-title" data-line="olive">
      <Reel className={`${s.stage} wrap`} trackSelector="[data-track]">
        <Thread />
        <header className={s.head}>
          <h2 id="equipment-title" className="t-head" data-thread-stop>
            {e.title}
            {items.some((i) => i.pending) && (
              <span className="pending" title={t.pending.title}>
                {t.pending.tag}
              </span>
            )}
          </h2>
          <p>{e.lede}</p>
        </header>
        {/* The window clips the moving track just right of the thread, so panels leave behind the line. */}
        <div className={s.window}>
          <ol className={s.track} data-track aria-label={e.hint}>
            {items.map((item, i) => {
              const prices = item.prices.map((p) => shownPrice(p)).filter((p) => p !== undefined);
              return (
                <li key={item.slug} className={s.panel}>
                  <div className={s.slot}>
                    {item.image ? (
                      <Image
                        className={s.img}
                        src={item.image.src}
                        alt={item.image.alt}
                        fill
                        sizes="(max-width: 900px) 78vw, 370px"
                        style={{ objectPosition: `50% ${item.image.focus}` }}
                      />
                    ) : (
                      <>
                        <span className={s.n} aria-hidden="true">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className={s.soon}>{e.imageSlot}</span>
                      </>
                    )}
                  </div>
                  <div className={s.caption}>
                    <p className={s.count}>
                      {String(i + 1).padStart(2, "0")} {e.of} {total}
                    </p>
                    <h3>{item.name}</h3>
                    <p className={s.text}>{item.text}</p>
                    {prices.map((p) => (
                      <p key={p.unit} className={s.price}>
                        {formatPaise(p.paise)} {p.unit}
                      </p>
                    ))}
                    <Link className={s.ask} href="/contact">
                      {e.ask} {item.name.toLowerCase()}
                      <IconCircleArrowRightFilled aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Reel>
    </section>
  );
}
