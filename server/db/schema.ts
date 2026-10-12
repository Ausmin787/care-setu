import { sql } from "drizzle-orm";
import { bigint, boolean, check, foreignKey, index, integer, jsonb, unique, uniqueIndex, type AnyPgColumn } from "drizzle-orm/pg-core";
import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { AREAS, PATIENT_LOCATIONS, QUERY_STATUSES } from "../contracts/enums";

// Migration 0001 (D-033): a care query and the consent it was sent with. Personal data lives in `queries` only
// (TRD Â§5); nothing here is logged. Changes ship as migration files only (D-002, INVARIANT 14).

export const patientLocation = pgEnum("patient_location", PATIENT_LOCATIONS);
export const area = pgEnum("area", AREAS);
export const queryStatus = pgEnum("query_status", QUERY_STATUSES);

const stamp = (name: string) => timestamp(name, { withTimezone: true }).notNull().defaultNow();

export const queries = pgTable("queries", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: varchar("reference", { length: 10 }).notNull().unique(),
  patientLocation: patientLocation("patient_location").notNull(),
  // Null when the family isn't sure which service they need.
  serviceSlug: text("service_slug"),
  area: area("area").notNull(),
  message: varchar("message", { length: 1000 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 13 }).notNull(),
  email: varchar("email", { length: 254 }),
  status: queryStatus("status").notNull().default("new"),
  sourcePage: varchar("source_page", { length: 200 }).notNull(),
  createdAt: stamp("created_at"),
  updatedAt: stamp("updated_at").$onUpdate(() => new Date()),
});

// INVARIANT 12: stored in the same transaction as its query. No IP or user-agent hash (D-033: data minimisation).
export const consents = pgTable("consents", {
  id: uuid("id").primaryKey().defaultRandom(),
  queryId: uuid("query_id")
    .notNull()
    .references(() => queries.id, { onDelete: "cascade" }),
  noticeVersion: varchar("notice_version", { length: 40 }).notNull(),
  purpose: varchar("purpose", { length: 60 }).notNull(),
  grantedAt: stamp("granted_at"),
});

// Foundation Checkpoint 2 schema. Migration generated separately.
// Existing queries/consents stay unchanged; domain implementation awaits review.

export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  queryId: uuid("query_id").notNull().references(() => queries.id, { onDelete: "restrict" }),
  reference: varchar("reference", { length: 12 }).notNull(),
  service: varchar("service", { length: 100 }).notNull(),
  detail: varchar("detail", { length: 1000 }).notNull(),
  startsOn: timestamp("starts_on", { withTimezone: true }).notNull(),
  validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
  amountPaise: bigint("amount_paise", { mode: "bigint" }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  status: varchar("status", { length: 16 }).notNull().default("open"),
  // Nullable internal identity only; Admin owns the future staff FK.
  issuerId: uuid("issuer_id"),
  supersedesId: uuid("supersedes_id").references((): AnyPgColumn => quotes.id, { onDelete: "restrict" }),
  createdAt: stamp("created_at"),
  updatedAt: stamp("updated_at"),
}, (t) => [
  unique("quotes_amount_identity_unique").on(t.id, t.amountPaise, t.currency),
  uniqueIndex("quotes_reference_unique").on(t.reference),
  index("quotes_query_idx").on(t.queryId),
  index("quotes_supersedes_idx").on(t.supersedesId),
  check("quotes_reference_valid", sql`${t.reference} ~ '^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8,12}$' AND ${t.reference} NOT LIKE 'QT%'`),
  check("quotes_amount_safe", sql`${t.amountPaise} BETWEEN 1 AND 9007199254740991`),
  check("quotes_currency_valid", sql`${t.currency} ~ '^[A-Z]{3}$'`),
  check("quotes_status_valid", sql`${t.status} IN ('open', 'paid', 'expired', 'cancelled')`),
  check("quotes_validity_valid", sql`${t.validUntil} > ${t.createdAt}`),
  check("quotes_not_self_superseding", sql`${t.supersedesId} IS NULL OR ${t.supersedesId} <> ${t.id}`),
]);

