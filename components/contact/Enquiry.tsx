"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  IconAlertTriangleFilled,
  IconArrowLeft,
  IconCircleArrowRightFilled,
  IconLoader2,
  IconPhoneFilled,
} from "@tabler/icons-react";
import { config, lines, phoneDisplay, t, type Line } from "@/lib/content";
import { NOTICE_VERSION } from "@/lib/privacy";
import { AREAS, PATIENT_LOCATIONS } from "@/server/contracts/enums";
import { QueryCreated, QueryInput } from "@/server/contracts/queries";
import { CallStatus } from "@/components/home/CallStatus";
import { Route, type RouteStop } from "./Route";
import s from "./Enquiry.module.css";

// The enquiry (D-033, PRD 4.1): one question per page in Elder's order (INVARIANT 27), GOV.UK question, check-answers
// and confirmation patterns, posting to POST /api/v1/queries. The step lives in the URL so Back and Forward work.
const e = t.enquiry;
const QUESTIONS = ["location", "service", "area", "needs", "you"] as const;
type Question = (typeof QUESTIONS)[number];
type Step = Question | "check" | "done";
const STEPS: Step[] = [...QUESTIONS, "check", "done"];
const NOT_SURE = "not-sure";

type Answers = {
  patientLocation?: (typeof PATIENT_LOCATIONS)[number];
  // undefined = not answered yet; null = "not sure yet".
  service?: string | null;
  area?: (typeof AREAS)[number];
  message: string;
  name: string;
  phone: string;
  email: string;
};
type Errors = Record<string, string>;

const services = lines.flatMap((line) => line.services.map((service) => ({ ...service, line: line.line })));

// Where a field rejected by the API is answered, and what to tell the family.
const FIELD: Record<string, [Step, string, string]> = {
  patientLocation: ["location", "q-location", e.location.error],
  service: ["service", "q-service", e.service.error],
  area: ["area", "q-area", e.area.error],
  message: ["needs", "q-needs", e.needs.error],
  name: ["you", "q-name", e.you.errors.name],
  phone: ["you", "q-phone", e.you.errors.phone],
  email: ["you", "q-email", e.you.errors.email],
  consent: ["check", "q-consent", e.check.consentError],
};

function validate(step: Step, a: Answers, consent: boolean): Errors {
  const out: Errors = {};
  if (step === "location" && !a.patientLocation) out["q-location"] = e.location.error;
  if (step === "service" && a.service === undefined) out["q-service"] = e.service.error;
  if (step === "area" && !a.area) out["q-area"] = e.area.error;
  if (step === "needs") {
    const message = a.message.trim();
    if (!message) out["q-needs"] = e.needs.error;
    else if (message.length > 1000) out["q-needs"] = e.needs.tooLong;
  }
  if (step === "you") {
    if (!a.name.trim()) out["q-name"] = e.you.errors.name;
    if (!QueryInput.shape.phone.safeParse(a.phone).success) out["q-phone"] = e.you.errors.phone;
    if (a.email.trim() && !QueryInput.shape.email.safeParse(a.email.trim()).success) out["q-email"] = e.you.errors.email;
  }
  if (step === "check" && !consent) out["q-consent"] = e.check.consentError;
  return out;
}

function answerOf(q: Question, a: Answers): string | undefined {
  if (q === "location") return a.patientLocation && e.location.options[a.patientLocation];
  if (q === "service") {
    if (a.service === undefined) return undefined;
    return services.find((x) => x.slug === a.service)?.name ?? e.service.notSure;
  }
  if (q === "area") return a.area && e.area.options[a.area];
  if (q === "needs") return a.message.trim() ? e.route.needsDone : undefined;
  return a.name.trim() && a.phone.trim() ? a.name.trim() : undefined;
}

const describedBy = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;

function Option(props: {
  name: string;
  value: string;
  checked: boolean;
  onPick: () => void;
  id?: string;
  line?: Line;
  children: ReactNode;
}) {
  return (
    <label className={s.option} data-line={props.line}>
      <input
        className={s.radio}
        type="radio"
        id={props.id}
        name={props.name}
        value={props.value}
        checked={props.checked}
        onChange={props.onPick}
      />
      <span>{props.children}</span>
    </label>
  );
}

