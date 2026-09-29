// The privacy notice a consent is given against (INVARIANT 12, D-012). Change the version whenever the notice text
// changes: every consent row stores the version it was given under, and the API accepts only the current one.
export const NOTICE_VERSION = "2026-09-29-draft-1";

// What the consent covers (TRD §5: purpose limitation). Marketing would need a separate opt-in.
export const CONSENT_PURPOSE = "respond-to-care-query";
