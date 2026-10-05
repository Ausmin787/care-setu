# Care Setu — Technical Requirements (Phase 1)

**Version:** v0.1 · 2026-09-23 · Sections are appended, never renumbered.
System shape lives in `ARCHITECTURE.md`. This file holds the specs. **Grep it, don't bulk-read it.**
Anything marked *(verify at Stage 3)* must be checked against current official docs (context7 or
vendor docs) before it is relied on (INVARIANT 24).

## 1. Stack (proposed; locked at Stage 3 by a D-entry)
| Concern | Choice | Why | Note |
|---|---|---|---|
| Framework | Next.js (App Router) + React + TypeScript strict | SSR/SEO, brief's suggestion, Blueprint §5.1 | exact versions pinned at scaffold *(verify)* |
| Styling | Tailwind CSS v4 + semantic token layer | Blueprint §4 | tokens from DESIGN.md (Stage 2) |
| DB access | Drizzle ORM 0.45 + drizzle-kit 0.31 migrations | Plain Postgres, portable (D-002) | locked D-033; `pg` driver when `DATABASE_URL` is set |
| Dev DB | PGlite (in-process Postgres, file-backed in `.pglite/`) | No Docker (D-002) | `drizzle-orm/pglite` + migrator, verified D-033 (Drizzle docs + installed d.ts) |
| Validation | zod | One schema for server and API clients | |
| Staff auth | Candidate: Better Auth or Auth.js with DB sessions + roles | Portable, not tied to a DB vendor | choose at Stage 3 with a D-entry *(verify)* |
| Payments | `PaymentProvider` adapter; Razorpay sandbox first | D-003 | Checkout + Orders API + webhook signature *(verify)* |
| Email | `EmailTransport` adapter; console in dev | D-006 | provider chosen with Q1 |
| Tests | Vitest (unit/contract), Playwright for e2e at Stage 4 | HA pattern | |
| Lint | ESLint (next core-web-vitals + typescript) | HA pattern | configs protected by hook |
| CI | GitHub Actions: install, lint, typecheck, test, build | Missing in HA; churn lesson: clean code first | file added D-033; runs once a remote exists (D-015) |

## 2. Data model (`queries` and `consents` built in migration 0001, D-033; the rest is draft)
All tables have `id` (uuid), `created_at`, `updated_at` (timestamptz). Money is integer paise
(`bigint`). Business dates are `Asia/Kolkata`.
| Table | Key columns | Notes |
|---|---|---|
| `service_lines` | slug, name, status (`live`/`coming_soon`/`hidden`) | seeded from `content/`; live set pending Q6 |
| `queries` | reference (10 chars, unique), patient_location (`hospital`/`home`/`not_sure`), service_slug? (null = not sure), area (`noida`/`delhi`/`other`), message, name, phone (+91XXXXXXXXXX), email?, status (`new`/`contacted`/`quoted`/`closed`/`spam`), source_page | built (D-033); personal data: see §5 |
| `consents` | query_id (partner_enquiry_id later), notice_version, purpose, granted_at | INVARIANT 12; built (D-033) without IP or user-agent hashes (data minimisation) |
| `partner_enquiries` | org_name, contact_name, phone, email, kind, message, status | |
| `providers` | display_name, kind, active | payouts manual (D-005) |
| `quotes` | reference (unique, non-guessable), query_id, service_slug, provider_id?, amount_paise, currency `INR`, platform_share_bps (config snapshot, D-005), promo_code?, discount_paise, expires_at, status (`draft`/`sent`/`paid`/`expired`/`cancelled`) | amount is server truth (D-004) |
| `payments` | quote_id, provider (`razorpay`/…), provider_order_id (unique), provider_payment_id?, amount_paise, status (`created`/`authorized`/`captured`/`failed`/`refunded`), idempotency_key (unique) | |
| `payment_events` | payment_id?, provider_event_id (unique), type, payload_hash, received_at, signature_ok | idempotent webhook log; raw payload not stored if it holds PII |
| `promotions` | code, rules (jsonb, validated), active window, enabled | math waits for Q9 |
| `admin_users` + sessions | email, role (`admin`/`coordinator`), active | via chosen auth lib |
| `audit_log` | actor_id, action, entity, entity_id, at | who viewed/changed what (observability) |
| `app_settings` | key, value (jsonb) | e.g. platform share default, banner text |