function FieldError({ id, errors }: { id: string; errors: Errors }) {
  return errors[id] ? (
    <p id={`${id}-error`} className={s.error}>
      <IconAlertTriangleFilled aria-hidden="true" />
      {errors[id]}
    </p>
  ) : null;
}

export function Enquiry({ initialService }: { initialService?: string }) {
  const [answers, setAnswers] = useState<Answers>({
    service: initialService,
    message: "",
    name: "",
    phone: "",
    email: "",
  });
  const [step, setStep] = useState<Step>("location");
  // null on first render: nothing animates or takes focus until the family moves.
  const [dir, setDir] = useState<"fwd" | "back" | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [returnToCheck, setReturnToCheck] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const stepRef = useRef<Step>("location");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const at = STEPS.indexOf(step);
  const set = (patch: Partial<Answers>) => setAnswers((a) => ({ ...a, ...patch }));

  function go(next: Step, how: "push" | "replace" = "push") {
    setDir(STEPS.indexOf(next) >= STEPS.indexOf(stepRef.current) ? "fwd" : "back");
    stepRef.current = next;
    setStep(next);
    setErrors({});
    const url = new URL(window.location.href);
    url.searchParams.set("step", next);
    window.history[how === "push" ? "pushState" : "replaceState"]({ ...window.history.state, enquiryStep: next }, "", url);
  }

  // A reload starts again at question 1 (answers live only in this page), so the URL is reset to match.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("step")) return;
    url.searchParams.delete("step");
    window.history.replaceState({ ...window.history.state, enquiryStep: "location" }, "", url);
  }, []);

  // Browser Back and Forward move between questions; once sent, the confirmation stays.
  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      if (stepRef.current === "done") return;
      const wanted = event.state?.enquiryStep as Step | undefined;
      const next: Step = wanted && wanted !== "done" && STEPS.includes(wanted) ? wanted : "location";
      setDir(STEPS.indexOf(next) >= STEPS.indexOf(stepRef.current) ? "fwd" : "back");
      stepRef.current = next;
      setStep(next);
      setErrors({});
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Leaving part-way loses the answers (they live only in this page), so the browser asks first (Web Interface
  // Guidelines: warn before navigation with unsaved changes).
  const unsent = step !== "done" && Boolean(answers.patientLocation || answers.message || answers.name || answers.phone);
  useEffect(() => {
    if (!unsent) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsent]);

  // Focus follows the family: the new question's heading after a move, the error summary after a failed Continue.
  useEffect(() => {
    if (dir) headingRef.current?.focus();
  }, [step, dir]);
  useEffect(() => {
    if (Object.keys(errors).length) summaryRef.current?.focus();
  }, [errors]);

  async function send() {
    const payload = {
      patientLocation: answers.patientLocation,
      service: answers.service ?? null,
      area: answers.area,
      message: answers.message,
      name: answers.name,
      phone: answers.phone,
      email: answers.email.trim() || null,
      consent,
      noticeVersion: NOTICE_VERSION,
      sourcePage: "/contact",
      website: honeypotRef.current?.value ?? "",
    };
    setSending(true);
    setFailure(null);
    try {
      const res = await fetch("/api/v1/queries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 201) {
        setReference(QueryCreated.parse(await res.json()).reference);
        go("done", "replace");
        return;
      }
      if (res.status === 422) {
        const fields: string[] = (await res.json()).fields ?? [];
        const known = fields.map((f) => FIELD[f]).find(Boolean);
        if (known) {
          const [where, id, message] = known;
          go(where);
          setErrors({ [id]: message });
          return;
        }
        setFailure(e.errors.invalid);
        return;
      }
      setFailure(
        res.status === 429 ? e.errors.rateLimited : res.status === 404 ? e.errors.unavailable : e.errors.network
      );
    } catch {
      setFailure(e.errors.network);
    } finally {
      setSending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (sending) return;
    const found = validate(step, answers, consent);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    if (step === "check") {
      void send();
      return;
    }
    if (returnToCheck) {
      setReturnToCheck(false);
      go("check");
      return;
    }
    go(STEPS[at + 1]);
  }

  function change(q: Question) {
    setReturnToCheck(true);
    go(q);
  }

  const stops: RouteStop[] = QUESTIONS.map((q, i) => {
    const value = answerOf(q, answers);
    const service = q === "service" ? services.find((x) => x.slug === answers.service) : undefined;
    return {
      key: q,
      label: e.route[q],
      value,
      line: service?.line,
      state: i === at ? "current" : value || at > i ? "done" : "next",
    };
  });

  const errorList = Object.entries(errors);
  const heading = (text: string) => (
    <h3 className={s.question} ref={headingRef} tabIndex={-1}>
      {text}
    </h3>
  );
  const why = (id: string, text: string) => (
    <p id={id} className={s.why}>
      {text}
    </p>
  );
  const formattedRef = reference && `${reference.slice(0, 5)} ${reference.slice(5)}`;

  return (
    <section id="enquiry" className={`${s.enquiry} wrap`} aria-labelledby="enquiry-title">
      <header className={s.head}>
        <h2 id="enquiry-title" className="t-head">
          {e.title}
        </h2>
        <p>{e.intro}</p>
      </header>

      <div className={s.grid}>
        <Route stops={stops} arrived={step === "done"} />

        <div className={s.flow}>
          <div key={step} className={s.step} data-dir={dir ?? undefined}>
            {step !== "done" && (
              <div className={s.meta}>
                {at > 0 && (
                  <button type="button" className={s.back} onClick={() => go(STEPS[at - 1])}>
                    <IconArrowLeft aria-hidden="true" />
                    {e.back}
                  </button>
                )}
                {at < QUESTIONS.length && <p className={s.progress}>{e.progress.replace("{n}", String(at + 1))}</p>}
              </div>
            )}

            {errorList.length > 0 && (
              <div ref={summaryRef} className={s.summary} role="alert" tabIndex={-1}>
                <h4>{e.errors.summary}</h4>
                <ul>
                  {errorList.map(([id, message]) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        onClick={(event) => {
                          event.preventDefault();
                          document.getElementById(id)?.focus();
                        }}
                      >
                        {message}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step === "done" ? (
              <div className={s.done}>
                <h3 className={s.question} ref={headingRef} tabIndex={-1}>
                  {e.done.title}
                </h3>
                <p className={s.refLabel}>{e.done.refLabel}</p>
                <p className={s.ref}>{formattedRef}</p>
                <p className={s.why}>{e.done.refNote}</p>
                <h4 className={s.nextTitle}>{e.done.nextTitle}</h4>
                <ol className={s.next}>
                  <li>
                    <b>{e.done.next1}</b> {t.servicesPage.promise.text}
                    <CallStatus className={s.status} dotClassName={s.dot} />
                  </li>
                  <li>
                    <b>{e.done.next2}</b>
                  </li>
                </ol>
                {config.phone && (
                  <p className={s.sooner}>
                    {e.done.sooner}{" "}
                    <a href={`tel:${config.phone}`}>
                      <IconPhoneFilled aria-hidden="true" />
                      {phoneDisplay}
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <form className={s.form} noValidate onSubmit={onSubmit}>
                {step === "location" && (
                  <fieldset aria-describedby={describedBy("why-location", errors["q-location"] && "q-location-error")}>
                    <legend>{heading(e.location.question)}</legend>
                    {why("why-location", e.location.why)}
                    <FieldError id="q-location" errors={errors} />
                    <div className={s.options}>
                      {PATIENT_LOCATIONS.map((value, i) => (
                        <Option
                          key={value}
                          id={i === 0 ? "q-location" : undefined}
                          name="patientLocation"
                          value={value}
                          checked={answers.patientLocation === value}
                          onPick={() => set({ patientLocation: value })}
                        >
                          {e.location.options[value]}
                        </Option>
                      ))}
                    </div>
                  </fieldset>
                )}

                {step === "service" && (
                  <fieldset aria-describedby={describedBy("why-service", errors["q-service"] && "q-service-error")}>
                    <legend>{heading(e.service.question)}</legend>
                    {why("why-service", e.service.why)}
                    <FieldError id="q-service" errors={errors} />
                    {lines.map((line, li) => (
                      <div key={line.slug} className={s.group} role="group" aria-labelledby={`group-${line.slug}`}>
                        <p id={`group-${line.slug}`} className={s.groupName} data-line={line.line}>
                          <i aria-hidden="true" />
                          {line.name}
                        </p>
                        <div className={`${s.options} ${s.two}`}>
                          {line.services.map((service, si) => (
                            <Option
                              key={service.slug}
                              id={li === 0 && si === 0 ? "q-service" : undefined}
                              name="service"
                              value={service.slug}
                              line={line.line}
                              checked={answers.service === service.slug}
                              onPick={() => set({ service: service.slug })}
                            >
                              {service.name}
                            </Option>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className={s.options}>
                      <Option
                        name="service"
                        value={NOT_SURE}
                        checked={answers.service === null}
                        onPick={() => set({ service: null })}
                      >
                        {e.service.notSure}
                      </Option>
                    </div>
                  </fieldset>
                )}

                {step === "area" && (
                  <fieldset
                    aria-describedby={describedBy(
                      "why-area",
                      answers.area === "other" && "area-note",
                      errors["q-area"] && "q-area-error"
                    )}
                  >
                    <legend>{heading(e.area.question)}</legend>
                    {why("why-area", e.area.why)}
                    <FieldError id="q-area" errors={errors} />
                    <div className={s.options}>
                      {AREAS.map((value, i) => (
                        <Option
                          key={value}
                          id={i === 0 ? "q-area" : undefined}
                          name="area"
                          value={value}
                          checked={answers.area === value}
                          onPick={() => set({ area: value })}
                        >
                          {e.area.options[value]}
                        </Option>
                      ))}
                    </div>
                    <p id="area-note" className={s.note} aria-live="polite">
                      {answers.area === "other" ? e.area.otherNote : ""}
                    </p>
                  </fieldset>
                )}

                {step === "needs" && (
                  <div className={s.field}>
                    <h3 className={s.question} ref={headingRef} tabIndex={-1}>
                      <label htmlFor="q-needs">{e.needs.question}</label>
                    </h3>
                    {why("why-needs", e.needs.why)}
                    <p id="needs-privacy" className={s.privacy}>
                      {e.needs.privacy}
                    </p>
                    <FieldError id="q-needs" errors={errors} />
                    <textarea
                      id="q-needs"
                      name="message"
                      autoComplete="off"
                      className={s.input}
                      rows={6}
                      maxLength={1000}
                      value={answers.message}
                      onChange={(event) => set({ message: event.target.value })}
                      aria-invalid={Boolean(errors["q-needs"]) || undefined}
                      aria-describedby={describedBy(
                        "why-needs",
                        "needs-privacy",
                        errors["q-needs"] && "q-needs-error"
                      )}
                    />
                  </div>
                )}

                {step === "you" && (
                  <div className={s.field}>
                    {heading(e.you.question)}
                    {why("why-you", e.you.why)}
                    <label className={s.label} htmlFor="q-name">
                      {e.you.name}
                    </label>
                    <FieldError id="q-name" errors={errors} />
                    <input
                      id="q-name"
                      name="name"
                      className={s.input}
                      type="text"
                      autoComplete="name"
                      maxLength={100}
                      value={answers.name}
                      onChange={(event) => set({ name: event.target.value })}
                      aria-invalid={Boolean(errors["q-name"]) || undefined}
                      aria-describedby={describedBy(errors["q-name"] && "q-name-error")}
                    />
                    <label className={s.label} htmlFor="q-phone">
                      {e.you.phone}
                    </label>
                    <p id="phone-hint" className={s.hint}>
                      {e.you.phoneHint}
                    </p>
                    <FieldError id="q-phone" errors={errors} />
                    <input
                      id="q-phone"
                      name="phone"
                      className={`${s.input} ${s.short}`}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      maxLength={20}
                      value={answers.phone}
                      onChange={(event) => set({ phone: event.target.value })}
                      aria-invalid={Boolean(errors["q-phone"]) || undefined}
                      aria-describedby={describedBy("phone-hint", errors["q-phone"] && "q-phone-error")}
                    />
                    <label className={s.label} htmlFor="q-email">
                      {e.you.email}
                    </label>
                    <FieldError id="q-email" errors={errors} />
                    <input
                      id="q-email"
                      name="email"
                      className={s.input}
                      type="email"
                      autoComplete="email"
                      spellCheck={false}
                      maxLength={254}
                      value={answers.email}
                      onChange={(event) => set({ email: event.target.value })}
                      aria-invalid={Boolean(errors["q-email"]) || undefined}
                      aria-describedby={describedBy(errors["q-email"] && "q-email-error")}
                    />
                  </div>
                )}

                {step === "check" && (
                  <div className={s.field}>
                    {heading(e.check.title)}
                    <dl className={s.answers}>
                      {(
                        [
                          ["location", "location", answerOf("location", answers)],
                          ["service", "service", answerOf("service", answers)],
                          ["area", "area", answerOf("area", answers)],
                          ["needs", "needs", answers.message.trim()],
                          ["name", "you", answers.name.trim()],
                          ["phone", "you", answers.phone.trim()],
                          ["email", "you", answers.email.trim() || e.check.notProvided],
                        ] as const
                      ).map(([key, q, value]) => (
                        <div key={key} className={s.answer}>
                          <dt>{e.check.labels[key]}</dt>
                          <dd>{value}</dd>
                          <dd>
                            <button type="button" className={s.change} onClick={() => change(q)}>
                              {e.change}
                              <span className="sr"> {e.check.labels[key].toLowerCase()}</span>
                            </button>
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <FieldError id="q-consent" errors={errors} />
                    <label className={s.consent}>
                      <input
                        id="q-consent"
                        type="checkbox"
                        checked={consent}
                        onChange={(event) => setConsent(event.target.checked)}
                        aria-invalid={Boolean(errors["q-consent"]) || undefined}
                        aria-describedby={describedBy(errors["q-consent"] && "q-consent-error")}
                      />
                      <span>
                        {e.check.consent}{" "}
                        <a href="/privacy" target="_blank" rel="noopener">
                          {e.check.consentLink}
                        </a>
                        .
                      </span>
                    </label>
                  </div>
                )}

                {/* Honeypot (TRD §4): hidden from people and assistive tech; bots fill it and the API refuses them. */}
                <div className={s.hp} aria-hidden="true">
                  <label>
                    Website
                    <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                {failure && (
                  <p className={s.failure} role="alert">
                    <IconAlertTriangleFilled aria-hidden="true" />
                    <span>
                      {failure}{" "}
                      {config.phone && <a href={`tel:${config.phone}`}>{phoneDisplay}</a>}
                    </span>
                  </p>
                )}

                <div className={s.actions}>
                  <button className="btn" type="submit" aria-disabled={sending || undefined}>
                    {step === "check" ? (sending ? e.check.sending : e.check.send) : e.continue}
                    {sending ? (
                      <IconLoader2 className={s.spin} aria-hidden="true" />
                    ) : (
                      <IconCircleArrowRightFilled aria-hidden="true" />
                    )}
                  </button>
                  <p className="sr" aria-live="polite">
                    {sending ? e.check.sending : ""}
                  </p>
                </div>
              </form>
            )}

            <p className={`sos ${s.sos}`}>
              <IconAlertTriangleFilled aria-hidden="true" />
              <span>
                <b>{t.hero.emergencyTitle}</b>
                {t.hero.emergencyText}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
