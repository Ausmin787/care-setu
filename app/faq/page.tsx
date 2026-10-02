import type { Metadata } from "next";
import { IconAlertTriangleFilled } from "@tabler/icons-react";
import { config, lines, phoneDisplay, t } from "@/lib/content";
import { answerOf, linkOf, visibleStages, whatsappLink } from "@/lib/faq";
import { Thread, type ThreadStage } from "@/components/faq/Thread";
import s from "./page.module.css";

const p = t.faqPage;

export const metadata: Metadata = {
  title: p.metaTitle,
  description: p.metaDescription,
};

// FAQ (D-041), "The thread": the family's questions as bubbles and Care Setu's replies beside a WhatsApp-style profile
// card, grouped by the family's stage. Answers only from approved claims; pending items are development only (D-029);
// a flow that is off in production answers with its closed text (INVARIANT 18).
export default function Page() {
  const stages: ThreadStage[] = visibleStages().map((st) => ({
    slug: st.slug,
    label: st.label,
    items: st.items.map((item) => ({
      slug: item.slug,
      q: item.q,
      answer: answerOf(item),
      lines:
        item.list === "services"
          ? lines.map((l) => ({ line: l.line, name: l.name, services: l.services.map((sv) => sv.name) }))
          : undefined,
      link: linkOf(item),
      wa: whatsappLink(item.q),
      pending: item.pending,
    })),
  }));

  return (
    <>
      <section className={`${s.opener} wrap`}>
        <div className={s.intro}>
          <h1 className="t-display">{p.title}</h1>
          <p className={s.lede}>{p.lede}</p>
        </div>
        <p className={`sos ${s.sos}`}>
          <IconAlertTriangleFilled aria-hidden="true" />
          <span>
            <b>{t.hero.emergencyTitle}</b>
            {t.hero.emergencyText}
          </span>
        </p>
      </section>

      <Thread
        stages={stages}
        phone={config.phone}
        phoneDisplay={phoneDisplay}
        whatsapp={config.phone.replace(/^\+/, "")}
      />
    </>
  );
}
