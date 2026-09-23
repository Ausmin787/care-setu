---
paths:
  - "app/**"
  - "components/**"
  - "content/**"
  - "src/**"
---
# UI rules (Care Setu)

- **Blueprint first.** UI work follows `~/.claude/FRONTEND-MASTER-BLUEPRINT.md` and the locked
  `DESIGN.md`. Components read semantic tokens, never raw palette values.
- **Mobile-first.** Design at 360px first; verify 360/768/1024/1440 with no horizontal overflow.
- **Accessibility target WCAG 2.2 AA:** real heading outline, labels on every input, visible
  `:focus-visible`, hit targets ≥ 44px on touch, inputs ≥ 16px font (iOS zoom), contrast checked
  on the real background, alt text, reduced-motion correct by default.
- **Elderly-friendly:** body text ≥ 17–18px, generous line height, phone number and primary CTA
  always reachable, no time-limited interactions, no dark patterns.
- **Copy lives in `content/` message files** (D-008), never hardcoded in components. Any factual
  statement needs an approved `docs/CLAIMS.md` row (D-007).
- **No control that doesn't work** (Blueprint §12): no dead CTAs, no fake booking, no invented
  numbers or testimonials.
- **Security:** no `dangerouslySetInnerHTML`; no inline scripts outside the CSP; third-party scripts
  only if listed in TRD §4.
- **SEO:** semantic HTML, unique title/description per page, canonical URLs, sitemap and robots
  (admin `noindex`), structured data only for facts in CLAIMS.
- **Images:** only with recorded provenance and consent; AI images are never presented as real
  people (INVARIANT 16). Fixed aspect-ratio slots so late assets cause no layout shift.
