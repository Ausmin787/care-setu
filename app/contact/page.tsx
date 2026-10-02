import type { Metadata } from "next";
import {
  IconAlertTriangleFilled,
  IconBrandWhatsappFilled,
  IconCircleArrowDownFilled,
  IconMailFilled,
  IconMapPinFilled,
  IconPhoneFilled,
} from "@tabler/icons-react";
import { config, enquiryOpen, phoneDisplay, t } from "@/lib/content";
import { serviceSlugs } from "@/server/contracts/queries";
import { CallStatus } from "@/components/home/CallStatus";
import { Enquiry } from "@/components/contact/Enquiry";
import s from "./page.module.css";

const p = t.contactPage;

export const metadata: Metadata = {
  title: p.metaTitle,
  description: enquiryOpen() ? p.metaDescription : p.metaDescriptionClosed,
};

// Contact (D-033): a type-led opener beside an ink call card (GetLayers Ridgeline), the email and office on sand, then
// the enquiry with its route card. The enquiry runs in development until `enquiryLive` is set by a D-entry (Q12, Q14);
// production shows the ways to call, WhatsApp and email only.
export default async function Page({ searchParams }: PageProps<"/contact">) {
  const { service } = await searchParams;
  const initialService = typeof service === "string" && serviceSlugs.includes(service) ? service : undefined;
  const open = enquiryOpen();
  const whatsapp = config.phone.replace(/^\+/, "");

  return (
    <>
      <section className={`${s.opener} wrap`}>
        <div className={s.intro}>
          <h1 className="t-display">{p.title}</h1>
          <p className={s.lede}>{open ? p.lede : p.ledeClosed}</p>
          {open && (
            <a className="btn" href="#enquiry">
              {p.leave}
              <IconCircleArrowDownFilled aria-hidden="true" />
            </a>
          )}
        </div>

        {config.phone && (
          <div className={s.card} data-mode="ink">
            <h2 className={s.cardTitle}>{p.cardTitle}</h2>
            <p className={s.number}>
              <a href={`tel:${config.phone}`}>{phoneDisplay}</a>
            </p>
            <div className={s.ways}>
              <a className="btn" href={`tel:${config.phone}`}>
                {p.call}
                <IconPhoneFilled className={s.icon} aria-hidden="true" />
              </a>
              <a className={s.wa} href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                <IconBrandWhatsappFilled aria-hidden="true" />
                {p.whatsapp}
              </a>
            </div>
            <CallStatus className={s.status} dotClassName={s.dot} />
            <p className={s.promise}>{t.servicesPage.promise.text}</p>
            <p className="sos">
              <IconAlertTriangleFilled aria-hidden="true" />
              <span>
                <b>{t.hero.emergencyTitle}</b>
                {t.hero.emergencyText}
              </span>
            </p>
          </div>
        )}
      </section>

      <div className={s.line}>
        <dl className={`${s.lineIn} wrap`}>
          {config.email && (
            <div>
              <dt>
                <IconMailFilled aria-hidden="true" />
                {p.emailLabel}
              </dt>
              <dd>
                <a href={`mailto:${config.email}`}>{config.email}</a>
              </dd>
            </div>
          )}
          <div>
            <dt>
              <IconMapPinFilled aria-hidden="true" />
              {p.officeLabel}
            </dt>
            <dd>{p.office.text}</dd>
          </div>
        </dl>
      </div>

      {open && (
        <>
          <noscript>
            <p className={`${s.noscript} wrap`}>{p.noscript}</p>
          </noscript>
          <Enquiry initialService={initialService} />
        </>
      )}
    </>
  );
}