export const paymentAttempts = pgTable("payment_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  quoteId: uuid("quote_id").notNull().references(() => quotes.id, { onDelete: "restrict" }),
  provider: varchar("provider", { length: 32 }).notNull(),
  // Null until an order is created; unknown external outcomes remain recoverable.
  gatewayOrderId: varchar("gateway_order_id", { length: 128 }),
  gatewayPaymentId: varchar("gateway_payment_id", { length: 128 }),
  amountPaise: bigint("amount_paise", { mode: "bigint" }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  status: varchar("status", { length: 16 }).notNull().default("created"),
  // Explicit provider-policy value, no DB default or hardcoded state predicate.
  holdsQuote: boolean("holds_quote").notNull(),
  // Only the transaction that marks this quote paid sets this flag.
  settledQuote: boolean("settled_quote").notNull().default(false),
  fetchedStatus: varchar("fetched_status", { length: 16 }),
  fetchedAmountPaise: bigint("fetched_amount_paise", { mode: "bigint" }),
  fetchedCurrency: varchar("fetched_currency", { length: 3 }),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }),
  reviewCode: varchar("review_code", { length: 64 }),
  createdAt: stamp("created_at"),
  updatedAt: stamp("updated_at"),
}, (t) => [
  uniqueIndex("attempts_provider_order_unique").on(t.provider, t.gatewayOrderId).where(sql`${t.gatewayOrderId} IS NOT NULL`),
  uniqueIndex("attempts_provider_payment_unique").on(t.provider, t.gatewayPaymentId).where(sql`${t.gatewayPaymentId} IS NOT NULL`),
  uniqueIndex("attempts_one_holding_quote").on(t.quoteId).where(sql`${t.holdsQuote} = true`),
  uniqueIndex("attempts_one_settled_quote").on(t.quoteId).where(sql`${t.settledQuote} = true`),
  unique("attempts_identity_unique").on(t.id, t.provider, t.gatewayOrderId),
  foreignKey({ name: "attempts_quote_amount_fk", columns: [t.quoteId, t.amountPaise, t.currency], foreignColumns: [quotes.id, quotes.amountPaise, quotes.currency] }).onDelete("restrict").onUpdate("no action"),
  index("attempts_reconcile_idx").on(t.updatedAt, t.id).where(sql`${t.status} <> 'captured'`),
  check("attempts_provider_valid", sql`${t.provider} ~ '^[a-z][a-z0-9_-]{0,31}$'`),
  check("attempts_order_valid", sql`${t.gatewayOrderId} IS NULL OR ${t.gatewayOrderId} ~ '^[A-Za-z0-9_-]{1,128}$'`),
  check("attempts_payment_valid", sql`${t.gatewayPaymentId} IS NULL OR ${t.gatewayPaymentId} ~ '^[A-Za-z0-9_-]{1,128}$'`),
  check("attempts_amount_safe", sql`${t.amountPaise} BETWEEN 1 AND 9007199254740991`),
  check("attempts_currency_valid", sql`${t.currency} ~ '^[A-Z]{3}$'`),
  check("attempts_status_valid", sql`${t.status} IN ('created', 'authorized', 'captured', 'failed', 'unknown')`),
  check("attempts_settled_captured", sql`${t.settledQuote} = false OR ${t.status} = 'captured'`),
  check("attempts_captured_released", sql`${t.status} <> 'captured' OR ${t.holdsQuote} = false`),
  check("attempts_settlement_identity", sql`${t.status} NOT IN ('authorized', 'captured') OR (${t.gatewayOrderId} IS NOT NULL AND ${t.gatewayPaymentId} IS NOT NULL)`),
  check("attempts_fetch_complete", sql`(${t.fetchedAt} IS NULL AND ${t.fetchedStatus} IS NULL AND ${t.fetchedAmountPaise} IS NULL AND ${t.fetchedCurrency} IS NULL) OR (${t.fetchedAt} IS NOT NULL AND ${t.fetchedStatus} IS NOT NULL AND ${t.fetchedAmountPaise} IS NOT NULL AND ${t.fetchedCurrency} IS NOT NULL AND ${t.fetchedAmountPaise} BETWEEN 1 AND 9007199254740991 AND ${t.fetchedCurrency} ~ '^[A-Z]{3}$')`),
  check("attempts_fetch_status_valid", sql`${t.fetchedStatus} IS NULL OR ${t.fetchedStatus} IN ('created', 'authorized', 'captured', 'failed', 'unknown')`),
  check("attempts_review_code_valid", sql`${t.reviewCode} IS NULL OR ${t.reviewCode} ~ '^[a-z][a-z0-9_]{0,63}$'`),
]);

