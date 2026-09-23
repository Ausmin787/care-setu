# Compliance watch-list (NOT legal advice)

**Status:** v0.1 · 2026-09-23 · Written by Claude from general knowledge **without** a primary-source
check in this session. Every row carries a confidence level and must be verified by the owners'
lawyer or CA (Q14) before anything depends on it (D-012, INVARIANT 24). When a row is verified,
add the source URL and date, and a D-entry if it changes the build.

Confidence: **H** well established · **M** likely, details or dates may be off · **L** uncertain, verify first.

| Area | What we believe | Conf. | What the website does about it | Verified |
|---|---|---|---|---|
| **DPDP Act 2023** | Governs digital personal data: notice, consent that is free, specific, informed and unambiguous, purpose limitation, security safeguards, breach notification, rights (access, correction, erasure, grievance), grievance redressal contact. | H | Consent checkbox + versioned notice (INVARIANT 12), minimal fields, retention config, grievance contact on Privacy page (Q13) | — |
| **DPDP Rules** | Rules notified in late 2025 with phased commencement; most obligations apply after a transition period (reportedly ~18 months). Exact dates must be checked. | M | Build to the Act's standard now; don't claim "DPDP compliant" (C-005) | — |
| **Health data sensitivity** | The DPDP Act has no separate "sensitive" category, but health information raises breach impact and reputational risk; the SPDI Rules 2011 under the IT Act historically classed health data as sensitive. | M | Admin-only access to messages, audit log, no third-party AI (D-010) | — |
| **Payment gateway onboarding** | Indian gateways typically require live pages for Contact (with real address/phone), Terms, Privacy, and Refund & Cancellation before approving KYC, plus entity PAN, bank account and business proof. | M-H | Legal pages drafted (D-012); live payments wait for LLP (D-003) | — |
| **Card data** | Using the gateway's hosted checkout keeps card data out of our systems (PCI DSS scope stays with the gateway). | H | Never collect card/UPI details in our own forms | — |
| **Telemedicine** | Telemedicine Practice Guidelines (2020) govern doctor teleconsultation: registered practitioner, patient identification and consent, prescription limits by drug list. | H (existence) / M (details) | Teleconsult is not offered in Phase 1; any copy about it waits for Q6 | — |
| **Online medicine sales** | E-pharmacy rules were drafted (2018) but a final regime has been unsettled; selling or delivering prescription drugs needs licensed pharmacy involvement under the Drugs and Cosmetics Act. | M | "Medicine delivery" shown only if a licensed partner exists (Q6, C-018) | — |
| **Clinical Establishments** | The Clinical Establishments Act 2010 applies only in states/UTs that adopted it; Delhi has its own nursing-home registration law. Whether a home-care aggregator needs registration is unclear. | L | No "CEA compliant" claim (C-004) | — |
| **Home nursing / attendant agencies** | No single national licence; state rules, labour law and police verification practices vary. | L | Describe the actual vetting process only (C-015) | — |
| **Equipment on EMI** | Offering credit requires a regulated lender; digital lending is governed by RBI directions (disclosures, key fact statement, lender named). | M | No EMI offer until a lending partner exists (C-019) | — |
| **Vaccination at home** | Requires qualified staff, cold chain and adverse-event handling; "WHO recommended" needs a source. | L | Shown only if live (Q6, C-017) | — |
| **Misleading advertising** | Consumer Protection Act 2019 + CCPA misleading-ads guidelines (2022): claims must be substantiated. The Drugs and Magic Remedies (Objectionable Advertisements) Act restricts some health claims. Doctors are bound by NMC advertising ethics. | M | Claims register (D-007) | — |
| **GST** | Healthcare services by clinical establishments and authorised practitioners are broadly exempt, but a platform's commission/fee is likely taxable. Classification depends on structure. | L | Not a website concern; CA decides; invoices out of scope for Phase 1 | — |
| **Accessibility** | The RPwD Act 2016 and Indian accessibility standards (GIGW for government) point to WCAG 2.x AA as the practical target. | M | WCAG 2.2 AA target in the verify gate | — |
| **Cookies / analytics** | Non-essential tracking falls under DPDP consent logic. | M | Cookie-less analytics or none; no ad pixels in Phase 1 | — |

**Open for the lawyer/CA (add to Q14 hand-off):** registration needs for a home-care aggregator
in Delhi NCR; whether providers are contractors or employees (affects claims about "our nurses");
retention periods; the payment-flow structure (the platform collects then pays providers:
marketplace/escrow implications, nodal account rules); GST on the platform share.
