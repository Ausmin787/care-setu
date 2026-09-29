# Care Setu: Contact (Stage 4, page 4): build plan

## Context
The brief's page order is Landing, Services, About, **Contact**, Payments; About was approved 2026-09-29. Contact is the
first transactional page: a family either calls, or leaves details for a coordinator to call back (PRD 4.1, D-006).
It carries the data layer D-021 moved here (built first, design-independent: Drizzle + PGlite, migration 0001,
`POST /api/v1/queries`, consent in one transaction, console email adapter, rate limit, CI; see D-033).
**Facts available:** phone and WhatsApp (C-028), email (C-029), office (C-030), the 2-hour promise with the hours
(C-031), Noida and Delhi (C-032), a coordinator calls back (C-025), plan and quote before paying (C-024). **Open:**
alert recipient (Q12), retention and grievance officer (Q13), the lawyer (Q14). So the enquiry runs in development
only until a D-entry records the privacy sign-off and the recipient (`enquiryLive`), and `/privacy` is a DRAFT.
**Assets:** none needed; the page is type-led plus the ink cards.
**Sasanka's picks (2026-09-29, AskUserQuestion, recommended on all three):** questions in Elder's order (hospital or
home first); **Your route** (questions left, a live route card right); **Call card beside** (Ridgeline split);
**Route reaches Home** on send.

## Difference Test (§1.2)
Same locked system (Warm Room, D-027); the binding test is "no section repeats another page". Home: video hero,
trip, Colonnade, reel, ink statement, partner index. Services: opener, stacked deck, hover sheet, sand close. About:
question opener, letter, inline-image manifesto, odometer, collapsing cards. Contact adds an ink call card beside a
type-led opener, and a question flow with a live route card. The route card borrows the trip's *grammar* (spine,
stations) for a different job, your own enquiry's progress (§1.3); nothing scrolls or pins.

## Slop pre-check (§0.1)
- Three contact cards (address, phone, email) + a Google map embed + chat bubble (Portea, the genre) -> one ink call
  card with the number as type; email and office as a quiet line; no map (a third-party embed that tracks visitors).
- One long form with every field at once -> one question per page (INVARIANT 27, GOV.UK).
- A SaaS stepper you can jump around (Cue Kit wizard, 21st.dev) -> "Question n of 5" and a back link (GOV.UK), plus
  the route card, which shows answers without being navigation.
- A green success tick and "Thanks!" -> a GOV.UK confirmation: reference, what happens next, the phone.
- Fade-up reveals -> the only motion is the step slide, the route filling and the send sequence.

## Sample ledger (§1.5)
| Sample | Section | Taken | Changed + why | Tool |
|---|---|---|---|---|
| GetLayers Ridgeline (template, trade business) | Opener | a dark phone card ("or call and speak to...", hours) beside the form start; the reply promise under the action; "No idea" as an answer | the card is our ink band as a card, number in Petrona display, live call status, the emergency note | preview MP4, end-frame sheet |
| 21st.dev Appointment Intake Match | Enquiry | question left, a live card right that changes with each answer; per-question why-line; option rows with a one-line description | the card is a route (spine + stations) on ink; the service station takes its line colour; the terminus is the callback | live component, driven |
| Unlumen Questionnaire (spec) | Enquiry motion | direction-aware slide (72px, 8px blur, reversed going back); a checkpoint track; a submission layer filling every checkpoint over 1.6s; submit label "Sending..." -> "Sent"; reduced motion keeps navigation, drops travel | CSS keyframes, not springs; no height animation (a layout property, §9.4); the checkpoint track is the route card (desktop) or a thin track (phones) | page text (full API + notes) |
| Elder get-started (stepped live 2026-09-29) | Flow | order (care, when, practicalities, area, contact last); one-line "why we ask"; the business's limit stated inside the question; "Not sure" | Continue instead of auto-advance (GOV.UK; arrow keys on a radio group must not submit); our area limit (Noida and Delhi) stated in the question | Chrome, stopped before the postcode |
| GOV.UK question / check answers / confirmation patterns | Flow rules | back link top, Continue left, "Question n of m", Change links return to check answers, button names the action, confirmation panel with reference + next steps + contact | NHS error summary kept; the confirmation also shows the live call status | WebFetch of the three pattern pages |
| Motion.dev Multi state badge | Send button | one control through idle / sending / sent / error | text swap + an aria-live line; no Motion library (§9.1) | page text |
| Mobbin (questionnaire screens) | "What's needed" step | a privacy line under a sensitive health question; ink-filled selected answer | our line says who reads it and asks for only what the care needs | logged-in search |
Opened, nothing taken: Cue Kit (wizard = generic SaaS; envelope = a toy), Bencho (demos blank; its stepper is a number
counter), UI Guideline (radio anatomy only; success state unbuilt), Curated Contacts (agency CTAs; noted a live local
time), Awwwards (forms collection 404, search returns sites), Pafolios (not searchable by topic), Design Spells Airbnb
seal (offered, not picked: a seal implies certification, and stamping echoes Hungry Anna) and Things progress pie
(the route card does its job). Skipped with reasons: see the session plan.

