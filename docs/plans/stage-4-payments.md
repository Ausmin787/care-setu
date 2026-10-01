# Care Setu: Payments (Stage 4, page 5): research and options

**Status:** research done 2026-10-01; options comp at `refs/care-setu/build/pay-options/index.html`; **Sasanka's pick
pending**. The full §13 build plan is written here once he picks. Decision: D-036 (full flow, development only).

## Context
A family pays the amount on a quote their coordinator sent (D-004), by link (`/pay/<ref>`) or by typing the reference
(`/pay`). Nothing is live: the flow runs in development on sample quotes (`paymentsLive: false`, INVARIANT 29);
production shows a call-your-coordinator card. Assets: none needed. Open: Q5 + Q8 + KYC (live payments), Q14 (legal).

## Flow (F2), from the sources below
1. `/pay`: one field for the quote reference (grouped boxes that are one input: paste, autofill, backspace; Bencho
   one-time-code), a why-line, Continue. Errors: not found, expired, cancelled, already paid; each says what to do and
   gives the phone number.
2. `/pay/<ref>`: the quote summary. Service, what it covers, starts, **valid until** (a plain date in Asia/Kolkata,
   never a countdown), the amount (server-side, integer paise), "something looks wrong? call", links to the DRAFT
   terms and refunds, and a button naming the amount ("Pay ₹21,000"). The checks the server did (found, valid, not
   paid) can be shown, because they are true (Increase).
3. Pay: a labelled sample step in development; later Razorpay Checkout. The status says "Waiting for the bank";
   payment is confirmed only by the signed callback/webhook, never by the redirect (GOV.UK Pay, Razorpay docs).
4. Results: **paid** (receipt: paid to, for, quote, paid on, payment id, total, what happens next, print / save);
   **failed** (no money taken, try again, call); **pending** (don't pay twice, we'll confirm); **expired**;
   **cancelled** (coordinator withdrew it); **not found**. Partial payment waits on Q8 (Razorpay supports
   `partially_paid`; HoneyBook shows a payment schedule); not built until answered.
Razorpay Payment Links, primary source (razorpay.com/docs/api/payments/payment-links/create-standard/, read 2026-10-01):
`reference_id` up to 40 chars and unique; `expire_by` 15 min to 6 months; statuses `created`, `partially_paid`,
`paid`, `expired`, `cancelled`; `callback_url` with GET only, and `razorpay_signature` must be verified.

