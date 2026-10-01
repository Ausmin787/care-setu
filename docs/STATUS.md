# Project Status
**Updated:** 2026-10-01 · **Docs version: v0.3** · **Decision head: D-036**
**Stage:** 4 on localhost (`npm run dev`), Warm Room (D-027/D-028; `DESIGN.md` regenerated from the shipped build). Home (D-030), Services (D-031), About (D-032; polished in D-034: ink founder cards, the mission as a bridge, sharp capsules) built; **Contact built (D-033)**: data layer (Drizzle + PGlite, migration 0001, `POST /api/v1/queries`, consent, CI file), a one-question enquiry with the live route card, the call card, and a DRAFT privacy notice. The enquiry runs in development only (`enquiryLive: false`). Contact phone/WhatsApp and email updated to the owners' latest (D-035). **Pay built (D-036)**, dev only on six sample quotes: the reference field, the quote beside an ink payment card that prints a receipt; production shows a call card. Owner sample content pending, dev-only (D-029); prices built but off. Taste evidence: `docs/OWNER-TASTE.md`.
**Next:** **Sasanka's check of Pay (D-036), About (D-034) and Contact** → owner review round 2 over the tunnel (Q17..Q20, copy under Q15) → the still-lifes (`docs/ASSET-PROMPTS.md`).
**Then:** heavy, one per session: Partner → FAQ → service detail template (D-013, keep-or-drop undecided). Medium: Terms + Refunds drafts. Light, batchable: 404, promo banner (off, Q9), sitemap + robots. Backend later: pay wiring, Partner API, Admin → Stage 5.
**Blocked on owners:** hosting/DB and email provider (Q1), domain (Q2), brand hexes (Q4), LLP/KYC (Q5), claim evidence (Q10), alert recipient (Q12) + retention and grievance officer (Q13) + legal reviewer (Q14): these three gate the enquiry going live, copy approval (Q15), sample-site content/prices/contacts (Q17..Q19), About photos and wording (Q20).
**Not connected:** Refero MCP (D-009); context7 MCP failed to connect this session. No Docker on this machine (D-002). No git remote yet.

<!--
KEEP THIS FILE SHORT: cap 15 non-empty lines / 4 KB, enforced by .claude/hooks/docs-check.mjs.
It answers "where are we right now". History belongs in DECISIONS.md, binding constraints in
INVARIANTS.md. Update `Decision head:` in the same edit as any new decision.
-->
