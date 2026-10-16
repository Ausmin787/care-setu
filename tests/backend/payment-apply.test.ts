import { randomUUID, randomBytes } from "node:crypto";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import { eq, sql } from "drizzle-orm";
import { drizzle as pgliteDrizzle } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as pgDrizzle } from "drizzle-orm/node-postgres";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import type { Db } from "@/server/db/client";
import { toDbAmount } from "@/server/db/money";
import * as schema from "@/server/db/schema";
import { applyPaymentEvent } from "@/server/domain/payment-apply";
import { facts, fixture, rows } from "../payment-cases";
import type { PaymentDecisionInput } from "@/server/domain/payment-decision";

const { queries, quotes, paymentAttempts, gatewayEvents } = schema;
const migrationsFolder = path.join(process.cwd(), "drizzle");
const url = process.env.DATABASE_URL_TEST;
const isCi = ["true", "1"].includes(process.env.CI ?? "");
if (!url && !isCi) process.stdout.write("SKIPPED real PostgreSQL backend proofs: DATABASE_URL_TEST is not set.\n");
const reference = (length: number) => "2" + Array.from(randomBytes(length - 1), byte => "23456789ABCDEFGHJKMNPQRSTUVWXYZ"[byte % 31]).join("");

type Seed = { quoteId: string; attemptId: string; eventId: string; token: string; otherIds: string[]; input: PaymentDecisionInput };
async function seed(db: Db, input = fixture()): Promise<Seed> {
  const suffix = randomUUID().replaceAll("-", "");
  const scope = (id: string | null) => id === null ? null : `${id}_${suffix}`;
  const queryId = randomUUID(), quoteId = randomUUID(), attemptId = randomUUID(), eventId = randomUUID(), token = randomUUID();
  await db.insert(queries).values({ id: queryId, reference: reference(10), patientLocation: "home", area: "delhi", message: "Synthetic fixture", name: "Synthetic fixture", phone: "+910000000000", sourcePage: "/backend-test" });
  await db.insert(quotes).values({ id: quoteId, queryId, reference: reference(8), service: "Synthetic service", detail: "Synthetic detail", startsOn: new Date("2026-01-01T00:00:00Z"), createdAt: new Date("2025-12-01T00:00:00Z"), validUntil: new Date(input.quote.validUntil), amountPaise: toDbAmount(input.quote.amountPaise), currency: input.quote.currency, status: input.quote.status });
  // DB constraints deliberately forbid an attempt/quote money mismatch. Those
  // rows are probed separately; use a matching attempt for all other cases.
  await db.insert(paymentAttempts).values({ id: attemptId, quoteId, provider: input.attempt.provider,
    gatewayOrderId: scope(input.attempt.gatewayOrderId), gatewayPaymentId: scope(input.attempt.gatewayPaymentId ?? (["authorized", "captured"].includes(input.attempt.status) ? input.event.paymentId : null)),
    status: input.attempt.status, holdsQuote: input.attempt.holdsQuote, settledQuote: input.attempt.settledQuote,
    amountPaise: toDbAmount(input.attempt.amountPaise), currency: input.attempt.currency, createdAt: new Date(input.attempt.createdAt) });
  const otherIds: string[] = [];
  if (input.quoteHasSettledAttempt && !input.attempt.settledQuote || input.quoteHasCompetingCapture) {
    const id = randomUUID(); otherIds.push(id);
    await db.insert(paymentAttempts).values({ id, quoteId, provider: "fake", gatewayOrderId: `other_order_${suffix}`, gatewayPaymentId: `other_payment_${suffix}`,
      amountPaise: toDbAmount(input.quote.amountPaise), currency: input.quote.currency, status: "captured", holdsQuote: false, settledQuote: input.quoteHasSettledAttempt });
  }
  for (const ignored of input.otherHoldingAttemptIds) {
    void ignored;
    const id = randomUUID(); otherIds.push(id);
    await db.insert(paymentAttempts).values({ id, quoteId, provider: "fake", gatewayOrderId: `hold_order_${id}`, amountPaise: toDbAmount(input.quote.amountPaise), currency: input.quote.currency, holdsQuote: true, createdAt: new Date(fixture().attempt.createdAt) });
  }
  if (input.attemptEverFailed && input.attempt.status !== "failed") {
    await db.insert(gatewayEvents).values({ provider: input.attempt.provider, providerEventId: `failure_${suffix}`, eventType: "payment.failed", gatewayOrderId: scope(input.attempt.gatewayOrderId)!, gatewayPaymentId: scope(input.event.paymentId)!, paymentAttemptId: attemptId,
      amountPaise: toDbAmount(input.attempt.amountPaise), currency: input.attempt.currency, rawBodySha256: "b".repeat(64), occurredAt: new Date("2026-01-01T00:00:00Z"), status: "processed", attempts: 1, processedAt: new Date("2026-01-01T00:00:00Z") });
  }
  await db.insert(gatewayEvents).values({ id: eventId, provider: input.event.provider, providerEventId: `event_${suffix}`, eventType: input.event.type,
    gatewayOrderId: scope(input.event.orderId)!, gatewayPaymentId: scope(input.event.paymentId)!, amountPaise: toDbAmount(input.event.amountPaise), currency: input.event.currency,
    rawBodySha256: input.event.rawBodySha256, occurredAt: new Date(input.event.occurredAt), status: "processing", attempts: 1, claimToken: token, claimExpiresAt: sql`now() + interval '5 minutes'` });
  return { quoteId, attemptId, eventId, token, otherIds, input };
}
async function snapshot(db: Db, item: Seed) {
  return {
    quote: await db.select().from(quotes).where(eq(quotes.id, item.quoteId)),
    attempts: await db.select().from(paymentAttempts).where(eq(paymentAttempts.quoteId, item.quoteId)).orderBy(paymentAttempts.id),
    event: await db.select().from(gatewayEvents).where(eq(gatewayEvents.id, item.eventId)),
  };
}

