// Checkpoint 2 contract. Fake gateway only; no real-provider selection.
// Validate only AFTER signature verification over bounded exact raw bytes.
// This envelope describes the dev fake, not a real gateway payload.
import { z } from "zod";

const opaqueId = z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/);
const eventType = z.string().min(1).max(64).regex(/^[a-z][a-z0-9_.-]*$/);
export const WebhookAmountPaise = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);

// Unknown well-formed event types are stored for review. No coercion.
export const FakeWebhookEnvelope = z.strictObject({
  schemaVersion: z.literal(1),
  eventId: opaqueId,
  type: eventType,
  orderId: opaqueId,
  paymentId: opaqueId,
  amountPaise: WebhookAmountPaise,
  currency: z.string().regex(/^[A-Z]{3}$/),
  occurredAt: z.iso.datetime({ offset: true }),
});

// Map only x-care-setu-fake-signature into this object. The signature is
// HMAC-SHA256 over raw bytes. Event id is in the signed body. Never log headers.
export const FakeWebhookSignature = z.strictObject({
  signature: z.string().regex(/^[a-f0-9]{64}$/),
});
export const NormalizedGatewayEvent = FakeWebhookEnvelope.omit({ schemaVersion: true }).extend({
  provider: z.literal("fake"),
  rawBodySha256: z.string().regex(/^[a-f0-9]{64}$/),
});
// Internal development policy, not sender-controlled webhook fields. No real-gateway default.
export const FakeProviderPolicy = z.strictObject({
  failedAttemptHoldsQuote: z.boolean(),
  lateCaptureOnOpenQuote: z.enum(["review", "settle"]).default("settle"),
});
export type FakeProviderPolicy = z.infer<typeof FakeProviderPolicy>;

export const WebhookAcknowledged = z.strictObject({ received: z.literal(true) });
export const WebhookError = z.strictObject({
  error: z.enum([
    "not_available", "too_large", "invalid_json", "invalid",
    "invalid_signature", "temporarily_unavailable",
  ]),
});
export type FakeWebhookEnvelope = z.infer<typeof FakeWebhookEnvelope>;
export type NormalizedGatewayEvent = z.infer<typeof NormalizedGatewayEvent>;
