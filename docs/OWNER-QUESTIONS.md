# Owner questions — for the Care Setu founders

**How this file works.** Numbered questions are never renumbered or deleted. When one is
answered, its Status becomes `ANSWERED YYYY-MM-DD (D-NNN)` and the answer is recorded as a
decision. `docs-check.mjs` fails if an answered row cites no real D-entry. **Until a question is
answered, nothing defaults it** (INVARIANT 25). Code that depends on it is built behind
configuration, and copy that depends on it is not shown.

Sasanka relays these to the founders (Vishwanath Pratap Singh "Shiva", Ayush Srivastava,
Aashish Singh). Questions marked **blocks** stop the named stage.

| # | Question | Why it matters | Blocks | Status |
|---|---|---|---|---|
| Q1 | Which hosting and database provider will you use, what's the monthly budget, and who owns the accounts? (Suggested pattern: accounts in the company's name, Sasanka added as a member.) | Decides where the site runs. Vercel's free plan forbids commercial use, so a paid plan or a commercial-OK host is needed. | Go-live | Open |
| Q2 | Do you own the domain `caresetu.com` (or another)? Who is the registrar account holder? | Every email and URL in the deck uses it. We can't print a domain you don't own. | Go-live, copy | Open |
| Q3 | What are the real phone number, email address(es), WhatsApp number and office address to publish? | The deck uses a placeholder (`+91 123 456 7890`). Payment gateways require a real contact page. | Contact page | Open |
| Q4 | Please confirm the logo: we're rebuilding the WhatsApp image (lime square, four-arm cross, heart) as a clean vector. Do you have the original design file (Canva/AI/SVG)? What are the exact brand colours and the wordmark font? | Colours sampled from a compressed JPEG are approximate. | Brand sign-off | Open |
| Q5 | What's the status of the LLP (or other entity)? Expected registration date? What legal name should appear in the footer and on invoices? | Payment gateway KYC needs the entity's PAN and a current account. Also sets the copyright holder. | Live payments | Open |
| Q6 | Which services will actually be offered at launch, and which are "coming soon"? Note: medicine delivery (e-pharmacy rules), vaccination, doctor teleconsultation (Telemedicine Practice Guidelines 2020) and equipment on EMI (needs a lending partner) each have legal prerequisites. | We only show what can actually be booked (honesty rule). | Services pages | Open |
| Q7 | Which areas do you serve at launch (Delhi, Noida, Gurugram, Ghaziabad, Faridabad…)? | The Contact form and service pages must say where care is available. | Contact, Services | Open |
| Q8 | Payment policy: is payment in advance, after the visit, or partly both? What are the refund and cancellation rules? | Needed for the Payments flow and the Refund & Cancellation page (a gateway KYC requirement). | Payments, legal | Open |
| Q9 | Promotions: who gets the offer (e.g. first booking only), how much, on which services, can offers stack, and when do they expire? | The discount must be computed server-side from fixed rules. | Promo banner | Open |
| Q10 | Which claims in the vision deck can you back with evidence today? (ISO certificates, HIPAA/ISO 27001, Clinical Establishments Act registration, hospital partnerships (signed agreements), "trusted by thousands", the statistics and their sources.) | A health site can't publish unproven claims or other hospitals' logos. Anything without evidence stays off the site. | Home, About, Services | Open |
| Q11 | Do you have real photographs (team, caregivers, visits)? For anyone pictured, do you have their written consent? The people in the deck appear to be AI-generated. | We won't present AI images as real staff. The design can be type-led until real photos exist. | Design | Open |
| Q12 | Who should receive new-query emails, and what response time will you promise (e.g. "we call back within 2 hours, 8 am–8 pm")? | The alert recipient and any promise shown on the site. | Contact | Open |
| Q13 | How long should query and payment records be kept? Who is the grievance officer (name + email) for data-protection complaints? | DPDP Act 2023 requires a stated purpose, retention limits and a grievance contact. | Privacy page, Contact | Open |
| Q14 | Which lawyer or CA will review the Privacy Policy, Terms and Refund policy drafts? | Legal pages go live only after professional sign-off (D-012). | Legal pages | Open |
| Q15 | Who on your side approves website copy before it goes live? | One named approver avoids conflicting edits. | All copy | Open |
| Q16 | Is a "Partner with us" enquiry form wanted at launch, and who receives partner enquiries? | The deck has a partnership model and a `partnerships@` address. | Partner page | Open |
