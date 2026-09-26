# Care Setu — Product Requirements (Phase 1 website)

**Version:** v0.1 · 2026-09-23 · **Status:** draft, pending owner answers (see `OWNER-QUESTIONS.md`)
**Sources:** kickoff brief (21 Sep 2026), founders' vision deck (40 pp.), planning session D-001..D-016.
Sections are appended, never renumbered.

## 1. Background
Care Setu ("setu" = bridge) is a home-healthcare startup in Delhi NCR. Its thesis, from the deck:
Indian healthcare is strong inside hospitals, but after discharge families struggle alone to find
and coordinate trustworthy nurses, attendants, physiotherapy, equipment, diagnostics and medicines.
Care Setu wants to be the single trusted bridge from hospital to home.
Founders: Vishwanath Pratap Singh ("Shiva") and Saurabh Chauhan, a doctor (D-024). Co-founders: Ayush Srivastava (technology),
Aashish Singh (strategy, partnerships, growth). Tech lead for the website: Sasanka.
Business model (provisional, D-005): the patient pays for a service, the provider receives the
majority, and Care Setu keeps a platform share. The split is not yet confirmed.

## 2. Goals and non-goals
**Goals (Phase 1)**
1. Explain what Care Setu is and does, clearly enough that a worried family member trusts it
   enough to get in touch.
2. Capture patient/family queries with consent, store them safely, and alert the team (D-006).
3. Let a patient pay a quoted amount online and give the team a complete transaction record
   (D-003, D-004).
4. Present each service line honestly: only what can actually be delivered, with no unproven claims (D-007).
5. Build a foundation (API, schema, auth) the future apps can reuse (D-001, D-006).

**Non-goals (Phase 1)**
- Patient or provider apps, provider logins, provider payouts UI (D-001, D-005).
- Online booking/scheduling, teleconsultation, e-pharmacy ordering, EMI financing.
- Public price lists (D-004). User accounts for patients.
- Multiple languages at launch (D-008; the structure is ready for them).

## 3. Users and personas
| Persona | Situation | What they need from the site |
|---|---|---|
| **Family member, remote** | Son/daughter in another city or abroad; parent just discharged in NCR | Fast reassurance that Care Setu is real and reliable; one call or form; can pay from afar |
| **Family member, local caregiver** | Exhausted, arranging nurse + equipment + tests separately | One point of contact; clear list of what's covered; how it works |
| **Patient (often elderly)** | Recovering at home, may use a phone with large text | Legible, simple, phone number visible, no dark patterns |
| **Referral partner** | Hospital discharge desk, doctor, clinic | Partner with us enquiry; credibility |
| **Care Setu staff** | Coordinator handling calls | `/admin`: queries and payments in one list, status, audit trail |

## 4. Core flows
**4.1 Query.** Visitor opens Contact (or a service page CTA) → name, phone, optional email, service
(pre-selected from the page), city/area, message → explicit consent checkbox linked to the privacy
notice (unticked by default) → submit → server validates, stores the query + consent record →
email alert to the team → confirmation screen showing what happens next (no invented SLA; Q12).

**4.2 Quote → payment (D-004).** Staff create a quote in `/admin` (linked to the query: service,
provider (optional), amount in paise, expiry) → the system generates a reference and a pay link →
staff send the link by phone or WhatsApp → patient opens Payments, sees quote summary (service,
amount, reference; minimal personal data) → pays through the gateway (sandbox until LLP/KYC) →
the gateway callback/webhook is signature-verified → payment status updated idempotently → patient
sees the result, and staff see it in `/admin`.

**4.3 Partner enquiry.** Hospital, doctor or professional submits the Partner form → stored with
consent → team alert.

**4.4 Staff admin.** Login → queries list (filter by status, service) → query detail (status, notes)
→ create quote → transactions list → audit log of views/changes.

## 5. Page inventory (D-013)
| Route | Purpose | Depends on |
|---|---|---|
| `/` | Home: value proposition (hospital → home bridge), services overview, how it works, CTAs | Design direction (D-009), CLAIMS |
| `/services` | All service lines | Q6 |
| `/services/[slug]` | One service: who it's for, what's included, how it works, CTA with service pre-selected | Q6, CLAIMS |
| `/about` | Story, vision/mission, founders, values | C-021 |
| `/contact` | Query form + real contact details | Q3, Q7, Q12, Q13 |
| `/pay` (+ `/pay/[reference]`) | Pay against a quote | D-003/D-004, Q5, Q8 |
| `/partner` | Partner enquiry | Q16 |
| `/faq` | Confirmed answers only | Owner facts |
| `/privacy`, `/terms`, `/refunds` | Legal drafts, marked DRAFT until reviewed | D-012, Q13, Q14 |
| `/admin/**` | Staff only, noindex | D-006 |
| Site-wide | Promotions banner (config-driven), footer with legal name when known | Q5, Q9 |

Service lines named in the deck (live-at-launch set pending Q6): Home Nursing · Attendants &
Senior Care · ICU & Critical Care at Home · Physiotherapy & Rehabilitation · Post-Surgery Care ·
Palliative & Hospice Care · Maternity & Newborn Care · Doctor Consultation at Home · Elderly Care ·
Diagnostics, Vaccination & Medicine Delivery · Medical Equipment Rental & Sales ·
Personalised & Language-based Care · Chronic Disease Management · Mental Wellness Support.

## 6. Success metrics (measured, never displayed as claims)
- Query form completion rate; share of queries with a callback within the promised window (Q12).
- Quote → payment conversion; payment failure rate (sandbox then live).
- Core Web Vitals on mobile (LCP < 2.5 s on 4G); zero a11y criticals.
- Zero unregistered claims in shipped copy (the CLAIMS test).

## 7. Constraints and risks
- **Trust is the product.** Unproven claims are the biggest risk (D-007).
- **Legal/regulatory:** DPDP Act 2023 (consent, notice, retention, grievance officer); gateway KYC
  pages; service-specific rules for teleconsultation, e-pharmacy, vaccination and lending. See
  `COMPLIANCE.md`. Nobody on the team is a lawyer (D-012).
- **Entity not formed:** no live payments until LLP + KYC (D-003).
- **No real photography yet** (C-014): the design must work type-led (Blueprint §15).
- **Scheme funding** (PMJAY, NHM, PM-ABHIM, IIT-BHU): business research, not website scope. The
  brief itself flags eligibility as unverified.

## 8. Owner conversation
Lives in `docs/OWNER-QUESTIONS.md` (one canonical home).

## 9. Assumptions and dependencies
- Most visitors are on mobile phones (brief).
- Payment gateway sandbox access is available without KYC (verify at Stage 4 against the chosen
  gateway's current docs).
- Founders supply copy approval (Q15) and real contact details (Q3) before those pages go live.

## 10. Glossary
**Quote:** a staff-issued priced offer for a specific service, with a reference, amount and expiry.
**Reference:** a short, non-guessable code on a quote, used for paying. **Provider:** a nurse,
attendant, therapist, doctor, lab or supplier delivering the service. **Platform share:** Care
Setu's configurable portion of a payment (D-005).