## Sample ledger (§1.5)
| Sample | Feeds | Taken | Changed + why | Tool |
|---|---|---|---|---|
| Cue Kit Thermal Cut Invoice (Prompt tab, full spec) | Option A: pay + receipt | ink machine with a status screen; stages 1.4s and 2.0s; paper fed in 20 steps over 1.75s (`steps`, linear); rows in at 260ms from +60ms, 180ms fade + 4px; status icon swap | parchment paper, Petrona type, Warm Room ink; **no scissors drag** (a drag gesture for elderly users), **no barcode, perforation, stamp** (Hungry Anna's chit, §1.2); print via the browser, not jsPDF | Chrome, page text |
| Cue Kit Lime Retainer Pricing | quote summary (A) | editorial split: headline left; plan, one line, big price, action with a note, "what's included" | our facts, no lime button (logo colours only as accents) | Chrome |
| Increase (increase.com, "Modular compliance") | checks (A screen, B ledger) | label/value rows ticking under a "Verifying" pill | ticks reflect the server's real checks only | Chrome |
| GetLayers Ridgeline (template preview) | B's rail, /pay's how-it-works | "No surprises after": four numbered steps, a meta tag right-aligned per step | our four steps: care plan, written quote, pay, care begins | frame sheet `refs/care-setu/pay/ridgeline-end-sheet.jpg` |
| Componentry Flight Status Card | Option C | two big ends with an arrow, ETA chip, one wide progress bar with a knob | ends "Quote" and "Home", chip = valid until; Petrona, not dot matrix | Chrome |
| Design Spells: Apple Wallet add card; Run Receipt; Dub numbers | status line; receipt print; digits | stepped status line ("Contacting the card issuer..." then a tick); a receipt printing out; per-digit roll | status words are ours and true; Dub's roll already used on About (not repeated) | MP4 frame sheets `refs/care-setu/pay/designspells/` |
| Unlumen Smart Animate Text / Animate Digits | status label, B's amount | per-character blur-slide on change | CSS only | page text |
| Bencho one-time-code | `/pay` reference field | boxes that are one field; paste, autofill, backspace; a small swell per character | grouped as `QT 4K7M 9P2X` | page text |
| Mobbin (iOS "payment successful", web "invoice") | paid result | a big status word ("Paid") then summary, total, details, Download receipt, Contact us; HoneyBook's payment schedule | serif status word, our receipt rows | logged-in search |
| Stripe Checkout demo (checkout.stripe.dev) | layout check | summary then pay in one column on narrow screens; the policy line under the button | we never collect card data (the gateway does) | Chrome |
| GOV.UK Pay payment flow (docs) | flow rules | service page with amount + one action → gateway → return page that checks status by API; confirmation or failure with retry | | WebFetch |
| Refero: Mollie ("cashmere counter, dark ledger") | system check | brown-black filled pills "tactile rather than corporate-blue", cream cards, espresso panels | confirms the Warm Room for payments; no new tokens | Chrome |
| Paytm electricity bill pay | genre check | biller, consumer number, fetch bill, pay | the average to beat; stopped before any number | Chrome |
| Portea | genre check | no pay page at all: "Book Now" + phone; links land on Razorpay's generic page | the cliché is Razorpay's hosted page | Chrome |
Opened, nothing taken: 21st.dev checkout/receipt/invoice (card forms, confetti, barcodes: the cliché), Smooth UI
(price-flow: the amount doesn't change; wallet-card), Magic UI (number-ticker: Dub's idea; confetti rejected), Cult UI
(folded/cutout cards, no job), Skiper (auto-scale and smooth-caret inputs; considered for the reference field, Bencho's
fits better), Motion.dev (loading-fill-text kept as an idea for the Pay label; hold-to-confirm rejected: a held
gesture), Recent Finance (four sites, none relevant), Curated (16 free sections; Pricing gated), Awwwards animation
collection (nothing payment-related), Pafolios (no payments case study; Uber "Perfecting the Pickup" noted for the
pending state, not read in full), UI Guideline (props tables only; behaviour spec paid), GetLayers sections (the ten
known ones; none for this), all 52 GetLayers templates re-read at their last 45% (Ridgeline taken).
Skipped with reasons: Aceternity (cliché check only, not needed after 21st.dev), Neobrutalism (wrong look), ThreeUI (no
3D job), Jitter/Swishy/Animos (rendered clips, not page motion), Logosystem (no mark work), Best Free Fonts (type
locked, D-027), React Bits (client-rendered catalogue; text effects collide with the anime.js lane, §9.1), Kokonut /
Origin Kit / Uiverse (catalogues not fetchable headless; nothing payment-specific seen in their indexes), Watermelon
(unverified), Refero MCP (not connected; browser fallback used).

## Options (comp: `refs/care-setu/build/pay-options/index.html`)
- **A · The printed receipt (recommended).** Quote as an editorial split; an ink payment card whose screen runs the true
  checks, then "Waiting for the bank", then prints a parchment receipt out of its slot (Cue Kit timings exactly).
- **B · The ledger that checks itself.** Ink panel: Ridgeline's four-step rail left (you are at "Pay"), a parchment
  ledger right whose rows tick, the amount resolving digit by digit; paid adds a row and moves the rail.
- **C · The journey bar.** Flight-status card: "Quote → Home", one wide bar whose knob moves to "Paid". Risk: repeats the
  trip and route idea (Home, Contact).

## Slop pre-check (§0.1)
Stripe clone centred on grey; trust badges and "100% secure" (claims, INVARIANT 15); padlock claim; confetti or a big
green tick; perforated chit or barcode (Hungry Anna); an urgency countdown (dark pattern); Contact's route card again.
