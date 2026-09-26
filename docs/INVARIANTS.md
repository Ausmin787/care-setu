# Invariants — the things that must never change silently

**Purpose.** This file is the objection engine. It is imported into every session so that a
request contradicting a settled decision gets **challenged before it gets built**, not after.

**How to use it.** If a request touches anything below, do not just comply. Say which invariant it
contradicts, name the decision that set it, and ask for an explicit override. An override is a new
`DECISIONS.md` entry written **first**, then the work happens.

**What this file is not.** Not the reasoning and not the full detail. Each line is a pointer; the
cited decision is the authority. Read it before acting on an edge case.

**Provenance rule.** Every numbered line cites a D-entry (checked by `docs-check.mjs`).

---

## Scope

1. **Phase 1 is the website only.** No mobile/patient/provider app work. (D-001)
2. **Every UI task follows the Frontend Master Blueprint**: read it, plan with its §13 template, sample ledger, frozen gate, Difference Test. The plan comes before the code. (D-009, D-016)
3. **Work in stages, with a check-in after each page.** Never sprint through several stages in one go. (D-011, D-016)

## Money and payments

4. **The client never sends a price.** Every amount is read server-side from a quote; payments are made against a quote reference. (D-004)
5. **Money is integer paise in code and `bigint`/`numeric` in the database, never float.** Business dates use `Asia/Kolkata`. (D-004)
6. **The gateway is sandbox-only until LLP + KYC, and not locked to one provider**: all calls go through the `PaymentProvider` adapter. Live keys never exist in dev. (D-003)
7. **Payment status comes only from a signature-verified gateway callback/webhook**, never from the browser redirect alone. Webhook handling is idempotent. (D-003, D-004)
8. **The revenue split is never a constant** in code, copy or tests. It is configuration, and provisional. (D-005)

## Data, privacy and security

9. **Patient/visitor personal data never goes to Jev or any third-party AI service.** (D-010)
10. **Every input is validated with a zod schema at the API boundary; SQL only through Drizzle/parameterized queries.** (D-006, D-016)
11. **No personal data in logs** (names, phones, emails, query text, payment identifiers beyond the internal id). (D-006, D-016)
12. **The contact form does not submit without explicit, unticked-by-default consent** tied to a versioned privacy notice, and the consent record is stored with the query. (D-012)
13. **Secrets live only in `.env.local` / the environment's secret store.** Never printed, never committed, never read by the agent. (D-002, D-015)
14. **Schema changes ship only as migration files.** No `db push`/`drizzle-kit push`. (D-002)

## Content and trust

15. **Nothing factual ships unless its row in `docs/CLAIMS.md` is `approved`**: stats, certifications, partner names/logos, testimonials, "trusted by", contact details, domain, photos. (D-007)
16. **AI-generated images are never presented as real staff, patients or premises.** Only photos with recorded provenance and consent. (D-007)
17. **Legal pages carry a visible DRAFT marker until a lawyer/CA signs off** (recorded as a D-entry). (D-012)
18. **No control that doesn't work and no invented number.** If the business can't do it yet, the page doesn't offer it. (D-007, D-016)
19. **Translations are human-written or human-reviewed.** Copy lives in message files. (D-008)
20. **Canonical logo = the supplied mark as a hand-built SVG**, colours provisional until owner-confirmed. (D-014)

## Platform and process

21. **Vendor-neutral: Drizzle over plain Postgres, PGlite in dev.** No vendor-only feature as the sole access control. (D-002)
22. **Nothing is hosted until the owners choose; Vercel Hobby is never used.** (D-002)
23. **Git commit, push, repo creation and deploy need Sasanka's explicit permission, every time.** (D-015)
24. **Agent reports are evidence, not truth.** Spot-check load-bearing claims. Platform and legal claims need a current primary-source citation. (D-016)
25. **Open owner questions are never answered by a default.** Build behind configuration and keep the question open. (D-016)
26. **"Green" means build + lint + typecheck + tests all pass.** Lint and tsc don't parse CSS. (D-016)
27. **The design direction is "Setu Lines"** (`DESIGN.md`): line colours only on lines/stations/badges (plus small accents inside the one hero illustration and the moving fill of the footer wordmark), lime always ink-cased, one coloured control (`#0D7CB1`), Anek type, enquiry = one question per page with an emergency note. The Home hero is the illustrated care scene, light mode only, and the signature motion is the "live trip". Changing any of this needs a new D-entry. (D-020, D-021, D-023)

---

## Open — do NOT treat these as decided

- **Hosting, database host, email provider, and account ownership** — owners (Q1). (D-002)
- **Domain** — is `caresetu.com` owned? Until confirmed, no domain appears in copy (Q2). (D-007)
- **Who receives new-query alerts** (the rest of Q12 was answered in D-024: 2-hour callback, 7 AM – 10 PM). (D-006, D-024)
- **Logo reconstruction + exact brand hexes + brand fonts** — owner confirmation (Q4). (D-014)
- **Legal entity (LLP) status** — gates gateway KYC, footer legal name, copyright holder (Q5). (D-003)
- **Quote/payment policy**: advance vs full, refunds, cancellations (Q8). (D-004, D-012)
- **Promotion rules** (Q9). (D-013)
- **Evidence for any deck claim** (Q10). (D-007)
- **Revenue split** — provisional ~80/20, founders + CA. (D-005)
- **Data retention periods and grievance officer** (Q13). (D-012)
- **Payment gateway choice for go-live**. (D-003)
- **Code-graph memory (gbrain)** — trial at Stage 3/4, code navigation only, after the privacy check on embeddings and a 10-question measured test. Never for decisions. (D-019)