export const gatewayEvents = pgTable("gateway_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: varchar("provider", { length: 32 }).notNull(),
  providerEventId: varchar("provider_event_id", { length: 128 }).notNull(),
  eventType: varchar("event_type", { length: 64 }).notNull(),
  gatewayOrderId: varchar("gateway_order_id", { length: 128 }).notNull(),
  gatewayPaymentId: varchar("gateway_payment_id", { length: 128 }).notNull(),
  // Unresolved on receipt/unknown order; mapped to our internal id by the worker.
  paymentAttemptId: uuid("payment_attempt_id"),
  amountPaise: bigint("amount_paise", { mode: "bigint" }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  rawBodySha256: varchar("raw_body_sha256", { length: 64 }).notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  receivedAt: stamp("received_at"),
  status: varchar("status", { length: 16 }).notNull().default("received"),
  claimToken: uuid("claim_token"),
  claimExpiresAt: timestamp("claim_expires_at", { withTimezone: true }),
  attempts: integer("attempts").notNull().default(0),
  nextAttemptAt: stamp("next_attempt_at"),
  lastErrorCode: varchar("last_error_code", { length: 64 }),
  reviewCode: varchar("review_code", { length: 64 }),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  updatedAt: stamp("updated_at"),
}, (t) => [
  uniqueIndex("events_provider_event_unique").on(t.provider, t.providerEventId),
  foreignKey({ name: "events_attempt_identity_fk", columns: [t.paymentAttemptId, t.provider, t.gatewayOrderId], foreignColumns: [paymentAttempts.id, paymentAttempts.provider, paymentAttempts.gatewayOrderId] }).onDelete("restrict"),
  index("events_attempt_idx").on(t.paymentAttemptId),
  index("events_due_idx").on(t.nextAttemptAt, t.id).where(sql`${t.status} IN ('received', 'failed')`),
  index("events_expired_claim_idx").on(t.claimExpiresAt, t.id).where(sql`${t.status} = 'processing'`),
  index("events_review_idx").on(t.receivedAt, t.id).where(sql`${t.reviewCode} IS NOT NULL`),
  check("events_provider_valid", sql`${t.provider} ~ '^[a-z][a-z0-9_-]{0,31}$'`),
  check("events_ids_valid", sql`${t.providerEventId} ~ '^[A-Za-z0-9_-]{1,128}$' AND ${t.gatewayOrderId} ~ '^[A-Za-z0-9_-]{1,128}$' AND ${t.gatewayPaymentId} ~ '^[A-Za-z0-9_-]{1,128}$'`),
  check("events_type_valid", sql`${t.eventType} ~ '^[a-z][a-z0-9_.-]{0,63}$'`),
  check("events_amount_safe", sql`${t.amountPaise} BETWEEN 1 AND 9007199254740991`),
  check("events_currency_valid", sql`${t.currency} ~ '^[A-Z]{3}$'`),
  check("events_hash_valid", sql`${t.rawBodySha256} ~ '^[a-f0-9]{64}$'`),
  check("events_status_valid", sql`${t.status} IN ('received', 'processing', 'processed', 'failed', 'dead')`),
  check("events_claim_valid", sql`(${t.status} = 'processing' AND ${t.claimToken} IS NOT NULL AND ${t.claimExpiresAt} IS NOT NULL) OR (${t.status} <> 'processing' AND ${t.claimToken} IS NULL AND ${t.claimExpiresAt} IS NULL)`),
  check("events_attempts_valid", sql`${t.attempts} >= 0 AND (${t.status} <> 'processing' OR ${t.attempts} > 0)`),
  check("events_processed_valid", sql`(${t.status} = 'processed' AND ${t.processedAt} IS NOT NULL AND ${t.paymentAttemptId} IS NOT NULL) OR (${t.status} <> 'processed' AND ${t.processedAt} IS NULL)`),
  check("events_failure_valid", sql`${t.status} NOT IN ('failed', 'dead') OR ${t.lastErrorCode} IS NOT NULL`),
  check("events_dead_review", sql`${t.status} <> 'dead' OR ${t.reviewCode} IS NOT NULL`),
  check("events_error_code_valid", sql`${t.lastErrorCode} IS NULL OR ${t.lastErrorCode} ~ '^[a-z][a-z0-9_]{0,63}$'`),
  check("events_review_code_valid", sql`${t.reviewCode} IS NULL OR ${t.reviewCode} ~ '^[a-z][a-z0-9_]{0,63}$'`),
]);

