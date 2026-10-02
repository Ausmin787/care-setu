"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { IconAlertTriangleFilled, IconCircleArrowRightFilled } from "@tabler/icons-react";
import { t } from "@/lib/content";
import { NOTICE_VERSION } from "@/lib/privacy";
import { PartnerInput, type PartnerKind } from "@/server/contracts/partners";
import { Pending } from "@/components/about/Pending";
import { useAudience } from "./audience";
import s from "./PartnerForm.module.css";

const f = t.partnerPage.form;
const roles = t.partner.roles;

type Field = "kind" | "orgName" | "name" | "phone" | "email" | "message" | "consent";
type Errors = Partial<Record<Field, string>>;
const ORDER: Field[] = ["kind", "orgName", "name", "phone", "email", "message", "consent"];
const id = (field: Field) => `pf-${field}`;

// The partner form (D-038), one short page: partners are professionals filling five or six fields, so it stays a
// single page (Contact's one-question flow is for anxious families). It checks every field against the same zod
// contract the Partner API will use, then shows the confirmation marked as a sample. Nothing is sent or stored, and
// production never renders it (INVARIANT 31). "I'm writing as" follows the page's switch until the visitor picks.
export function PartnerForm({ initial }: { initial: PartnerKind }) {
  const chosen = useAudience(initial);
  const [picked, setPicked] = useState<PartnerKind | null>(null);
  const kind = picked ?? chosen;
  const [values, setValues] = useState({ orgName: "", name: "", phone: "", email: "", message: "", website: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const [done, setDone] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const errorList = ORDER.flatMap((field) => (errors[field] ? [[field, errors[field]] as const] : []));

  // Focus moves to the error summary after a failed send (GOV.UK), or to the confirmation after a good one.
  useEffect(() => {
    if (attempt === 0) return;
    (done ? doneRef.current : summaryRef.current)?.focus();
  }, [attempt, done]);

  const set = (patch: Partial<typeof values>) => setValues((v) => ({ ...v, ...patch }));

  function submit(event: FormEvent) {
    event.preventDefault();
    const blank = (v: string) => (v.trim() === "" ? null : v);
    const parsed = PartnerInput.safeParse({
      kind,
      orgName: kind === "professional" ? null : blank(values.orgName),
      name: values.name,
      phone: values.phone,
      email: blank(values.email),
      message: values.message,
      consent: consent || undefined,
      noticeVersion: NOTICE_VERSION,
      sourcePage: "/partner",
      website: values.website,
    });
    const next: Errors = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as Field;
        if (!ORDER.includes(field) || next[field]) continue;
        next[field] = field === "message" && values.message.length > 1000 ? f.errors.tooLong : f.errors[field];
      }
    }
    setErrors(next);
    setDone(parsed.success);
    setAttempt((n) => n + 1);
  }

  function reset() {
    setValues({ orgName: "", name: "", phone: "", email: "", message: "", website: "" });
    setConsent(false);
    setErrors({});
    setDone(false);
    setAttempt(0);
  }

  const describedBy = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;
  const error = (field: Field) =>
    errors[field] && (
      <p id={`${id(field)}-error`} className={s.error}>
        <IconAlertTriangleFilled aria-hidden="true" />
        <span>
          <span className="sr">Error: </span>
          {errors[field]}
        </span>
      </p>
    );

  if (done) {
    return (
      <div className={s.done}>
        <p className={s.sample}>{f.sample}</p>
        <h3 ref={doneRef} tabIndex={-1}>
          {f.done.title}
        </h3>
        <p className={s.next}>
          {f.done.next}
          <Pending on />
        </p>
        <button type="button" className={s.again} onClick={reset}>
          {f.done.again}
        </button>
      </div>
    );
  }

  return (
    <form className={s.form} noValidate onSubmit={submit}>
      {errorList.length > 0 && (
        <div ref={summaryRef} className={s.summary} role="alert" tabIndex={-1}>
          <h3>{f.errors.summary}</h3>
          <ul>
            {errorList.map(([field, message]) => (
              <li key={field}>
                <a
                  href={`#${id(field)}`}
                  onClick={(event) => {
                    event.preventDefault();
                    document.getElementById(id(field))?.focus();
                  }}
                >
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className={s.fieldset}>
        <legend className={s.label}>{f.kind}</legend>
        {error("kind")}
        <div className={s.options}>
          {roles.map((role, i) => (
            <label key={role.for} className={s.option} data-line={role.line}>
              <input
                id={i === 0 ? id("kind") : undefined}
                className={s.radio}
                type="radio"
                name="kind"
                value={role.for}
                checked={kind === role.for}
                onChange={() => setPicked(role.for as PartnerKind)}
              />
              <i aria-hidden="true" />
              {role.tab}
            </label>
          ))}
        </div>
      </fieldset>

      {kind !== "professional" && (
        <div className={s.field}>
          <label className={s.label} htmlFor={id("orgName")}>
            {f.org[kind]}
          </label>
          {error("orgName")}
          <input
            id={id("orgName")}
            name="organization"
            className={s.input}
            type="text"
            autoComplete="organization"
            maxLength={150}
            value={values.orgName}
            onChange={(event) => set({ orgName: event.target.value })}
            aria-invalid={Boolean(errors.orgName) || undefined}
            aria-describedby={describedBy(errors.orgName && `${id("orgName")}-error`)}
          />
        </div>
      )}

      <div className={s.pair}>
        <div className={s.field}>
          <label className={s.label} htmlFor={id("name")}>
            {f.name}
          </label>
          {error("name")}
          <input
            id={id("name")}
            name="name"
            className={s.input}
            type="text"
            autoComplete="name"
            maxLength={100}
            value={values.name}
            onChange={(event) => set({ name: event.target.value })}
            aria-invalid={Boolean(errors.name) || undefined}
            aria-describedby={describedBy(errors.name && `${id("name")}-error`)}
          />
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor={id("phone")}>
            {f.phone}
          </label>
          <p id="pf-phone-hint" className={s.hint}>
            {f.phoneHint}
          </p>
          {error("phone")}
          <input
            id={id("phone")}
            name="phone"
            className={s.input}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            maxLength={20}
            value={values.phone}
            onChange={(event) => set({ phone: event.target.value })}
            aria-invalid={Boolean(errors.phone) || undefined}
            aria-describedby={describedBy("pf-phone-hint", errors.phone && `${id("phone")}-error`)}
          />
        </div>
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor={id("email")}>
          {f.email}
        </label>
        {error("email")}
        <input
          id={id("email")}
          name="email"
          className={s.input}
          type="email"
          autoComplete="email"
          spellCheck={false}
          maxLength={254}
          value={values.email}
          onChange={(event) => set({ email: event.target.value })}
          aria-invalid={Boolean(errors.email) || undefined}
          aria-describedby={describedBy(errors.email && `${id("email")}-error`)}
        />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor={id("message")}>
          {f.message}
        </label>
        <p id="pf-message-hint" className={s.hint}>
          {f.messageHint}
        </p>
        {error("message")}
        <textarea
          id={id("message")}
          name="message"
          className={s.input}
          rows={5}
          maxLength={1000}
          value={values.message}
          onChange={(event) => set({ message: event.target.value })}
          aria-invalid={Boolean(errors.message) || undefined}
          aria-describedby={describedBy("pf-message-hint", errors.message && `${id("message")}-error`)}
        />
      </div>

      {/* Honeypot: off-screen, out of the tab order and the accessibility tree. */}
      <div className={s.hp} aria-hidden="true">
        <label htmlFor="pf-website">Website</label>
        <input
          id="pf-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => set({ website: event.target.value })}
        />
      </div>

      {error("consent")}
      <label className={s.consent}>
        <input
          id={id("consent")}
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          aria-invalid={Boolean(errors.consent) || undefined}
          aria-describedby={describedBy(errors.consent && `${id("consent")}-error`)}
        />
        <span>
          {f.consent} <Link href="/privacy">{f.consentLink}</Link>.
        </span>
      </label>

      <p className={s.sample}>{f.sample}</p>

      <button type="submit" className="btn">
        {f.send}
        <IconCircleArrowRightFilled aria-hidden="true" />
      </button>
    </form>
  );
}