## 3. API catalogue v1 (draft)
| Method + path | Auth | Purpose |
|---|---|---|
| `POST /api/v1/queries` | public, rate-limited | create query + consent |
| `POST /api/v1/partner-enquiries` | public, rate-limited | partner form |
| `GET /api/v1/quotes/{reference}` | public (reference = capability) | minimal quote summary for payment |
| `POST /api/v1/payments/{reference}/order` | public | create gateway order, server-side amount, idempotency key |
| `POST /api/v1/payments/webhook` | gateway signature | verify, record event, update status |
| `GET /api/v1/admin/queries`, `PATCH …/{id}` | staff | list/update |
| `POST /api/v1/admin/quotes` | staff | create quote |
| `GET /api/v1/admin/payments` | staff | list transactions |
Every request body and response is a zod schema in `server/contracts/` (shared).

## 4. Security requirements
- HTTPS only; HSTS; CSP (script-src self + gateway checkout origin only); `X-Frame-Options: DENY`
  except where the gateway checkout needs it *(verify)*; `Referrer-Policy: strict-origin-when-cross-origin`;
  `Permissions-Policy` minimal. Asserted by a test (HA pattern: `security-headers.test.ts`).
- zod validation + length limits on every input; output encoding by React; no `dangerouslySetInnerHTML`.
- Parameterized SQL only (Drizzle); no string-built SQL.
- Rate limiting + honeypot on public forms; no CAPTCHA that ships personal data to a third party
  without it being in the privacy notice.
- Quote references: ≥ 10 chars from a non-ambiguous alphabet, generated server-side, expiring.
- Webhook: verify signature with raw body before parsing; reject on mismatch; idempotent on
  `provider_event_id`.
- Admin: `noindex`, `Cache-Control: no-store`, role checks server-side on every handler, session
  expiry, audit log.
- Secrets only from env; `.env*` unreadable by the agent (settings deny), never committed (hook).
- Dependency hygiene: `npm audit --omit=dev` at each stage end; never `audit fix --force` (HA
  D-039: it tried to downgrade Next to 9).

## 5. Privacy engineering (DPDP-oriented; legal review pending, D-012)
- Collect the minimum: where the patient is, service (or "not sure"), area, message, name and phone are asked; email is optional (D-033). The IP address is held in memory only, for the rate limit.
- Consent: explicit, specific, unticked checkbox; stored with notice version and timestamp.
- Purpose limitation: data is used only to respond and deliver care; no marketing use without a
  separate opt-in.
- Retention: configurable per table, defaults set after Q13. A scheduled purge job at Stage 5.
- No personal data in logs, analytics or error reports. Any analytics provider must be
  cookie-less or behind consent.
- Personal data never goes to third-party AI (D-010).
- Health information in free-text messages is the most sensitive field. Access is admin-only and
  audited.

## 6. Testing and verification plan
| Suite | Asserts |
|---|---|
| `claims.test.ts` | copy in `content/` contains no pending/rejected claim and no risky pattern (ISO, HIPAA, "trusted by", "+91 123", AIIMS/Apollo/… names) without an approved CLAIMS row |
| `security-headers.test.ts` | exact header values in production config |
| `contracts.test.ts` | every API schema rejects bad input (lengths, types, missing consent) |
| `money.test.ts` | paise arithmetic, no floats, discount never below zero |
| `payments.test.ts` | server-side amount, idempotent order creation, webhook signature pass/fail, duplicate event no-op, status only from verified events |
| `consent.test.ts` | query without consent is rejected; consent row written in the same transaction |
| `split.test.ts` | no hardcoded 1600/400/80/20 literals in `server/` (D-005) |
| e2e (Playwright, Stage 4) | form submit, pay flow in sandbox, admin login and lists, 360/768/1024/1440 no horizontal overflow |
**"Green"** = `npm run green`: lint, typecheck, `npm test`, `npm run unused` (knip), `npm run build`, then `npm run test:e2e` (Playwright + axe against the build and `next dev`) (INVARIANT 26, D-049).
