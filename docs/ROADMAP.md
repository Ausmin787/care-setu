# Care Setu — Roadmap (Phase 1 website)

One stage at a time; check in with Sasanka at every stage end and after every page (D-011).
A stage is done only when its **Verify** gate passes and the result is recorded in a D-entry with
**Verified:** / **Not verified:**. Stop conditions: a fix loop gets at most 3 attempts, then stop
and report (AGENT-OPS §2).

## Stage 0 — Foundation (no app code)
- [x] Governance docs, hooks, settings, rules, .gitignore, .env.example
- [x] Local git repo (`main`), nothing committed (D-015)
- [x] Jev private-list entry + project memory (D-010, D-017)
- [x] Verified: docs-check, 5 break tests, hook suite 19/19 (D-017)
- [x] First commit, on Sasanka's go-ahead (3c3bb9a)
**Verify:** `node .claude/hooks/docs-check.mjs` exit 0; context-head break test exits 1; each hook
negative-tested (blocked case → exit 2, benign → 0).

## Stage 1 — Owner round + brand
- [ ] Sasanka sends `OWNER-QUESTIONS.md` to the founders; answers → D-entries
- [x] Hand-built logo SVG (`brand/logo.svg`, `logo-mark.svg`, `logo-mono.svg`) per D-014 (D-018)
- [x] `BRAND.md`: measured hexes, fonts, size floor, clear space, interpretation choices (D-018)
- [ ] Contrast table of mark colours vs the Stage 2 grounds (needs the design direction first)
- [ ] Owners confirm reconstruction, hexes, fonts, mono proposal, favicon variant (Q4)
**Verify:** overlay the SVG render on the source JPEG at 400% (pixel diff, report the numbers);
render at 16/32/64/512 px; owners confirm (Q4). Done except owner confirmation (D-018).

## Stage 2 — Design direction (Blueprint Phase 0–2)
- [ ] §2 factual brief (facts only), read the canonical tool list file (§1.6)
- [ ] Deep research: Mobbin (logged in), Recent.design Health filter, Godly, Supahero, Design Spells,
      Cue Kit, Pafolios case study, UI Guideline for forms; real home-care/health sites (India + global)
- [ ] Sample ledger, §0.1 slop pre-check, Difference Test vs the §14 ledger (Hungry Anna rows)
- [ ] The §8.3 instrument: true, computed, specific to Care Setu
- [ ] 2–3 directions via AskUserQuestion with previews → Sasanka picks → `DESIGN.md` + `docs/plans/<date>-build-plan.md` (§13 template)
**Verify:** every section has a named sample; ledger has no empty "taken" column; Difference ≥ 4 axes.

## Stage 3 — Scaffold (brief step 4)
- [x] Next.js 16 + TS strict + Tailwind v4 (scaffolded in a temp sibling and moved in; Blueprint §5.3), 2026-09-26
- [x] Route stubs for every public page in PRD §5; zod-validated public config (`content/site.config.json`)
- [x] Security headers + strict nonce CSP (D-022) + `security-headers.test.ts`; claims test; Vitest; ESLint
- [x] **Built with the Contact page (D-021 -> D-033):** Drizzle + PGlite dev, env config (`server/config/env.ts`),
      `POST /api/v1/queries`, CI workflow (`.github/workflows/ci.yml`, not pushed: no remote). Auth library choice → D-entry, moved to Admin.
- [ ] `impeccable init` (writes PRODUCT.md), README setup instructions (next session)
- [ ] After the first Stage 4 pages: gbrain trial per D-019 (embedding privacy check → index code from
      the repo → 10 known-answer questions with/without → keep or drop, recorded as a D-entry)
**Verify:** green (lint, typecheck, test, build); CI green on first push (push needs permission).

## Stage 4 — Pages, one at a time (check-in after each)
Order: Home → Services (+ detail) → About → Contact → Payments → Legal drafts → Partner → FAQ →
Promo banner → Admin. Each page: frozen static gate → motion → Blueprint §10 verify list →
claims test → Sasanka review.
- Contact adds: migration 0001, consent capture, email adapter, rate limit, confirmation state.
- Payments adds: quotes, sandbox adapter, webhook with signature + idempotency, status page.
- Admin adds: auth, roles, lists, quote creation, audit log.
**Verify (per page):** green; 360/768/1024/1440 no overflow; keyboard + reduced-motion; impeccable
detect on the running dev server at 2 viewports; claims test; side-by-side vs samples.

## Stage 5 — Hardening + handoff
- [ ] `/security-review`, `/cso`, npm audit, header check, rate-limit test
- [ ] a11y (WCAG 2.2 AA target) and performance pass on real mobile throttling
- [ ] Retention purge job; data export for owners
- [ ] Codex review package (AGENTS.md hand-off section) + fixes
- [ ] Owner hosting decision (Q1) → staging deploy (permission) → go-live checklist
**Verify:** all suites green; Codex findings triaged with reasons; nothing claimed that wasn't run.

## Dependency chain
Q3/Q7/Q12/Q13 → Contact live · Q5 + Q8 + gateway KYC → live Payments · Q6 → Services live set ·
Q10 → any claim · Q14 → legal pages live · Q1/Q2 → any hosting.