async function waitForLocks(pool: Pool, count: number) {
  for (let n = 0; n < 100; n++) {
    const blocked = await pool.query("SELECT count(*)::int AS count FROM pg_stat_activity WHERE datname=current_database() AND application_name='care_setu_backend_proofs' AND wait_event_type='Lock'");
    if (blocked.rows[0].count >= count) return;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error("expected_lock_wait_missing");
}

for (const driver of ["pglite", "postgres"] as const) {
  const suite = driver === "postgres" && !url && !isCi ? describe.skip : describe;
  suite(`stored event application (${driver})`, () => {
    let db: Db;
    let close: () => Promise<void>;
    let pool: Pool | undefined;
    beforeAll(async () => {
      if (driver === "pglite") {
        const client = new PGlite();
        const handle = pgliteDrizzle({ client, schema });
        close = () => client.close(); db = handle;
        await migratePglite(handle, { migrationsFolder });
      } else {
        if (!url) throw new Error("DATABASE_URL_TEST is required in CI; real PostgreSQL proofs cannot skip.");
        // Never load .env or fall back to the application's DATABASE_URL.
        // The explicitly supplied database must be named as a throwaway test DB.
        if (!new URL(url).pathname.endsWith("_test")) throw new Error("DATABASE_URL_TEST must name a throwaway database ending in _test.");
        pool = new Pool({ connectionString: url, max: 8, connectionTimeoutMillis: 5000, application_name: "care_setu_backend_proofs" });
        close = () => pool!.end();
        const handle = pgDrizzle({ client: pool, schema }); db = handle;
        try { await migratePg(handle, { migrationsFolder }); }
        catch { throw new Error("backend_test_database_unavailable"); }
      }
    }, 30000);
    afterAll(async () => { if (close) await close(); });

    for (const failedAttemptHoldsQuote of [false, true]) {
      for (const lateCaptureOnOpenQuote of ["review", "settle"] as const) {
        it.each(rows.filter(row => !row.name.startsWith("attempt versus quote")))(`row $name hold=${failedAttemptHoldsQuote} capture=${lateCaptureOnOpenQuote}`, async row => {
          const input = facts({ ...row.patch, policy: { failedAttemptHoldsQuote, lateCaptureOnOpenQuote } });
          const item = await seed(db, input);
          const before = await snapshot(db, item);
          const outcome = await applyPaymentEvent(db, item.eventId, item.token, input.policy);
          expect(outcome).toBe(row.kind === "dead" ? "dead" : row.kind === "noop" ? "noop" : "applied");
          const result = await snapshot(db, item);
          const attempt = result.attempts.find(attempt => attempt.id === item.attemptId)!;
          expect(attempt.status).toBe(row.status);
          expect(attempt.holdsQuote).toBe(row.holds === "failurePolicy" ? failedAttemptHoldsQuote : row.holds);
          const settle = row.settle === "capturePolicy" ? lateCaptureOnOpenQuote === "settle" : row.settle;
          expect(attempt.settledQuote).toBe(row.kind === "noop" ? input.attempt.settledQuote : settle);
          expect(result.quote[0].status).toBe(settle ? "paid" : input.quote.status);
          const review = row.review === "capturePolicy" ? lateCaptureOnOpenQuote === "review" ? "late_capture" : null : row.review;
          expect(result.event[0]).toMatchObject({ status: row.kind === "dead" ? "dead" : "processed", reviewCode: review, claimToken: null, claimExpiresAt: null });
          if (row.kind !== "dead") expect(result.event[0].paymentAttemptId).toBe(item.attemptId);
          if (row.kind === "noop" || row.kind === "dead") expect(result.attempts).toEqual(before.attempts);
        });
      }
    }
    it.each(["wrong_token", "expired", "processed", "missing"])("claim fencing %s writes nothing", async condition => {
      const item = await seed(db);
      if (condition === "expired") await db.update(gatewayEvents).set({ claimExpiresAt: sql`now() - interval '1 second'` }).where(eq(gatewayEvents.id, item.eventId));
      if (condition === "processed") await db.update(gatewayEvents).set({ status: "processed", paymentAttemptId: item.attemptId, processedAt: sql`now()`, claimToken: null, claimExpiresAt: null }).where(eq(gatewayEvents.id, item.eventId));
      const before = await snapshot(db, item);
      expect(await applyPaymentEvent(db, condition === "missing" ? randomUUID() : item.eventId, condition === "wrong_token" ? randomUUID() : item.token, item.input.policy)).toBe("claim_lost");
      expect(await snapshot(db, item)).toEqual(before);
    });
    it("largest safe amount round-trips through settlement", async () => {
      const input = facts({ attempt: { amountPaise: Number.MAX_SAFE_INTEGER }, quote: { amountPaise: Number.MAX_SAFE_INTEGER }, event: { amountPaise: Number.MAX_SAFE_INTEGER } });
      const item = await seed(db, input);
      expect(await applyPaymentEvent(db, item.eventId, item.token, input.policy)).toBe("applied");
      expect((await snapshot(db, item)).attempts[0].amountPaise).toBe(toDbAmount(Number.MAX_SAFE_INTEGER));
    });
    it("delayed capture and equality boundary both settle", async () => {
      const input = facts({ attempt: { createdAt: fixture().quote.validUntil } });
      const item = await seed(db, input);
      expect(await applyPaymentEvent(db, item.eventId, item.token, input.policy)).toBe("applied");
      expect((await snapshot(db, item)).quote[0].status).toBe("paid");
    });
    it.each(["amount", "currency"])("DB rejects mismatched quote/attempt %s", async field => {
      const item = await seed(db);
      try {
        await db.insert(paymentAttempts).values({ quoteId: item.quoteId, provider: "fake", amountPaise: toDbAmount(field === "amount" ? 101 : 100), currency: field === "currency" ? "USD" : "INR", holdsQuote: false });
        expect.fail("money mismatch accepted");
      } catch (error) {
        const cause = (error as { cause?: { code?: string } }).cause ?? error as { code?: string };
        expect(cause.code).toBe("23503");
      }
    });
    it("A settles, releases B and records B's later capture without another settlement", async () => {
      const item = await seed(db, facts({ attempt: { status: "failed", holdsQuote: false }, attemptEverFailed: true, otherHoldingAttemptIds: ["attempt_b"] }));
      expect(await applyPaymentEvent(db, item.eventId, item.token, item.input.policy)).toBe("applied");
      const first = await snapshot(db, item);
      const b = first.attempts.find(row => row.id === item.otherIds[0])!;
      expect(b).toMatchObject({ holdsQuote: false, reviewCode: "hold_released_on_settlement" });
      expect(first.quote[0].status).toBe("paid");
      const eventId = randomUUID(), token = randomUUID();
      await db.insert(gatewayEvents).values({ id: eventId, provider: "fake", providerEventId: `second_${eventId}`, eventType: "payment.captured", gatewayOrderId: b.gatewayOrderId!, gatewayPaymentId: `second_payment_${eventId}`, amountPaise: toDbAmount(100), currency: "INR", rawBodySha256: "a".repeat(64), occurredAt: new Date("2026-01-03T00:00:00Z"), status: "processing", attempts: 1, claimToken: token, claimExpiresAt: sql`now() + interval '5 minutes'` });
      expect(await applyPaymentEvent(db, eventId, token, item.input.policy)).toBe("applied");
      const [second] = await db.select().from(paymentAttempts).where(eq(paymentAttempts.id, b.id));
      expect(second).toMatchObject({ status: "captured", settledQuote: false, holdsQuote: false, reviewCode: "second_capture" });
      expect((await snapshot(db, item)).attempts.filter(row => row.settledQuote)).toHaveLength(1);
    });
    it("failure at final event update rolls back settlement, releases and quote changes", async () => {
      const item = await seed(db, facts({ attempt: { status: "failed", holdsQuote: false }, otherHoldingAttemptIds: ["attempt_b"] }));
      const before = await snapshot(db, item);
      // A disposable test-only trigger injects failure AFTER domain effects.
      await db.execute(sql`CREATE FUNCTION backend_fail_event() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected_failure'; END $$`);
      await db.execute(sql`CREATE TRIGGER backend_fail_event BEFORE UPDATE ON gateway_events FOR EACH ROW EXECUTE FUNCTION backend_fail_event()`);
      try {
        await expect(applyPaymentEvent(db, item.eventId, item.token, item.input.policy)).rejects.toThrow();
        expect(await snapshot(db, item)).toEqual(before);
      } finally {
        await db.execute(sql`DROP TRIGGER backend_fail_event ON gateway_events`);
        await db.execute(sql`DROP FUNCTION backend_fail_event()`);
      }
    });
    it("lost final fence rolls back all tentative effects", async () => {
      const item = await seed(db);
      const before = await snapshot(db, item);
      await db.execute(sql`CREATE FUNCTION backend_expire_claim() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN UPDATE gateway_events SET claim_expires_at=clock_timestamp()-interval '1 second' WHERE gateway_order_id=NEW.gateway_order_id AND provider=NEW.provider AND status='processing'; RETURN NEW; END $$`);
      await db.execute(sql`CREATE TRIGGER backend_expire_claim AFTER UPDATE ON payment_attempts FOR EACH ROW WHEN (NEW.status='captured') EXECUTE FUNCTION backend_expire_claim()`);
      try {
        expect(await applyPaymentEvent(db, item.eventId, item.token, item.input.policy)).toBe("claim_lost");
        expect(await snapshot(db, item)).toEqual(before);
      } finally {
        await db.execute(sql`DROP TRIGGER backend_expire_claim ON payment_attempts`);
        await db.execute(sql`DROP FUNCTION backend_expire_claim()`);
      }
    });
    it("clean authorized apply preserves an earlier unknown-outcome review marker", async () => {
      const item = await seed(db, facts({ event: { type: "payment.unknown" } }));
      expect(await applyPaymentEvent(db, item.eventId, item.token, item.input.policy)).toBe("applied");
      expect((await snapshot(db, item)).attempts[0]).toMatchObject({ status: "unknown", reviewCode: "unknown_outcome" });
      const [previous] = await db.select().from(gatewayEvents).where(eq(gatewayEvents.id, item.eventId));
      const id = randomUUID(), token = randomUUID();
      await db.insert(gatewayEvents).values({ ...previous, id, providerEventId: `clean_authorized_${id}`, eventType: "payment.authorized", status: "processing", attempts: 1,
        processedAt: null, reviewCode: null, lastErrorCode: null, claimToken: token, claimExpiresAt: sql`now() + interval '5 minutes'` });
      expect(await applyPaymentEvent(db, id, token, item.input.policy)).toBe("applied");
      expect((await snapshot(db, item)).attempts[0]).toMatchObject({ status: "authorized", reviewCode: "unknown_outcome" });
      const [processed] = await db.select().from(gatewayEvents).where(eq(gatewayEvents.id, id));
      expect(processed).toMatchObject({ status: "processed", reviewCode: null, claimToken: null, claimExpiresAt: null });
    });
    it("no-op finalisation preserves an existing attempt review marker", async () => {
      const item = await seed(db, facts({ attempt: { status: "captured", holdsQuote: false, gatewayPaymentId: "payment_a" } }));
      await db.update(paymentAttempts).set({ reviewCode: "late_capture" }).where(eq(paymentAttempts.id, item.attemptId));
      expect(await applyPaymentEvent(db, item.eventId, item.token, item.input.policy)).toBe("noop");
      expect((await snapshot(db, item)).attempts[0].reviewCode).toBe("late_capture");
    });

    if (driver === "postgres") {
      it("parallel captures serialize to one settlement and one quote update", async () => {
        const item = await seed(db, facts({ attempt: { status: "failed", holdsQuote: false }, otherHoldingAttemptIds: ["attempt_b"] }));
        const bId = item.otherIds[0];
        const [b] = await db.select().from(paymentAttempts).where(eq(paymentAttempts.id, bId));
        const id = randomUUID(), token = randomUUID();
        await db.insert(gatewayEvents).values({ id, provider: "fake", providerEventId: `parallel_${id}`, eventType: "payment.captured", gatewayOrderId: b.gatewayOrderId!, gatewayPaymentId: `parallel_payment_${id}`, amountPaise: toDbAmount(100), currency: "INR", rawBodySha256: "a".repeat(64), occurredAt: new Date("2026-01-03T00:00:00Z"), status: "processing", attempts: 1, claimToken: token, claimExpiresAt: sql`now() + interval '5 minutes'` });
        // Audit into a regular test table so every pooled connection sees it.
        await db.execute(sql`CREATE TABLE backend_quote_update_audit (id uuid)`);
        await db.execute(sql`CREATE FUNCTION backend_audit_quote() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO backend_quote_update_audit VALUES (NEW.id); RETURN NEW; END $$`);
        await db.execute(sql`CREATE TRIGGER backend_audit_quote AFTER UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION backend_audit_quote()`);
        try {
          const outcomes = await Promise.all([applyPaymentEvent(db, item.eventId, item.token, item.input.policy), applyPaymentEvent(db, id, token, item.input.policy)]);
          expect(outcomes).toEqual(["applied", "applied"]);
          const result = await snapshot(db, item);
          expect(result.attempts.filter(row => row.settledQuote)).toHaveLength(1);
          expect(result.attempts.filter(row => row.status === "captured")).toHaveLength(2);
          expect(result.attempts.filter(row => row.reviewCode === "second_capture")).toHaveLength(1);
          const updates = await db.select({ count: sql<number>`count(*)::int` }).from(sql`backend_quote_update_audit`).where(sql`id = ${item.quoteId}`);
          expect(updates[0].count).toBe(1);
        } finally {
          await db.execute(sql`DROP TRIGGER backend_audit_quote ON quotes`); await db.execute(sql`DROP FUNCTION backend_audit_quote()`); await db.execute(sql`DROP TABLE backend_quote_update_audit`);
        }
      }, 15000);
      it("parallel events on the same attempt apply once then no-op", async () => {
        const item = await seed(db);
        const [first] = await db.select().from(gatewayEvents).where(eq(gatewayEvents.id, item.eventId));
        const id = randomUUID(), token = randomUUID();
        await db.insert(gatewayEvents).values({ ...first, id, providerEventId: `duplicate_${id}`, claimToken: token });
        const result = await Promise.all([applyPaymentEvent(db, item.eventId, item.token, item.input.policy), applyPaymentEvent(db, id, token, item.input.policy)]);
        expect(result.sort()).toEqual(["applied", "noop"]);
        expect((await snapshot(db, item)).attempts.filter(row => row.settledQuote)).toHaveLength(1);
      }, 15000);
      it("stale owner resumes after concurrent reclaim and cannot write", async () => {
        const item = await seed(db), replacement = randomUUID();
        await db.update(gatewayEvents).set({ claimExpiresAt: sql`now() - interval '1 second'` }).where(eq(gatewayEvents.id, item.eventId));
        const holder = await pool!.connect();
        let stale: Promise<unknown> | undefined;
        try {
          await holder.query("BEGIN");
          await holder.query("SELECT id FROM gateway_events WHERE id=$1 FOR UPDATE", [item.eventId]);
          await holder.query("UPDATE gateway_events SET claim_token=$2, claim_expires_at=now()+interval '5 minutes', attempts=attempts+1 WHERE id=$1", [item.eventId, replacement]);
          stale = applyPaymentEvent(db, item.eventId, item.token, item.input.policy);
          await waitForLocks(pool!, 1);
          await holder.query("COMMIT");
          const before = await snapshot(db, item);
          expect(await stale).toBe("claim_lost");
          expect(await snapshot(db, item)).toEqual(before);
          expect(await applyPaymentEvent(db, item.eventId, replacement, item.input.policy)).toBe("applied");
        } finally { await holder.query("ROLLBACK"); holder.release(); if (stale) await stale; }
      }, 15000);
      it("lease expiry during a quote lock wait rolls back every effect", async () => {
        const item = await seed(db);
        const holder = await pool!.connect();
        let waiting: Promise<unknown> | undefined;
        try {
          await holder.query("BEGIN");
          await holder.query("SELECT id FROM quotes WHERE id=$1 FOR UPDATE", [item.quoteId]);
          await db.update(gatewayEvents).set({ claimExpiresAt: sql`clock_timestamp() + interval '2 seconds'` }).where(eq(gatewayEvents.id, item.eventId));
          const before = await snapshot(db, item);
          waiting = applyPaymentEvent(db, item.eventId, item.token, item.input.policy);
          await waitForLocks(pool!, 1);
          await holder.query("SELECT pg_sleep(2.1)");
          await holder.query("COMMIT");
          expect(await waiting).toBe("claim_lost");
          expect(await snapshot(db, item)).toEqual(before);
        } finally { await holder.query("ROLLBACK"); holder.release(); if (waiting) await waiting; }
      }, 15000);
      it("two overlapping applies wait in fixed lock order without deadlock", async () => {
        const item = await seed(db, facts({ attempt: { status: "failed", holdsQuote: false }, otherHoldingAttemptIds: ["attempt_b"] }));
        const [b] = await db.select().from(paymentAttempts).where(eq(paymentAttempts.id, item.otherIds[0]));
        const id = randomUUID(), token = randomUUID();
        await db.insert(gatewayEvents).values({ id, provider: "fake", providerEventId: `overlap_${id}`, eventType: "payment.captured", gatewayOrderId: b.gatewayOrderId!, gatewayPaymentId: `overlap_payment_${id}`, amountPaise: toDbAmount(100), currency: "INR", rawBodySha256: "a".repeat(64), occurredAt: new Date("2026-01-03T00:00:00Z"), status: "processing", attempts: 1, claimToken: token, claimExpiresAt: sql`now() + interval '5 minutes'` });
        const holder = await pool!.connect();
        let waiting: Promise<unknown> | undefined;
        try {
          await holder.query("BEGIN");
          await holder.query("SELECT id FROM quotes WHERE id=$1 FOR UPDATE", [item.quoteId]);
          waiting = Promise.all([applyPaymentEvent(db, item.eventId, item.token, item.input.policy), applyPaymentEvent(db, id, token, item.input.policy)]);
          await waitForLocks(pool!, 2);
          await holder.query("COMMIT");
          expect(await waiting).toEqual(["applied", "applied"]);
          expect((await snapshot(db, item)).attempts.filter(row => row.settledQuote)).toHaveLength(1);
        } finally { await holder.query("ROLLBACK"); holder.release(); if (waiting) await waiting; }
      }, 15000);
    }
  });
}
