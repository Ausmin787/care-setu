# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Family member arranging care, often remote.** A son or daughter, sometimes in another city or abroad, whose
  parent has just come home from hospital in Noida or Delhi. They need fast reassurance that Care Setu is real and
  reliable, one place to ask, and a way to pay from afar.
- **Local family caregiver.** Already exhausted, arranging a nurse, equipment and tests separately. They need one
  point of contact and a clear list of what is covered.
- **The patient, often elderly.** Recovering at home, possibly reading on a phone with large text. They need
  legible pages, a visible phone number and no dark patterns.
- **Referral partners.** Hospital discharge desks, doctors and clinics who hand patients over (Partner page).
- **Care Setu staff.** Coordinators who call families back and handle queries and payments in `/admin`.

Source: `docs/PRD.md` §3.

## Product Purpose

Care Setu ("setu" = bridge) arranges care at home after a hospital stay. A family says what is needed; a
coordinator calls back, puts together a care plan and a quote, and the family pays against that quote. Phase 1 is
the website only (D-001): explain the service well enough that a worried family gets in touch, capture queries
with consent, and take payment against a staff-issued quote. Success means a family who lands on the site trusts it
enough to call or send a query.

## Positioning

One team coordinates everything a patient needs at home after discharge (nursing, attendants, doctor visits,
physiotherapy, sample collection, ICU-level care, equipment), instead of the family finding and managing each
separately. The price is never guessed on the website: it comes from a quote after a conversation.

## Operating Context

- Families usually arrive at a stressful moment: a discharge date, a new diagnosis, a parent who can't manage alone.
- Contact is a phone call or WhatsApp to **+91 78600 42009**, email **caresetuhealth@gmail.com** (D-035), or the website
  query. The team calls back **within 2 hours, every day 7 AM – 10 PM** (D-024; always stated together).
- Office: **4B Grover Chamber, Karol Bagh, Delhi 110005**. Service area: **Noida and Delhi** (more cities later).
- Payment is made online against a quote reference; the result comes only from the gateway's verified callback
  (D-003, D-004). The gateway is sandbox-only until the legal entity and KYC exist.

## Capabilities and Constraints

- **Launch services (D-024):** Nurse at Home, GDA (general duty attendant) at Home, Doctor at Home, Physiotherapy,
  Lab Sample Collection, ICU Care at Home, Nursing Procedures (dressing, injections, catheter care), Medical
  Equipment (rent, buy, or sell back).
- **Not offered in Phase 1:** online booking or scheduling, teleconsultation, e-pharmacy ordering, vaccination,
  EMI financing, patient accounts, public price lists (PRD §2, D-004).
- **Stack (existing):** Next.js 16, React 19, TypeScript, Tailwind v4; strict nonce CSP, every page dynamic (D-022).
  Drizzle over Postgres with PGlite in dev arrives with the Contact page (D-002, D-021).
- **Rules:** the client never sends a price; money is integer paise; zod at every API boundary; no personal data in
  logs, analytics or any third-party AI (D-004, D-006, D-010).
- **Still undecided (owner questions):** hosting and database (Q1), domain (Q2), logo and brand fonts/colours (Q4),
  legal entity (Q5), payment/refund policy (Q8), promotions (Q9), evidence for claims (Q10), photos (Q11), who
  receives query alerts (Q12), data retention and grievance officer (Q13), legal reviewer (Q14), copy approver
  (Q15), partner enquiries (Q16). Nothing defaults these (INVARIANT 25).

## Brand Commitments

- Name **Care Setu**; tagline "Connecting Care. Empowering Lives." (C-022).
- Logo: the owners' supplied mark, rebuilt as SVG (D-014, D-018), colours provisional until Q4.
- Founders: Vishwanath Pratap Singh "Shiva" and Dr Saurabh Chauhan; co-founders Ayush Srivastava and Aashish Singh.
- Voice: plain, calm, specific. Say what happens next. No hype, no medical promises.
- English at launch, i18n-ready; translations are human-written or reviewed (D-008).

## Evidence on Hand

- Owner-confirmed facts: contact details, response time and hours, service area, the eight services (D-024,
  `docs/CLAIMS.md` C-028..C-033).
- One illustration, clearly drawn, never presented as real people (`public/illustrations/hero-care-scene.png`, C-027).
- **Absent, and never to be fabricated:** photos of real staff or patients (Q11); testimonials; patient counts or
  "trusted by"; partner hospital names or logos (C-006); certifications (C-001..C-005); staff verification claims
  (C-015); 24x7 support (C-016); market statistics (C-008..C-011); prices.

## Product Principles

1. **Trust before anything.** A worried family should understand what happens next in one read; plain facts beat
   metaphors or polish.
2. **Only what is true today.** Every fact on the site has an approved row in `docs/CLAIMS.md`; no control is shown
   that the business can't honour.
3. **A person, then a quote.** Care is arranged through a conversation and a quote, never a price guessed online.
4. **Built for older eyes and hands.** Large text, the phone number within reach, no time pressure.

## Accessibility & Inclusion

WCAG 2.2 AA. Body text at least 17–18px (20px in use), nothing under 14px, 44px touch targets, visible focus,
reduced motion correct by default, inputs at 16px or more. Many readers are elderly or reading under stress
(`.claude/rules/app.md`).
