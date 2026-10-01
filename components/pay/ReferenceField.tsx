"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlertTriangleFilled, IconCircleArrowRightFilled } from "@tabler/icons-react";
import { t } from "@/lib/content";
import { QUOTE_PREFIX, QuoteReference } from "@/server/contracts/payments";
import s from "./ReferenceField.module.css";

const f = t.payPage.field;

// The quote reference as grouped boxes that are one field (Bencho one-time-code): a real input sits over eight drawn
// boxes, so paste, autofill, backspace and screen readers all behave as in any text field. "QT" is printed, not typed;
// pasting "QT 4K7M 9P2X" whole also works. Each character lands with a small swell.
export function ReferenceField() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  function change(raw: string) {
    const v = raw.toUpperCase().replace(/[\s-]/g, "");
    // A typed or pasted "QT" is the printed prefix, never part of the 8 (issued references never start with QT).
    setValue((v.startsWith(QUOTE_PREFIX) && v.length !== 8 ? v.slice(2) : v).slice(0, 8));
    setError(undefined);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = QuoteReference.safeParse(value);
    if (!parsed.success) {
      setError(value ? f.errorFormat : f.errorEmpty);
      return;
    }
    router.push(`/pay/${parsed.data}`);
  }

  return (
    <form className={s.form} onSubmit={submit} noValidate>
      <label className={s.label} htmlFor="quote-ref">
        {f.label}
      </label>
      <p className={s.hint} id="quote-ref-hint">
        {f.hint}
      </p>
      {error && (
        <p className={s.error} id="quote-ref-error">
          <IconAlertTriangleFilled aria-hidden="true" />
          {error}
        </p>
      )}
      <div className={s.field} data-invalid={error ? "" : undefined}>
        <span className={s.prefix} aria-hidden="true">
          {QUOTE_PREFIX}
        </span>
        <div className={s.boxes} aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className={s.box} data-now={i === Math.min(value.length, 7) ? "" : undefined}>
              {value[i] && (
                <b key={value[i]} className={s.char}>
                  {value[i]}
                </b>
              )}
            </span>
          ))}
        </div>
        <input
          id="quote-ref"
          className={s.input}
          value={value}
          onChange={(e) => change(e.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          inputMode="text"
          maxLength={14}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "quote-ref-hint quote-ref-error" : "quote-ref-hint"}
        />
      </div>
      <button className="btn" type="submit">
        {f.submit}
        <IconCircleArrowRightFilled aria-hidden="true" />
      </button>
    </form>
  );
}