export const idempotencyKeys = pgTable("idempotency_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Internal principal only; no public client-key contract in Foundation.
  principalId: uuid("principal_id").notNull(),
  route: varchar("route", { length: 128 }).notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  requestHash: varchar("request_hash", { length: 64 }).notNull(),
  // Preallocated effect UUID; recovery searches by this internal id, never PII.
  operationId: uuid("operation_id").notNull(),
  effectKind: varchar("effect_kind", { length: 32 }).notNull(),
  queryId: uuid("query_id").references(() => queries.id, { onDelete: "restrict" }),
  paymentAttemptId: uuid("payment_attempt_id").references(() => paymentAttempts.id, { onDelete: "restrict" }),
  status: varchar("status", { length: 16 }).notNull().default("in_progress"),
  responseStatus: integer("response_status"),
  // Keys AND values are validated by the later helper; SQL restricts object keys.
  responseBody: jsonb("response_body"),
  claimToken: uuid("claim_token"),
  claimExpiresAt: timestamp("claim_expires_at", { withTimezone: true }),
  createdAt: stamp("created_at"),
  updatedAt: stamp("updated_at"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (t) => [
  uniqueIndex("idempotency_scope_key_unique").on(t.principalId, t.route, t.key),
  uniqueIndex("idempotency_operation_unique").on(t.operationId),
  index("idempotency_stale_idx").on(t.claimExpiresAt, t.id).where(sql`${t.status} = 'in_progress'`),
  index("idempotency_done_expiry_idx").on(t.expiresAt, t.id).where(sql`${t.status} = 'done'`),
  index("idempotency_query_idx").on(t.queryId),
  index("idempotency_attempt_idx").on(t.paymentAttemptId),
  check("idempotency_route_valid", sql`${t.route} ~ '^/api/v1/[a-z0-9/_-]{1,119}$'`),
  check("idempotency_key_valid", sql`${t.key} ~ '^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'`),
  check("idempotency_hash_valid", sql`${t.requestHash} ~ '^[a-f0-9]{64}$'`),
  check("idempotency_kind_valid", sql`${t.effectKind} IN ('query', 'payment_attempt')`),
  check("idempotency_effect_valid", sql`(${t.effectKind} = 'query' AND ${t.paymentAttemptId} IS NULL AND (${t.queryId} IS NULL OR ${t.queryId} = ${t.operationId})) OR (${t.effectKind} = 'payment_attempt' AND ${t.queryId} IS NULL AND (${t.paymentAttemptId} IS NULL OR ${t.paymentAttemptId} = ${t.operationId}))`),
  check("idempotency_lifecycle_valid", sql`(${t.status} = 'in_progress' AND ${t.claimToken} IS NOT NULL AND ${t.claimExpiresAt} IS NOT NULL AND ${t.responseStatus} IS NULL AND ${t.responseBody} IS NULL) OR (${t.status} = 'done' AND ${t.claimToken} IS NULL AND ${t.claimExpiresAt} IS NULL AND ${t.responseStatus} IS NOT NULL AND ${t.responseStatus} BETWEEN 200 AND 599 AND ${t.responseBody} IS NOT NULL)`),
  check("idempotency_expiry_valid", sql`${t.expiresAt} >= ${t.createdAt} + INTERVAL '24 hours' AND (${t.claimExpiresAt} IS NULL OR ${t.expiresAt} > ${t.claimExpiresAt})`),
  check("idempotency_success_effect", sql`${t.status} <> 'done' OR ${t.responseStatus} >= 400 OR (${t.effectKind} = 'query' AND ${t.queryId} IS NOT NULL) OR (${t.effectKind} = 'payment_attempt' AND ${t.paymentAttemptId} IS NOT NULL)`),
  check("idempotency_body_allowlist", sql`${t.responseBody} IS NULL OR (jsonb_typeof(${t.responseBody}) = 'object' AND ${t.responseBody} - ARRAY['reference', 'error', 'id']::text[] = '{}'::jsonb)`),
]);

export const outbox = pgTable("outbox", {
  // Internal row id is the stable delivery key.
  id: uuid("id").primaryKey().defaultRandom(),
  kind: varchar("kind", { length: 32 }).notNull(),
  queryId: uuid("query_id").references(() => queries.id, { onDelete: "restrict" }),
  paymentAttemptId: uuid("payment_attempt_id").references(() => paymentAttempts.id, { onDelete: "restrict" }),
  status: varchar("status", { length: 16 }).notNull().default("pending"),
  // Claimed rows stay pending; token/expiry carry ownership.
  claimToken: uuid("claim_token"),
  claimExpiresAt: timestamp("claim_expires_at", { withTimezone: true }),
  attempts: integer("attempts").notNull().default(0),
  nextAttemptAt: stamp("next_attempt_at"),
  lastErrorCode: varchar("last_error_code", { length: 64 }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  // Admin owns this identity; no staff FK and no replay API in Foundation.
  replayedById: uuid("replayed_by_id"),
  replayedAt: timestamp("replayed_at", { withTimezone: true }),
  createdAt: stamp("created_at"),
  updatedAt: stamp("updated_at"),
}, (t) => [
  uniqueIndex("outbox_query_alert_unique").on(t.queryId, t.kind).where(sql`${t.kind} = 'query_alert'`),
  uniqueIndex("outbox_payment_followup_unique").on(t.paymentAttemptId, t.kind).where(sql`${t.kind} = 'payment_followup'`),
  index("outbox_due_idx").on(t.nextAttemptAt, t.id).where(sql`${t.status} = 'pending' AND ${t.claimToken} IS NULL`),
  index("outbox_expired_claim_idx").on(t.claimExpiresAt, t.id).where(sql`${t.status} = 'pending' AND ${t.claimToken} IS NOT NULL`),
  index("outbox_dead_idx").on(t.createdAt, t.id).where(sql`${t.status} = 'dead'`),
  check("outbox_target_valid", sql`(${t.kind} = 'query_alert' AND ${t.queryId} IS NOT NULL AND ${t.paymentAttemptId} IS NULL) OR (${t.kind} = 'payment_followup' AND ${t.paymentAttemptId} IS NOT NULL AND ${t.queryId} IS NULL)`),
  check("outbox_status_valid", sql`${t.status} IN ('pending', 'sent', 'dead')`),
  check("outbox_claim_valid", sql`(${t.claimToken} IS NULL AND ${t.claimExpiresAt} IS NULL) OR (${t.status} = 'pending' AND ${t.claimToken} IS NOT NULL AND ${t.claimExpiresAt} IS NOT NULL AND ${t.attempts} > 0)`),
  check("outbox_attempts_valid", sql`${t.attempts} >= 0`),
  check("outbox_sent_valid", sql`(${t.status} = 'sent' AND ${t.sentAt} IS NOT NULL AND ${t.claimToken} IS NULL) OR (${t.status} <> 'sent' AND ${t.sentAt} IS NULL)`),
  check("outbox_dead_error", sql`${t.status} <> 'dead' OR ${t.lastErrorCode} IS NOT NULL`),
  check("outbox_error_code_valid", sql`${t.lastErrorCode} IS NULL OR ${t.lastErrorCode} ~ '^[a-z][a-z0-9_]{0,63}$'`),
  check("outbox_replay_complete", sql`(${t.replayedById} IS NULL AND ${t.replayedAt} IS NULL) OR (${t.replayedById} IS NOT NULL AND ${t.replayedAt} IS NOT NULL)`),
]);