## Direction
Warm Room unchanged (D-027, DESIGN.md). Two ink moments (the call card, the route card) are cards, not bands. The
logo's colours appear only as the service station's disc and the lime "open" dot (INVARIANT 27).

## Flows (F1, the enquiry)
Order, one per page, each with a why-line, back link and "Question n of 5":
1. **Where is the patient now?** In hospital / At home / Not sure. (Why: so the coordinator knows where care starts.)
2. **Which service?** The ten services grouped under their three lines, plus "Not sure yet"; pre-selected from
   `?service=<slug>` when arriving from a service. (Why: so the right person calls.)
3. **Where is the patient?** Noida / Delhi / Somewhere else; the question states "We arrange care in Noida and Delhi
   right now" (C-032) and "somewhere else" says the coordinator will tell you what is possible.
4. **What does the patient need?** Free text, up to 1000 characters; the line under it says only the Care Setu team
   reads it and asks for no more than the care needs (TRD §5).
5. **Who should we call?** Name, mobile number, email (optional).
Then **check your answers** (summary list, Change links that return here), the **consent** checkbox (unticked,
linking to the draft privacy notice, INVARIANT 12) and **Send my details**; then the **confirmation**: "We have your
details", the reference (10 characters, no 0/O/1/I/L), what happens next (a coordinator calls back, C-025, with
C-031 and the live status; a care plan and a quote before you pay, C-024), the phone, the emergency note.
Errors: an NHS error summary at the top plus the message at the field; 422 maps fields back to their step; 429 and
network failures say so and give the phone number. No JavaScript: a note pointing to the phone, WhatsApp and email.
Step state lives in the URL (`?step=`), so Back and Forward work (Vercel guidelines).

## Structure
1. **Opener** (parchment): H1 "Talk to us.", one line, "Leave your details" jump link | the **ink call card**:
   number, Call and WhatsApp, live status, C-031, emergency note. Under both, a sand line with the email and office.
2. **Enquiry** (`#enquiry`, parchment): the question column (7) | the sticky **route card** (5, ink). Phones: the
   route card becomes a thin five-stop track above the question.
3. Footer.
**Instrument (§8.3):** the live call status, in the call card and at the route's terminus (computed, D-024 hours).

## Motion plan
Signature: **the route fills**. Each answered station inks and its spine segment fills (transform scaleY); on send,
a fill runs station to station over ~1.6s and the terminus "Home" resolves, then the confirmation replaces the
question. Step change: the incoming question slides 72px with an 8px blur and fades in (reversed going back), 450ms,
`cubic-bezier(.22,1,.36,1)`. All CSS (transitions and keyframes keyed by data attributes); no GSAP or anime.js is
needed. Reduced motion: no travel, blur or stagger; states change instantly. Transient states are JS-set attributes,
so no-JS and reduced motion are correct by default.

## Files
- `app/contact/page.tsx` + `page.module.css`: opener, call card, contact line, the enquiry (gated by `enquiryOpen()`).
- `components/contact/Enquiry.tsx` + `Enquiry.module.css`: steps, validation, check answers, submit, confirmation.
- `components/contact/Route.tsx`: the route card and the phone track (presentational).
- `app/privacy/page.tsx` + `page.module.css`: the draft notice (D-012 marker, notice version).
- `content/messages/en.json` (`contactPage`, `enquiry`, `privacyPage`), `content/site.config.json` (`email`).
- CTAs on service cards link to `/contact?service=<slug>#enquiry`.

## Build order
1. Data layer (done, green) 2. Static frozen gate: opener, every step, check answers, confirmation 3. Chrome: call
status, route states 4. Motion: step slide, route fill, send sequence 5. Reduced-motion pass.

## Verification
§10 + the session plan's Step E: green; API by hand; device matrix (`npm run audit:devices`); keyboard through every
step; back/forward; pre-select; reduced motion emulated; impeccable 1280 + 390; Taste pre-flight; Web Interface
Guidelines (forms); production fact audit (enquiry absent, contact details present, `/privacy` DRAFT, no `+91 123`,
no `caresetu.com`); side-by-sides for Ridgeline and 21st.dev.

## Open questions / watch items
Q12 (who gets the alert), Q13 (retention, grievance officer), Q14 (lawyer) gate going live. Rate limit is per
instance (Q1). The email provider waits for Q1; dev logs only the query id.
