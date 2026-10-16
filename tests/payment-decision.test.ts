import { describe, expect, it } from "vitest";
import { decidePayment, PAYMENT_REVIEW_CODES, type PaymentDecision, type PaymentDecisionInput } from "@/server/domain/payment-decision";

import { facts, fixture, rows } from "./payment-cases";

function freeze(value: unknown): void {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
}
const decideFrozen = (input: PaymentDecisionInput): PaymentDecision => {
  const before = structuredClone(input);
  freeze(input);
  const decision = decidePayment(input);
  expect(input).toEqual(before);
  expect(decision.releaseOtherHolders).not.toBe(input.otherHoldingAttemptIds);
  if (decision.settle) {
    expect(input.event.type).toBe("payment.captured");
    expect(decision.attempt).toMatchObject({ status: "captured", holdsQuote: false, settledQuote: true });
    expect(input.quote.status).toBe("open");
    expect(input.attempt.createdAt).toBeLessThanOrEqual(input.quote.validUntil);
    expect(input.quoteHasSettledAttempt).toBe(false);
    expect(input.quoteHasCompetingCapture).toBe(false);
  }
  if (decision.reviewCode) expect(PAYMENT_REVIEW_CODES).toContain(decision.reviewCode);
  return decision;
};
for (const failedAttemptHoldsQuote of [false, true]) {
  for (const lateCaptureOnOpenQuote of ["review", "settle"] as const) {
    describe(`payment decisions hold=${failedAttemptHoldsQuote} capture=${lateCaptureOnOpenQuote}`, () => {
      it.each(rows)("$name", row => {
        const input = facts({ ...row.patch, policy: { failedAttemptHoldsQuote, lateCaptureOnOpenQuote } });
        const decision = decideFrozen(input);
        expect(decision.kind).toBe(row.kind ?? "apply");
        expect(decision.attempt.status).toBe(row.status);
        expect(decision.attempt.holdsQuote).toBe(row.holds === "failurePolicy" ? failedAttemptHoldsQuote : row.holds);
        expect(decision.settle).toBe(row.settle === "capturePolicy" ? lateCaptureOnOpenQuote === "settle" : row.settle);
        expect(decision.reviewCode).toBe(row.review === "capturePolicy" ? lateCaptureOnOpenQuote === "review" ? "late_capture" : null : row.review);
        if (decision.kind !== "apply") expect(decision.attempt).toEqual({ status: input.attempt.status, holdsQuote: input.attempt.holdsQuote, settledQuote: input.attempt.settledQuote, gatewayPaymentId: input.attempt.gatewayPaymentId });
        else expect(decision.attempt.settledQuote).toBe(decision.settle);
        if (!decision.settle) expect(decision.releaseOtherHolders).toEqual([]);
      });
      it("late A capture releases B; later B capture stays unsettled", () => {
        const a = facts({ attempt: { status: "failed", holdsQuote: false }, attemptEverFailed: true,
          otherHoldingAttemptIds: ["attempt_b", "attempt_c"],
          policy: { failedAttemptHoldsQuote, lateCaptureOnOpenQuote } });
        const first = decideFrozen(a);
        expect(first.settle).toBe(lateCaptureOnOpenQuote === "settle");
        expect(first.releaseOtherHolders).toEqual(lateCaptureOnOpenQuote === "settle"
          ? [{ id: "attempt_b", reviewCode: "hold_released_on_settlement" }, { id: "attempt_c", reviewCode: "hold_released_on_settlement" }] : []);
        if (first.settle) {
          const second = decideFrozen(facts({ quote: { status: "paid" }, quoteHasSettledAttempt: true,
            attempt: { holdsQuote: false, gatewayOrderId: "order_b" }, event: { orderId: "order_b", paymentId: "payment_b" },
            policy: { failedAttemptHoldsQuote, lateCaptureOnOpenQuote } }));
          expect(second).toMatchObject({ settle: false, reviewCode: "second_capture", attempt: { status: "captured", holdsQuote: false, settledQuote: false }, releaseOtherHolders: [] });
        }
      });
      it("ordinary capture also releases a competing holder", () => {
        const result = decideFrozen(facts({ otherHoldingAttemptIds: ["attempt_b"], policy: { failedAttemptHoldsQuote, lateCaptureOnOpenQuote } }));
        expect(result.releaseOtherHolders).toEqual([{ id: "attempt_b", reviewCode: "hold_released_on_settlement" }]);
      });
    });
  }
}
describe("payment decision boundaries", () => {
  it("delayed webhook after validity still settles an in-time attempt", () => {
    const input = fixture();
    expect(Date.parse(input.event.occurredAt)).toBeGreaterThan(input.quote.validUntil);
    expect(decideFrozen(input).settle).toBe(true);
  });
  it("attempt creation at validity boundary remains eligible", () => {
    const base = fixture();
    expect(decideFrozen(facts({ attempt: { createdAt: base.quote.validUntil } })).settle).toBe(true);
  });
  it("omitted fake policy defaults to settle", () => {
    expect(decideFrozen(facts({ attempt: { status: "failed", holdsQuote: false }, attemptEverFailed: true })).settle).toBe(true);
  });
  it("duplicate reviewed capture does not later gain settlement", () => {
    expect(decideFrozen(facts({ attempt: { status: "captured", holdsQuote: false, settledQuote: false, gatewayPaymentId: "payment_a" } })).settle).toBe(false);
  });
  it("review codes are unique and match the database alphabet", () => {
    expect(new Set(PAYMENT_REVIEW_CODES).size).toBe(PAYMENT_REVIEW_CODES.length);
    for (const code of PAYMENT_REVIEW_CODES) expect(code).toMatch(/^[a-z][a-z0-9_]{0,63}$/);
  });
});
