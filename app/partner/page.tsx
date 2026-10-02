import type { Metadata } from "next";
import { IconBrandWhatsappFilled, IconMailFilled, IconPhoneFilled } from "@tabler/icons-react";
import { config, LINES, partnerEnquiryOpen, phoneDisplay, shown, t } from "@/lib/content";
import { partner } from "@/lib/partner";
import { parsePartnerKind } from "@/server/contracts/partners";
import { CallStatus } from "@/components/home/CallStatus";
import { Switchboard, type View } from "@/components/partner/Switchboard";
import { CheckFile } from "@/components/partner/CheckFile";
import { PartnerForm } from "@/components/partner/PartnerForm";
import s from "./page.module.css";

const p = t.partnerPage;

export const metadata: Metadata = {
  title: p.metaTitle,
  description: p.metaDescription,
};

// Partner with us (D-038): the re-deal (one bento switched by audience), the five checks as a file, and a short form.
// The deck content is pending (development only); the form runs in development only and sends nothing (INVARIANT 31).
// Production shows the switch with Home's approved role lines and the ways to call or email.
export default async function Page({ searchParams }: PageProps<"/partner">) {
  const query = await searchParams;
  const initial = parsePartnerKind(query.for) ?? "hospital";
  const start = shown(partner.start);
  const checks = shown(partner.checks);
  const formOpen = partnerEnquiryOpen();
  const whatsapp = config.phone.replace(/^\+/, "");

  const views: View[] = t.partner.roles.map((role, i) => {
    const kind = parsePartnerKind(role.for) ?? "hospital";
    return {
      kind,
      tab: role.tab,
      line: LINES.find((line) => line === role.line) ?? "lime",
      title: role.title,
      text: role.text,
      content: shown(partner.audiences[i]),
      steps: start?.steps[kind],
    };
  });

  return (
    <>
      <Switchboard views={views} initial={initial} startTitle={start?.title} formOpen={formOpen} />

      {checks && <CheckFile checks={checks} />}

      <section id="partner-form" className={`${s.enquiry} wrap`} aria-labelledby="partner-form-title">
        <div className={s.main}>
          <h2 id="partner-form-title" className="t-head">
            {formOpen ? p.form.title : p.contact.title}
          </h2>
          {formOpen ? (
            <>
              <p className={s.intro}>{p.form.intro}</p>
              <PartnerForm initial={initial} />
            </>
          ) : (
            <p className={s.intro}>{p.contact.text}</p>
          )}
        </div>

        {config.phone && (
          <aside className={s.card} data-mode="ink" aria-label={p.contact.title}>
            {formOpen && <p className={s.cardTitle}>{p.contact.text}</p>}
            <p className={s.number}>
              <a href={`tel:${config.phone}`}>{phoneDisplay}</a>
            </p>
            <div className={s.ways}>
              <a className="btn" href={`tel:${config.phone}`}>
                {p.contact.call}
                <IconPhoneFilled className={s.icon} aria-hidden="true" />
              </a>
              <a className={s.link} href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                <IconBrandWhatsappFilled aria-hidden="true" />
                {p.contact.whatsapp}
              </a>
            </div>
            {config.email && (
              <a className={s.link} href={`mailto:${config.email}`}>
                <IconMailFilled aria-hidden="true" />
                {config.email}
              </a>
            )}
            <CallStatus className={s.status} dotClassName={s.dot} />
          </aside>
        )}
      </section>
    </>
  );
}
