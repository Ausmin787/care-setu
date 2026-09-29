import type { Metadata } from "next";
import { config, phoneDisplay, t } from "@/lib/content";
import { NOTICE_VERSION } from "@/lib/privacy";
import s from "./page.module.css";

const p = t.privacyPage;

export const metadata: Metadata = {
  title: p.metaTitle,
  description: p.metaDescription,
};

// The privacy notice the enquiry's consent points to (INVARIANT 12, D-033). Drafted by Claude against the DPDP Act and
// Rules (D-012): it carries the DRAFT marker and the points for the reviewer until a lawyer or CA signs it off.
export default function Page() {
  return (
    <article className={`${s.page} wrap`}>
      <p className={s.draft} role="note">
        {p.draft}
      </p>
      <h1 className="t-head">{p.title}</h1>
      <p className={s.version}>{p.version.replace("{v}", NOTICE_VERSION)}</p>
      <p className={s.intro}>{p.intro}</p>

      {p.sections.map((section) => (
        <section key={section.title} className={s.section}>
          <h2>{section.title}</h2>
          {section.items && (
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {section.text && <p>{section.text}</p>}
        </section>
      ))}

      <dl className={s.contact}>
        {config.phone && (
          <div>
            <dt>{t.contactPage.cardTitle}</dt>
            <dd>
              <a href={`tel:${config.phone}`}>{phoneDisplay}</a>
            </dd>
          </div>
        )}
        {config.email && (
          <div>
            <dt>{t.contactPage.emailLabel}</dt>
            <dd>
              <a href={`mailto:${config.email}`}>{config.email}</a>
            </dd>
          </div>
        )}
        <div>
          <dt>{t.contactPage.officeLabel}</dt>
          <dd>{t.contactPage.office.text}</dd>
        </div>
      </dl>

      <section className={s.review}>
        <h2>{p.reviewTitle}</h2>
        <ul>
          {p.review.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>{p.sources}</p>
      </section>
    </article>
  );
}
