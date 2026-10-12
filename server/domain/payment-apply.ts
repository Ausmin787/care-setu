// LOCK ORDER: event -> quote -> all quote attempts ordered by id ascending.
// Failure history is read without event locks. All future quote writers must
// lock the quote before attempts too. No worker, side effect or logging here.
import { and, asc, eq, sql } from "drizzle-orm";
import { NormalizedGatewayEvent, type FakeProviderPolicy } from "../contracts/webhooks";
import type { Db } from "../db/client";
import { fromDbAmount } from "../db/money";
import { gatewayEvents, paymentAttempts, quotes } from "../db/schema";
import { decidePayment, type PaymentDecisionInput } from "./payment-decision";

type ApplyOutcome = "applied" | "noop" | "dead" | "claim_lost";
class ClaimLost extends Error {}

// Only signature-verified receipts may enter gateway_events. The receipt
// boundary belongs to a later unit; this consumes that stored trust boundary.
export async function applyPaymentEvent(
  db: Db, eventId: string, claimToken: string, policy: FakeProviderPolicy,
): Promise<ApplyOutcome> {
  try {
    return await db.transaction(async tx => {
      const [event] = await tx.select().from(gatewayEvents)
        .where(eq(gatewayEvents.id, eventId)).for("update");
      if (!event) return "claim_lost";
      // now() is transaction-stable; the live-clock predicate additionally
      // refuses a lease that expires while waiting for a row lock.
      const owned = and(eq(gatewayEvents.id, eventId), eq(gatewayEvents.status, "processing"),
        eq(gatewayEvents.claimToken, claimToken),
        sql`${gatewayEvents.claimExpiresAt} > now()`,
        sql`${gatewayEvents.claimExpiresAt} > clock_timestamp()`);
      const [claim] = await tx.select({ id: gatewayEvents.id }).from(gatewayEvents).where(owned);
      if (!claim) return "claim_lost";
      const finish = async (kind: "applied" | "noop" | "dead", attemptId: string | null, reviewCode: string | null) => {
        const rows = await tx.update(gatewayEvents).set({
          status: kind === "dead" ? "dead" : "processed",
          paymentAttemptId: attemptId,
          processedAt: kind === "dead" ? null : sql`now()`,
          lastErrorCode: kind === "dead" ? reviewCode : null,
          reviewCode, claimToken: null, claimExpiresAt: null, updatedAt: sql`now()`,
        }).where(owned).returning({ id: gatewayEvents.id });
        if (rows.length === 0) throw new ClaimLost(); // rollback ALL tentative effects.
        return kind;
      };
      const [resolved] = await tx.select({ id: paymentAttempts.id, quoteId: paymentAttempts.quoteId })
        .from(paymentAttempts).where(and(eq(paymentAttempts.provider, event.provider),
          eq(paymentAttempts.gatewayOrderId, event.gatewayOrderId)));
      if (!resolved) return finish("dead", null, "unknown_order");
      const [quote] = await tx.select().from(quotes).where(eq(quotes.id, resolved.quoteId)).for("update");
      const attempts = await tx.select().from(paymentAttempts)
        .where(eq(paymentAttempts.quoteId, resolved.quoteId)).orderBy(asc(paymentAttempts.id)).for("update");
      const attempt = attempts.find(row => row.id === resolved.id
        && row.provider === event.provider && row.gatewayOrderId === event.gatewayOrderId);
      if (!quote || !attempt) return finish("dead", null, "unknown_order");
      // Validate every used DB amount at the one number/bigint boundary.
      for (const row of attempts) fromDbAmount(row.amountPaise);
      const [failure] = await tx.select({ id: gatewayEvents.id }).from(gatewayEvents).where(and(
        eq(gatewayEvents.paymentAttemptId, attempt.id), eq(gatewayEvents.status, "processed"),
        eq(gatewayEvents.eventType, "payment.failed"))).limit(1);
      const normalized = NormalizedGatewayEvent.parse({
        provider: event.provider, eventId: event.providerEventId, type: event.eventType,
        orderId: event.gatewayOrderId, paymentId: event.gatewayPaymentId,
        amountPaise: fromDbAmount(event.amountPaise), currency: event.currency,
        occurredAt: event.occurredAt.toISOString(), rawBodySha256: event.rawBodySha256,
      });
      const decision = decidePayment({
        attempt: { status: attempt.status as PaymentDecisionInput["attempt"]["status"],
          holdsQuote: attempt.holdsQuote, settledQuote: attempt.settledQuote,
          createdAt: attempt.createdAt.getTime(), amountPaise: fromDbAmount(attempt.amountPaise),
          currency: attempt.currency, provider: attempt.provider, gatewayOrderId: attempt.gatewayOrderId,
          gatewayPaymentId: attempt.gatewayPaymentId },
        quote: { status: quote.status as PaymentDecisionInput["quote"]["status"],
          validUntil: quote.validUntil.getTime(), amountPaise: fromDbAmount(quote.amountPaise), currency: quote.currency },
        quoteHasSettledAttempt: attempts.some(row => row.settledQuote),
        quoteHasCompetingCapture: attempts.some(row => row.id !== attempt.id && row.status === "captured"),
        otherHoldingAttemptIds: attempts.filter(row => row.id !== attempt.id && row.holdsQuote).map(row => row.id),
        attemptEverFailed: attempt.status === "failed" || Boolean(failure), event: normalized, policy,
      });
      if (decision.kind === "apply") {
        for (const release of decision.releaseOtherHolders) {
          await tx.update(paymentAttempts).set({ holdsQuote: false, reviewCode: release.reviewCode, updatedAt: sql`now()` })
            .where(eq(paymentAttempts.id, release.id));
        }
        await tx.update(paymentAttempts).set({ ...decision.attempt, reviewCode: decision.reviewCode ?? attempt.reviewCode, updatedAt: sql`now()` })
          .where(eq(paymentAttempts.id, attempt.id));
        if (decision.settle) await tx.update(quotes).set({ status: "paid", updatedAt: sql`now()` }).where(eq(quotes.id, quote.id));
      }
      // Noop/dead leave the attempt and its existing review marker untouched.
      return finish(decision.kind === "apply" ? "applied" : decision.kind, attempt.id, decision.reviewCode);
    }, { isolationLevel: "read committed" });
  } catch (error) {
    if (error instanceof ClaimLost) return "claim_lost";
    throw error;
  }
}
