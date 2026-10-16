import type { FakeProviderPolicy, NormalizedGatewayEvent } from "../contracts/webhooks";

export const PAYMENT_REVIEW_CODES = [
  "unknown_type", "unknown_order", "payment_identity_conflict", "amount_mismatch",
  "currency_mismatch", "attempt_created_after_validity", "quote_closed",
  "second_capture", "quote_settled_elsewhere", "competing_capture", "late_capture", "unknown_outcome", "unsupported_transition",
  "hold_released_on_settlement",
] as const;
type ReviewCode = (typeof PAYMENT_REVIEW_CODES)[number];
type AttemptStatus = "created" | "authorized" | "captured" | "failed" | "unknown";

type AttemptFacts = Readonly<{
  status: AttemptStatus;
  holdsQuote: boolean;
  settledQuote: boolean;
  createdAt: number; // UTC epoch milliseconds, supplied by the caller.
  amountPaise: number;
  currency: string;
  provider: string;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
}>;
export type PaymentDecisionInput = Readonly<{
  attempt: AttemptFacts;
  quote: Readonly<{
    status: "open" | "paid" | "cancelled" | "expired";
    validUntil: number; // UTC epoch milliseconds; not arrival time.
    amountPaise: number;
    currency: string;
  }>;
  quoteHasSettledAttempt: boolean;
  quoteHasCompetingCapture: boolean;
  otherHoldingAttemptIds: readonly string[];
  attemptEverFailed: boolean; // Caller derives this from retained history.
  event: Readonly<NormalizedGatewayEvent>;
  policy: Readonly<FakeProviderPolicy>;
}>;
export type PaymentDecision = Readonly<{
  kind: "apply" | "noop" | "dead";
  attempt: Readonly<{
    status: AttemptStatus;
    holdsQuote: boolean;
    settledQuote: boolean;
    gatewayPaymentId: string | null;
  }>;
  settle: boolean; // Only true for a verified payment.captured event.
  releaseOtherHolders: readonly Readonly<{ id: string; reviewCode: ReviewCode }>[];
  reviewCode: ReviewCode | null;
}>;

// TRUST PRECONDITION: event has passed raw-byte signature verification and zod
// validation. This pure decision function cannot authenticate a gateway event.
// There is deliberately no fetch, Checkout, clock, database or I/O input.
export function decidePayment(input: PaymentDecisionInput): PaymentDecision {
  const { attempt, quote, event, policy } = input;
  const anotherAttemptHoldsQuote = input.otherHoldingAttemptIds.length > 0;
  const unchanged = (kind: "noop" | "dead", reviewCode: ReviewCode | null): PaymentDecision => ({
    kind,
    attempt: {
      status: attempt.status, holdsQuote: attempt.holdsQuote,
      settledQuote: attempt.settledQuote, gatewayPaymentId: attempt.gatewayPaymentId,
    },
    settle: false, releaseOtherHolders: [], reviewCode,
  });
  if (!["payment.authorized", "payment.captured", "payment.failed", "payment.unknown"].includes(event.type)) {
    return unchanged("dead", "unknown_type");
  }
  if (attempt.provider !== event.provider || attempt.gatewayOrderId !== event.orderId) {
    return unchanged("dead", "unknown_order");
  }
  if (attempt.gatewayPaymentId !== null && attempt.gatewayPaymentId !== event.paymentId) {
    return unchanged("dead", "payment_identity_conflict");
  }
  if (event.amountPaise !== attempt.amountPaise || event.amountPaise !== quote.amountPaise) {
    return unchanged("dead", "amount_mismatch");
  }
  if (event.currency !== attempt.currency || event.currency !== quote.currency) {
    return unchanged("dead", "currency_mismatch");
  }
  // A captured fact, including its existing settlement flag, never regresses.
  if (attempt.status === "captured") return unchanged("noop", null);
  const next = event.type.slice("payment.".length) as Exclude<AttemptStatus, "created">;
  if (next === attempt.status) return unchanged("noop", null);
  const previouslyFailed = input.attemptEverFailed || attempt.status === "failed";
  const conflict: ReviewCode | null = input.quoteHasSettledAttempt || quote.status === "paid"
    ? event.type === "payment.captured" ? "second_capture" : "quote_settled_elsewhere"
    : input.quoteHasCompetingCapture ? "competing_capture"
      : quote.status !== "open" ? "quote_closed"
        : attempt.createdAt > quote.validUntil ? "attempt_created_after_validity" : null;
  const changed = (status: AttemptStatus, holdsQuote: boolean, reviewCode: ReviewCode | null, settle = false): PaymentDecision => ({
    kind: "apply",
    attempt: { status, holdsQuote, settledQuote: settle, gatewayPaymentId: event.paymentId },
    settle,
    releaseOtherHolders: settle
      ? input.otherHoldingAttemptIds.map(id => ({ id, reviewCode: "hold_released_on_settlement" as const }))
      : [],
    reviewCode,
  });
  if (next === "captured") {
    if (conflict) return changed("captured", false, conflict);
    if (previouslyFailed && policy.lateCaptureOnOpenQuote === "review") {
      return changed("captured", false, "late_capture");
    }
    return changed("captured", false, null, true);
  }
  if (next === "authorized") {
    if (conflict) return changed("authorized", false, conflict);
    // A released attempt never steals a newer reservation, even on late auth.
    const holds = !anotherAttemptHoldsQuote && (previouslyFailed
      ? policy.failedAttemptHoldsQuote && attempt.holdsQuote : attempt.holdsQuote);
    return changed("authorized", holds, null);
  }
  if (next === "failed") {
    const holds = conflict === null && !anotherAttemptHoldsQuote && policy.failedAttemptHoldsQuote;
    return changed("failed", holds, conflict);
  }
  if (previouslyFailed) return unchanged("noop", "unsupported_transition");
  if (attempt.status === "created" || attempt.status === "authorized") {
    return changed("unknown", conflict === null && !anotherAttemptHoldsQuote && attempt.holdsQuote, conflict ?? "unknown_outcome");
  }
  return unchanged("noop", "unsupported_transition");
}
