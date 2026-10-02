# Care Setu — website

*Connecting Care. Empowering Lives.* A home-healthcare platform for Delhi NCR, bridging hospital
and home. This repository holds the Phase 1 website: a marketing + transactional site with
service pages, a patient query form, payment against a quote, and a staff admin.

**Status:** Stage 0 (foundation: docs and guardrails only). See `docs/STATUS.md`.
**Ownership:** built by Sasanka (tech lead) for the Care Setu founders. Licence and copyright
holder to be set once the legal entity exists (Q5). Until then: proprietary, all rights reserved.

## Setup
Node 24. Next.js 16 (App Router) + TypeScript strict + Tailwind v4; anime.js + GSAP for motion (D-021).
No Docker or cloud account needed. Drizzle + PGlite arrive with the Contact page (D-021).
```
npm install
npm run dev        # http://localhost:3000
npm run green      # lint + typecheck + tests + build ("green", INVARIANT 26)
```
Copy lives in `content/` (D-008): `messages/en.json`, `services.json`, and `site.config.json` (public business
facts; empty until the owners answer, and empty hides the UI). Hero illustration slot:
`public/illustrations/hero-care-scene.png` (D-021).

## Docs map — one canonical home per fact
| Topic | Canonical file |
|---|---|
| Where the project is right now | `docs/STATUS.md` |
| Binding constraints + open questions | `docs/INVARIANTS.md` |
| Every decision, with why and what was rejected | `docs/DECISIONS.md` |
| Questions for the founders and their answers | `docs/OWNER-QUESTIONS.md` |
| Product scope, personas, flows, page inventory | `docs/PRD.md` |
| System shape, layers, data flows, environments | `docs/ARCHITECTURE.md` |
| Stack, schema, API catalogue, security, tests | `docs/TRD.md` |
| Stages and verify gates | `docs/ROADMAP.md` |
| Legal/regulatory watch-list (not legal advice) | `docs/COMPLIANCE.md` |
| Evidence for every factual claim | `docs/CLAIMS.md` |
| How AI agents work here (loop, guardrails, evals, Jev, Codex) | `docs/AGENT-OPS.md` |
| Logo, colours, brand assets | `docs/BRAND.md`, `brand/` |
| Visual design system (Stage 2) | `DESIGN.md` |
| Owner's design reactions, round by round | `docs/OWNER-TASTE.md` |
| Prompts for images Sasanka generates | `docs/ASSET-PROMPTS.md` |
| Build plans | `docs/plans/` |
| Session trace | `docs/LOG.md` |
| Agent rules | `CLAUDE.md` (Claude Code), `AGENTS.md` (Codex/others) |

## Integrity checks
```bash
node .claude/hooks/context-head.mjs --check   # decision index integrity
node .claude/hooks/docs-check.mjs             # + STATUS cap, Why/Rejected, citations
node .claude/hooks/context-head.mjs --wrap    # end-of-session close-out
```

