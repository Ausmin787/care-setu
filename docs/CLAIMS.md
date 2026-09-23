# Claims register — evidence before anything factual ships (D-007)

**Rule.** A statistic, certification, compliance statement, partner or hospital name/logo,
testimonial, "trusted by / N families", contact detail, domain, price, or photo appears on the
site **only if its row here is `approved`** with evidence recorded. At scaffold, a test parses this
table and fails the build if any sentence in the message files matches a `pending` or `rejected`
row or a known risky pattern that has no approved row.

**Status values:** `pending` (no evidence yet), `approved` (evidence recorded, owner-approved),
`rejected` (never ship), `sourced` (a public statistic with a citable primary source; may ship
with the citation shown).

**Evidence** means: a document, certificate number, signed agreement, public primary source URL,
or owner confirmation recorded as a D-entry. "It's in the deck" is not evidence.

| ID | Claim (as written in source) | Source | Evidence | Status | Used on |
|---|---|---|---|---|---|
| C-001 | ISO 9001:2015 (Quality Management) | Deck p.25 | — | pending | — |
| C-002 | ISO 27001:2013 (Information Security) | Deck p.25 | — | pending | — |
| C-003 | "HIPAA Compliant" / "ISO 27001 Aligned" | Deck p.28 | — (HIPAA is a US law and doesn't apply to an Indian provider; the claim would mislead) | rejected | — |
| C-004 | "Clinical Establishments Act Compliant" | Deck p.25 | — | pending | — |
| C-005 | "Data Protection Compliant" / "comply with Indian data protection standards" | Deck p.23, p.25 | — (a compliance claim needs a completed DPDP review) | pending | — |
| C-006 | Hospital names/logos: AIIMS, Indraprastha Apollo, Fortis, Medanta, Max, BLK-Max, Sir Ganga Ram, CK Birla, Venkateshwar, Jaypee, Global, Kokilaben | Deck p.24A, 24B | Deck labels them "proposed" / "examples" | rejected (until a signed partnership exists per hospital, then one row each) | — |
| C-007 | "Trusted by thousands of families" / "Trusted by Thousands of Families" | Deck p.20, p.21 | — (pre-launch) | rejected | — |
| C-008 | "2.2 Cr+ patients in India need post-hospital care every year" | Deck p.5 | — (needs primary source) | pending | — |
| C-009 | "70%+ patients prefer to recover at home" | Deck p.5 | — | pending | — |
| C-010 | "40–60% cost can be saved with home-based care" | Deck p.5 | — | pending | — |
| C-011 | "10 Cr+ elderly population will need regular healthcare support" | Deck p.5 | — | pending | — |
| C-012 | Phone `+91 123 456 7890` | Deck (many pages) | Placeholder number | rejected | — |
| C-013 | Domain / emails `www.caresetu.com`, `hello@caresetu.com`, `partnerships@caresetu.com` | Deck | — (ownership unverified, Q2) | pending | — |
| C-014 | People photos (nurses/doctors in Care Setu uniforms, patients, families) | Deck, all service pages | Appear AI-generated | rejected as real-staff imagery (INVARIANT 16) | — |
| C-015 | "All our nurses/attendants/professionals are background verified, trained and experienced" | Deck p.11–19 | — (describe the actual verification process once it exists) | pending | — |
| C-016 | "24x7 support" / "24/7 care and emergency support" | Deck p.9, 10, 13, 16 | — (only if staffed) | pending | — |
| C-017 | "WHO Recommended" (vaccination) | Deck p.20 | — | pending | — |
| C-018 | "100% Authentic & Quality Assured" medicines | Deck p.20 | — (needs licensed pharmacy partner) | pending | — |
| C-019 | "Easy EMI options available for loan" (equipment) | Deck p.21 | — (needs a lending partner; regulated) | pending | — |
| C-020 | Languages supported: Hindi, English, Marathi, Gujarati, Bengali, Tamil, Telugu, Kannada | Deck p.22 | — (only languages staff actually speak) | pending | — |
| C-021 | Founder and co-founder bios and photos | Deck p.3–4 | Supplied by founders in their own deck | pending (confirm the text and photo consent for web use) | — |
| C-022 | Brand tagline "Connecting Care. Empowering Lives." | Logo, deck | Owner's own brand line | approved | Brand |
| C-023 | Logo mark (supplied JPEG, rebuilt as SVG) | Sasanka, 2026-09-23 | D-014 | pending (owner confirms reconstruction, Q4) | Brand |

**Adding rows:** new copy that states a fact gets a row *before* it is written into a page.
IDs are never reused.
