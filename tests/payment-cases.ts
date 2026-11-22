import { FakeProviderPolicy } from "@/server/contracts/webhooks";
import type { PaymentDecision, PaymentDecisionInput } from "@/server/domain/payment-decision";

export const fixture = (): PaymentDecisionInput => ({
  attempt: {
    status: "created", holdsQuote: true, settledQuote: false,
    createdAt: Date.parse("2026-01-01T00:00:00Z"), amountPaise: 100, currency: "INR",
    provider: "fake", gatewayOrderId: "order_a", gatewayPaymentId: null,
  },
  quote: { status: "open", validUntil: Date.parse("2026-01-02T00:00:00Z"), amountPaise: 100, currency: "INR" },
  quoteHasSettledAttempt: false, quoteHasCompetingCapture: false,
  otherHoldingAttemptIds: [], attemptEverFailed: false,
  event: { provider: "fake", eventId: "event_a", type: "payment.captured", orderId: "order_a",
    paymentId: "payment_a", amountPaise: 100, currency: "INR", occurredAt: "2026-01-03T00:00:00Z", rawBodySha256: "a".repeat(64) },
  policy: FakeProviderPolicy.parse({ failedAttemptHoldsQuote: false }),
});
type Patch = Omit<Partial<PaymentDecisionInput>, "attempt" | "quote" | "event"> & {
  attempt?: Partial<PaymentDecisionInput["attempt"]>;
  quote?: Partial<PaymentDecisionInput["quote"]>;
  event?: Partial<PaymentDecisionInput["event"]>;
};
export const facts = (patch: Patch): PaymentDecisionInput => {
  const base = fixture();
  return { ...base, ...patch, attempt: { ...base.attempt, ...patch.attempt },
    quote: { ...base.quote, ...patch.quote }, event: { ...base.event, ...patch.event } };
};
type Row = { name: string; patch: Patch; kind?: PaymentDecision["kind"]; status: PaymentDecision["attempt"]["status"];
  holds: boolean | "failurePolicy"; settle: boolean | "capturePolicy"; review: PaymentDecision["reviewCode"] | "capturePolicy" };
