CREATE TABLE "gateway_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(32) NOT NULL,
	"provider_event_id" varchar(128) NOT NULL,
	"event_type" varchar(64) NOT NULL,
	"gateway_order_id" varchar(128) NOT NULL,
	"gateway_payment_id" varchar(128) NOT NULL,
	"payment_attempt_id" uuid,
	"amount_paise" bigint NOT NULL,
	"currency" varchar(3) NOT NULL,
	"raw_body_sha256" varchar(64) NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" varchar(16) DEFAULT 'received' NOT NULL,
	"claim_token" uuid,
	"claim_expires_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_error_code" varchar(64),
	"review_code" varchar(64),
	"processed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_provider_valid" CHECK ("gateway_events"."provider" ~ '^[a-z][a-z0-9_-]{0,31}$'),
	CONSTRAINT "events_ids_valid" CHECK ("gateway_events"."provider_event_id" ~ '^[A-Za-z0-9_-]{1,128}$' AND "gateway_events"."gateway_order_id" ~ '^[A-Za-z0-9_-]{1,128}$' AND "gateway_events"."gateway_payment_id" ~ '^[A-Za-z0-9_-]{1,128}$'),
	CONSTRAINT "events_type_valid" CHECK ("gateway_events"."event_type" ~ '^[a-z][a-z0-9_.-]{0,63}$'),
	CONSTRAINT "events_amount_safe" CHECK ("gateway_events"."amount_paise" BETWEEN 1 AND 9007199254740991),
	CONSTRAINT "events_currency_valid" CHECK ("gateway_events"."currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "events_hash_valid" CHECK ("gateway_events"."raw_body_sha256" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "events_status_valid" CHECK ("gateway_events"."status" IN ('received', 'processing', 'processed', 'failed', 'dead')),
	CONSTRAINT "events_claim_valid" CHECK (("gateway_events"."status" = 'processing' AND "gateway_events"."claim_token" IS NOT NULL AND "gateway_events"."claim_expires_at" IS NOT NULL) OR ("gateway_events"."status" <> 'processing' AND "gateway_events"."claim_token" IS NULL AND "gateway_events"."claim_expires_at" IS NULL)),
	CONSTRAINT "events_attempts_valid" CHECK ("gateway_events"."attempts" >= 0 AND ("gateway_events"."status" <> 'processing' OR "gateway_events"."attempts" > 0)),
	CONSTRAINT "events_processed_valid" CHECK (("gateway_events"."status" = 'processed' AND "gateway_events"."processed_at" IS NOT NULL AND "gateway_events"."payment_attempt_id" IS NOT NULL) OR ("gateway_events"."status" <> 'processed' AND "gateway_events"."processed_at" IS NULL)),
	CONSTRAINT "events_failure_valid" CHECK ("gateway_events"."status" NOT IN ('failed', 'dead') OR "gateway_events"."last_error_code" IS NOT NULL),
	CONSTRAINT "events_dead_review" CHECK ("gateway_events"."status" <> 'dead' OR "gateway_events"."review_code" IS NOT NULL),
	CONSTRAINT "events_error_code_valid" CHECK ("gateway_events"."last_error_code" IS NULL OR "gateway_events"."last_error_code" ~ '^[a-z][a-z0-9_]{0,63}$'),
	CONSTRAINT "events_review_code_valid" CHECK ("gateway_events"."review_code" IS NULL OR "gateway_events"."review_code" ~ '^[a-z][a-z0-9_]{0,63}$')
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"principal_id" uuid NOT NULL,
	"route" varchar(128) NOT NULL,
	"key" varchar(255) NOT NULL,
	"request_hash" varchar(64) NOT NULL,
	"operation_id" uuid NOT NULL,
	"effect_kind" varchar(32) NOT NULL,
	"query_id" uuid,
	"payment_attempt_id" uuid,
	"status" varchar(16) DEFAULT 'in_progress' NOT NULL,
	"response_status" integer,
	"response_body" jsonb,
	"claim_token" uuid,
	"claim_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "idempotency_route_valid" CHECK ("idempotency_keys"."route" ~ '^/api/v1/[a-z0-9/_-]{1,119}$'),
	CONSTRAINT "idempotency_key_valid" CHECK ("idempotency_keys"."key" ~ '^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'),
	CONSTRAINT "idempotency_hash_valid" CHECK ("idempotency_keys"."request_hash" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "idempotency_kind_valid" CHECK ("idempotency_keys"."effect_kind" IN ('query', 'payment_attempt')),
	CONSTRAINT "idempotency_effect_valid" CHECK (("idempotency_keys"."effect_kind" = 'query' AND "idempotency_keys"."payment_attempt_id" IS NULL AND ("idempotency_keys"."query_id" IS NULL OR "idempotency_keys"."query_id" = "idempotency_keys"."operation_id")) OR ("idempotency_keys"."effect_kind" = 'payment_attempt' AND "idempotency_keys"."query_id" IS NULL AND ("idempotency_keys"."payment_attempt_id" IS NULL OR "idempotency_keys"."payment_attempt_id" = "idempotency_keys"."operation_id"))),
	CONSTRAINT "idempotency_lifecycle_valid" CHECK (("idempotency_keys"."status" = 'in_progress' AND "idempotency_keys"."claim_token" IS NOT NULL AND "idempotency_keys"."claim_expires_at" IS NOT NULL AND "idempotency_keys"."response_status" IS NULL AND "idempotency_keys"."response_body" IS NULL) OR ("idempotency_keys"."status" = 'done' AND "idempotency_keys"."claim_token" IS NULL AND "idempotency_keys"."claim_expires_at" IS NULL AND "idempotency_keys"."response_status" IS NOT NULL AND "idempotency_keys"."response_status" BETWEEN 200 AND 599 AND "idempotency_keys"."response_body" IS NOT NULL)),
	CONSTRAINT "idempotency_expiry_valid" CHECK ("idempotency_keys"."expires_at" >= "idempotency_keys"."created_at" + INTERVAL '24 hours' AND ("idempotency_keys"."claim_expires_at" IS NULL OR "idempotency_keys"."expires_at" > "idempotency_keys"."claim_expires_at")),
	CONSTRAINT "idempotency_success_effect" CHECK ("idempotency_keys"."status" <> 'done' OR "idempotency_keys"."response_status" >= 400 OR ("idempotency_keys"."effect_kind" = 'query' AND "idempotency_keys"."query_id" IS NOT NULL) OR ("idempotency_keys"."effect_kind" = 'payment_attempt' AND "idempotency_keys"."payment_attempt_id" IS NOT NULL)),
	CONSTRAINT "idempotency_body_allowlist" CHECK ("idempotency_keys"."response_body" IS NULL OR (jsonb_typeof("idempotency_keys"."response_body") = 'object' AND "idempotency_keys"."response_body" - ARRAY['reference', 'error', 'id']::text[] = '{}'::jsonb))
);
--> statement-breakpoint
CREATE TABLE "outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" varchar(32) NOT NULL,
	"query_id" uuid,
	"payment_attempt_id" uuid,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"claim_token" uuid,
	"claim_expires_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_error_code" varchar(64),
	"sent_at" timestamp with time zone,
	"replayed_by_id" uuid,
	"replayed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outbox_target_valid" CHECK (("outbox"."kind" = 'query_alert' AND "outbox"."query_id" IS NOT NULL AND "outbox"."payment_attempt_id" IS NULL) OR ("outbox"."kind" = 'payment_followup' AND "outbox"."payment_attempt_id" IS NOT NULL AND "outbox"."query_id" IS NULL)),
	CONSTRAINT "outbox_status_valid" CHECK ("outbox"."status" IN ('pending', 'sent', 'dead')),
	CONSTRAINT "outbox_claim_valid" CHECK (("outbox"."claim_token" IS NULL AND "outbox"."claim_expires_at" IS NULL) OR ("outbox"."status" = 'pending' AND "outbox"."claim_token" IS NOT NULL AND "outbox"."claim_expires_at" IS NOT NULL AND "outbox"."attempts" > 0)),
	CONSTRAINT "outbox_attempts_valid" CHECK ("outbox"."attempts" >= 0),
	CONSTRAINT "outbox_sent_valid" CHECK (("outbox"."status" = 'sent' AND "outbox"."sent_at" IS NOT NULL AND "outbox"."claim_token" IS NULL) OR ("outbox"."status" <> 'sent' AND "outbox"."sent_at" IS NULL)),
	CONSTRAINT "outbox_dead_error" CHECK ("outbox"."status" <> 'dead' OR "outbox"."last_error_code" IS NOT NULL),
	CONSTRAINT "outbox_error_code_valid" CHECK ("outbox"."last_error_code" IS NULL OR "outbox"."last_error_code" ~ '^[a-z][a-z0-9_]{0,63}$'),
	CONSTRAINT "outbox_replay_complete" CHECK (("outbox"."replayed_by_id" IS NULL AND "outbox"."replayed_at" IS NULL) OR ("outbox"."replayed_by_id" IS NOT NULL AND "outbox"."replayed_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "payment_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"provider" varchar(32) NOT NULL,
	"gateway_order_id" varchar(128),
	"gateway_payment_id" varchar(128),
	"amount_paise" bigint NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" varchar(16) DEFAULT 'created' NOT NULL,
	"holds_quote" boolean NOT NULL,
	"settled_quote" boolean DEFAULT false NOT NULL,
	"fetched_status" varchar(16),
	"fetched_amount_paise" bigint,
	"fetched_currency" varchar(3),
	"fetched_at" timestamp with time zone,
	"review_code" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attempts_identity_unique" UNIQUE("id","provider","gateway_order_id"),
	CONSTRAINT "attempts_provider_valid" CHECK ("payment_attempts"."provider" ~ '^[a-z][a-z0-9_-]{0,31}$'),
	CONSTRAINT "attempts_order_valid" CHECK ("payment_attempts"."gateway_order_id" IS NULL OR "payment_attempts"."gateway_order_id" ~ '^[A-Za-z0-9_-]{1,128}$'),
	CONSTRAINT "attempts_payment_valid" CHECK ("payment_attempts"."gateway_payment_id" IS NULL OR "payment_attempts"."gateway_payment_id" ~ '^[A-Za-z0-9_-]{1,128}$'),
	CONSTRAINT "attempts_amount_safe" CHECK ("payment_attempts"."amount_paise" BETWEEN 1 AND 9007199254740991),
	CONSTRAINT "attempts_currency_valid" CHECK ("payment_attempts"."currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "attempts_status_valid" CHECK ("payment_attempts"."status" IN ('created', 'authorized', 'captured', 'failed', 'unknown')),
	CONSTRAINT "attempts_settled_captured" CHECK ("payment_attempts"."settled_quote" = false OR "payment_attempts"."status" = 'captured'),
	CONSTRAINT "attempts_captured_released" CHECK ("payment_attempts"."status" <> 'captured' OR "payment_attempts"."holds_quote" = false),
	CONSTRAINT "attempts_settlement_identity" CHECK ("payment_attempts"."status" NOT IN ('authorized', 'captured') OR ("payment_attempts"."gateway_order_id" IS NOT NULL AND "payment_attempts"."gateway_payment_id" IS NOT NULL)),
	CONSTRAINT "attempts_fetch_complete" CHECK (("payment_attempts"."fetched_at" IS NULL AND "payment_attempts"."fetched_status" IS NULL AND "payment_attempts"."fetched_amount_paise" IS NULL AND "payment_attempts"."fetched_currency" IS NULL) OR ("payment_attempts"."fetched_at" IS NOT NULL AND "payment_attempts"."fetched_status" IS NOT NULL AND "payment_attempts"."fetched_amount_paise" IS NOT NULL AND "payment_attempts"."fetched_currency" IS NOT NULL AND "payment_attempts"."fetched_amount_paise" BETWEEN 1 AND 9007199254740991 AND "payment_attempts"."fetched_currency" ~ '^[A-Z]{3}$')),
	CONSTRAINT "attempts_fetch_status_valid" CHECK ("payment_attempts"."fetched_status" IS NULL OR "payment_attempts"."fetched_status" IN ('created', 'authorized', 'captured', 'failed', 'unknown')),
	CONSTRAINT "attempts_review_code_valid" CHECK ("payment_attempts"."review_code" IS NULL OR "payment_attempts"."review_code" ~ '^[a-z][a-z0-9_]{0,63}$')
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query_id" uuid NOT NULL,
	"reference" varchar(12) NOT NULL,
	"service" varchar(100) NOT NULL,
	"detail" varchar(1000) NOT NULL,
	"starts_on" timestamp with time zone NOT NULL,
	"valid_until" timestamp with time zone NOT NULL,
	"amount_paise" bigint NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" varchar(16) DEFAULT 'open' NOT NULL,
	"issuer_id" uuid,
	"supersedes_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quotes_amount_identity_unique" UNIQUE("id","amount_paise","currency"),
	CONSTRAINT "quotes_reference_valid" CHECK ("quotes"."reference" ~ '^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8,12}$' AND "quotes"."reference" NOT LIKE 'QT%'),
	CONSTRAINT "quotes_amount_safe" CHECK ("quotes"."amount_paise" BETWEEN 1 AND 9007199254740991),
	CONSTRAINT "quotes_currency_valid" CHECK ("quotes"."currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "quotes_status_valid" CHECK ("quotes"."status" IN ('open', 'paid', 'expired', 'cancelled')),
	CONSTRAINT "quotes_validity_valid" CHECK ("quotes"."valid_until" > "quotes"."created_at"),
	CONSTRAINT "quotes_not_self_superseding" CHECK ("quotes"."supersedes_id" IS NULL OR "quotes"."supersedes_id" <> "quotes"."id")
);
--> statement-breakpoint
ALTER TABLE "gateway_events" ADD CONSTRAINT "events_attempt_identity_fk" FOREIGN KEY ("payment_attempt_id","provider","gateway_order_id") REFERENCES "public"."payment_attempts"("id","provider","gateway_order_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_query_id_queries_id_fk" FOREIGN KEY ("query_id") REFERENCES "public"."queries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_payment_attempt_id_payment_attempts_id_fk" FOREIGN KEY ("payment_attempt_id") REFERENCES "public"."payment_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_query_id_queries_id_fk" FOREIGN KEY ("query_id") REFERENCES "public"."queries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_payment_attempt_id_payment_attempts_id_fk" FOREIGN KEY ("payment_attempt_id") REFERENCES "public"."payment_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_attempts" ADD CONSTRAINT "attempts_quote_amount_fk" FOREIGN KEY ("quote_id","amount_paise","currency") REFERENCES "public"."quotes"("id","amount_paise","currency") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_query_id_queries_id_fk" FOREIGN KEY ("query_id") REFERENCES "public"."queries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_supersedes_id_quotes_id_fk" FOREIGN KEY ("supersedes_id") REFERENCES "public"."quotes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "events_provider_event_unique" ON "gateway_events" USING btree ("provider","provider_event_id");--> statement-breakpoint
CREATE INDEX "events_attempt_idx" ON "gateway_events" USING btree ("payment_attempt_id");--> statement-breakpoint
CREATE INDEX "events_due_idx" ON "gateway_events" USING btree ("next_attempt_at","id") WHERE "gateway_events"."status" IN ('received', 'failed');--> statement-breakpoint
CREATE INDEX "events_expired_claim_idx" ON "gateway_events" USING btree ("claim_expires_at","id") WHERE "gateway_events"."status" = 'processing';--> statement-breakpoint
CREATE INDEX "events_review_idx" ON "gateway_events" USING btree ("received_at","id") WHERE "gateway_events"."review_code" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idempotency_scope_key_unique" ON "idempotency_keys" USING btree ("principal_id","route","key");--> statement-breakpoint
CREATE UNIQUE INDEX "idempotency_operation_unique" ON "idempotency_keys" USING btree ("operation_id");--> statement-breakpoint
CREATE INDEX "idempotency_stale_idx" ON "idempotency_keys" USING btree ("claim_expires_at","id") WHERE "idempotency_keys"."status" = 'in_progress';--> statement-breakpoint
CREATE INDEX "idempotency_done_expiry_idx" ON "idempotency_keys" USING btree ("expires_at","id") WHERE "idempotency_keys"."status" = 'done';--> statement-breakpoint
CREATE INDEX "idempotency_query_idx" ON "idempotency_keys" USING btree ("query_id");--> statement-breakpoint
CREATE INDEX "idempotency_attempt_idx" ON "idempotency_keys" USING btree ("payment_attempt_id");--> statement-breakpoint
CREATE UNIQUE INDEX "outbox_query_alert_unique" ON "outbox" USING btree ("query_id","kind") WHERE "outbox"."kind" = 'query_alert';--> statement-breakpoint
CREATE UNIQUE INDEX "outbox_payment_followup_unique" ON "outbox" USING btree ("payment_attempt_id","kind") WHERE "outbox"."kind" = 'payment_followup';--> statement-breakpoint
CREATE INDEX "outbox_due_idx" ON "outbox" USING btree ("next_attempt_at","id") WHERE "outbox"."status" = 'pending' AND "outbox"."claim_token" IS NULL;--> statement-breakpoint
CREATE INDEX "outbox_expired_claim_idx" ON "outbox" USING btree ("claim_expires_at","id") WHERE "outbox"."status" = 'pending' AND "outbox"."claim_token" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "outbox_dead_idx" ON "outbox" USING btree ("created_at","id") WHERE "outbox"."status" = 'dead';--> statement-breakpoint
CREATE UNIQUE INDEX "attempts_provider_order_unique" ON "payment_attempts" USING btree ("provider","gateway_order_id") WHERE "payment_attempts"."gateway_order_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "attempts_provider_payment_unique" ON "payment_attempts" USING btree ("provider","gateway_payment_id") WHERE "payment_attempts"."gateway_payment_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "attempts_one_holding_quote" ON "payment_attempts" USING btree ("quote_id") WHERE "payment_attempts"."holds_quote" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "attempts_one_settled_quote" ON "payment_attempts" USING btree ("quote_id") WHERE "payment_attempts"."settled_quote" = true;--> statement-breakpoint
CREATE INDEX "attempts_reconcile_idx" ON "payment_attempts" USING btree ("updated_at","id") WHERE "payment_attempts"."status" <> 'captured';--> statement-breakpoint
CREATE UNIQUE INDEX "quotes_reference_unique" ON "quotes" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "quotes_query_idx" ON "quotes" USING btree ("query_id");--> statement-breakpoint
CREATE INDEX "quotes_supersedes_idx" ON "quotes" USING btree ("supersedes_id");