---
paths:
  - "app/api/**"
  - "server/**"
  - "lib/**"
  - "drizzle/**"
  - "**/*.sql"
---
# API and data rules (Care Setu)

- **Every input is parsed with a zod schema** from `server/contracts/` before use; enforce length
  limits and types; reject unknown keys.
- **SQL only through Drizzle** (parameterized). No string-built SQL, no `sql.raw` with user input.
- **Schema changes = migration files** (`drizzle-kit generate` → review → migrate). Never `push` (D-002).
- **Money:** integer paise (`bigint`), never float; amounts come from the server-side quote, never
  from the client (D-004). No literal revenue-split values (D-005).
- **Payments:** order creation carries an idempotency key; status changes only from
  signature-verified gateway events (verify on the raw body); webhook handling is idempotent on the
  provider event id; the return URL shows status read from the DB (INVARIANT 7).
- **Consent:** a query or partner enquiry is stored with its consent row in the same transaction;
  no consent → 422 (INVARIANT 12).
- **Personal data:** never in logs, error messages, analytics, URLs or any third-party AI
  (D-010). Log internal ids only.
- **Admin handlers:** check the session and role server-side on every request; write an
  `audit_log` row for views and changes of personal data; `Cache-Control: no-store`.
- **Adapters:** the domain depends on `PaymentProvider` / `EmailTransport` interfaces, never on a
  vendor SDK directly (D-002, D-003).
- **Time:** store `timestamptz`; business dates in `Asia/Kolkata`; never render raw `Date.now()` during SSR.