export const rows: Row[] = [
  { name: "created authorizes", patch: { event: { type: "payment.authorized" } }, status: "authorized", holds: true, settle: false, review: null },
  { name: "unknown authorizes", patch: { attempt: { status: "unknown" }, event: { type: "payment.authorized" } }, status: "authorized", holds: true, settle: false, review: null },
  ...(["created", "authorized", "unknown"] as const).map(status => ({ name: `${status} captures ordinarily`, patch: { attempt: { status } }, status: "captured" as const, holds: false, settle: true, review: null })),
  ...(["created", "authorized", "unknown"] as const).map(status => ({ name: `${status} fails`, patch: { attempt: { status }, event: { type: "payment.failed" } }, status: "failed" as const, holds: "failurePolicy" as const, settle: false, review: null })),
  ...(["created", "authorized"] as const).map(status => ({ name: `${status} becomes unknown`, patch: { attempt: { status }, event: { type: "payment.unknown" } }, status: "unknown" as const, holds: true, settle: false, review: "unknown_outcome" as const })),
  { name: "failed active holder late authorizes", patch: { attempt: { status: "failed" }, attemptEverFailed: true, event: { type: "payment.authorized" } }, status: "authorized", holds: "failurePolicy", settle: false, review: null },
  { name: "failed released attempt late authorizes without stealing", patch: { attempt: { status: "failed", holdsQuote: false }, attemptEverFailed: true, otherHoldingAttemptIds: ["attempt_b"], event: { type: "payment.authorized" } }, status: "authorized", holds: false, settle: false, review: null },
  { name: "failed late captures by configured policy", patch: { attempt: { status: "failed", holdsQuote: false }, attemptEverFailed: true }, status: "captured", holds: false, settle: "capturePolicy", review: "capturePolicy" },
  { name: "late authorization retains prior-failure capture policy", patch: { attempt: { status: "authorized" }, attemptEverFailed: true }, status: "captured", holds: false, settle: "capturePolicy", review: "capturePolicy" },
  ...(["payment.authorized", "payment.captured"] as const).map(type => ({ name: `${type} after-validity creation`, patch: { attempt: { createdAt: Date.parse("2026-01-03T00:00:00Z") }, event: { type } }, status: type === "payment.captured" ? "captured" as const : "authorized" as const, holds: false, settle: false, review: "attempt_created_after_validity" as const })),
  ...(["cancelled", "expired"] as const).flatMap(status => (["payment.authorized", "payment.captured"] as const).map(type => ({ name: `${type} on ${status} quote`, patch: { quote: { status }, event: { type } }, status: type === "payment.captured" ? "captured" as const : "authorized" as const, holds: false, settle: false, review: "quote_closed" as const }))),
  ...(["payment.authorized", "payment.failed", "payment.unknown"] as const).flatMap(type => [false, true].map(settled => ({ name: `${type} reviews settled quote without claiming second capture ${settled}`, patch: { quote: { status: settled ? "open" as const : "paid" as const }, quoteHasSettledAttempt: settled, event: { type } }, status: type === "payment.authorized" ? "authorized" as const : type === "payment.failed" ? "failed" as const : "unknown" as const, holds: false, settle: false, review: "quote_settled_elsewhere" as const }))),
  { name: "capture on paid quote", patch: { quote: { status: "paid" } }, status: "captured", holds: false, settle: false, review: "second_capture" },
  { name: "second capture even if quote snapshot is open", patch: { quoteHasSettledAttempt: true }, status: "captured", holds: false, settle: false, review: "second_capture" },
  { name: "competing capture forbids settlement", patch: { quoteHasCompetingCapture: true }, status: "captured", holds: false, settle: false, review: "competing_capture" },
  { name: "duplicate captured payment preserves settled flag", patch: { attempt: { status: "captured", holdsQuote: false, settledQuote: true, gatewayPaymentId: "payment_a" }, quote: { status: "paid" }, quoteHasSettledAttempt: true }, kind: "noop", status: "captured", holds: false, settle: false, review: null },
  ...(["payment.authorized", "payment.failed", "payment.unknown"] as const).map(type => ({ name: `captured ignores earlier ${type}`, patch: { attempt: { status: "captured" as const, holdsQuote: false, settledQuote: true, gatewayPaymentId: "payment_a" }, event: { type } }, kind: "noop" as const, status: "captured" as const, holds: false, settle: false, review: null })),
  { name: "unknown type has no effect", patch: { event: { type: "payment.future" } }, kind: "dead", status: "created", holds: true, settle: false, review: "unknown_type" },
  { name: "unknown order has no effect", patch: { event: { orderId: "order_other" } }, kind: "dead", status: "created", holds: true, settle: false, review: "unknown_order" },
  { name: "unresolved order has no effect", patch: { attempt: { gatewayOrderId: null } }, kind: "dead", status: "created", holds: true, settle: false, review: "unknown_order" },
  { name: "wrong provider has no effect", patch: { attempt: { provider: "other" } }, kind: "dead", status: "created", holds: true, settle: false, review: "unknown_order" },
  { name: "payment id conflict has no effect", patch: { attempt: { gatewayPaymentId: "payment_other" } }, kind: "dead", status: "created", holds: true, settle: false, review: "payment_identity_conflict" },
  { name: "event amount mismatch has no effect", patch: { event: { amountPaise: 101 } }, kind: "dead", status: "created", holds: true, settle: false, review: "amount_mismatch" },
  { name: "attempt versus quote amount mismatch has no effect", patch: { quote: { amountPaise: 101 } }, kind: "dead", status: "created", holds: true, settle: false, review: "amount_mismatch" },
  { name: "event currency mismatch has no effect", patch: { event: { currency: "USD" } }, kind: "dead", status: "created", holds: true, settle: false, review: "currency_mismatch" },
  { name: "attempt versus quote currency mismatch has no effect", patch: { quote: { currency: "USD" } }, kind: "dead", status: "created", holds: true, settle: false, review: "currency_mismatch" },
  { name: "unknown after released failure preserves history", patch: { attempt: { status: "failed", holdsQuote: false }, attemptEverFailed: true, event: { type: "payment.unknown" } }, kind: "noop", status: "failed", holds: false, settle: false, review: "unsupported_transition" },
  { name: "duplicate failure does not reapply a changed hold policy", patch: { attempt: { status: "failed", holdsQuote: false }, event: { type: "payment.failed" } }, kind: "noop", status: "failed", holds: false, settle: false, review: null },
];
