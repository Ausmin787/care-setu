import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { NOTICE_VERSION } from "@/lib/privacy";
import type { EmailTransport } from "@/server/adapters/email";
import { QueryInput } from "@/server/contracts/queries";
import { openPglite, type Db } from "@/server/db/client";
import { consents, queries } from "@/server/db/schema";
import { createQuery, newReference } from "@/server/domain/queries";

// TRD §6 consent.test: a query and its consent are written in one transaction (INVARIANT 12), on the real migration
// running in an in-memory PGlite.
const input = QueryInput.parse({
  patientLocation: "home",
  service: null,
  area: "delhi",
  message: "Physiotherapy after a fall",
  name: "Test Person",
  phone: "9876543210",
  email: null,
  consent: true,
  noticeVersion: NOTICE_VERSION,
  sourcePage: "/contact",
  website: "",
});

const quiet: EmailTransport = { queryAlert: async () => {} };
let db: Db;

beforeAll(async () => {
  db = await openPglite();
}, 60_000);

describe("createQuery", () => {
  it("stores the query with its consent row and the notice version", async () => {
    const { id, reference } = await createQuery(db, input, quiet);
    expect(reference).toMatch(/^[2-9A-HJKMNP-Z]{10}$/);
    const [consent] = await db.select().from(consents).where(eq(consents.queryId, id));
    expect(consent.noticeVersion).toBe(NOTICE_VERSION);
    expect(consent.purpose).toBe("respond-to-care-query");
    const [row] = await db.select().from(queries).where(eq(queries.id, id));
    expect(row.status).toBe("new");
    expect(row.phone).toBe("+919876543210");
  });

  it("rolls the query back when its consent can't be stored", async () => {
    const before = await db.$count(queries);
    // Bypasses the contract on purpose: a notice version longer than its column makes the consent insert fail.
    const broken = { ...input, noticeVersion: "x".repeat(41) } as unknown as QueryInput;
    await expect(createQuery(db, broken, quiet)).rejects.toThrow();
    expect(await db.$count(queries)).toBe(before);
  });

  it("keeps the query when the team alert fails, and logs only its id", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const failing: EmailTransport = { queryAlert: async () => Promise.reject(new Error("smtp down")) };
    const { id } = await createQuery(db, input, failing);
    expect(await db.$count(queries, eq(queries.id, id))).toBe(1);
    const logged = log.mock.calls.flat().join(" ");
    expect(logged).toContain(id);
    expect(logged).not.toContain("9876543210");
    expect(logged).not.toContain("Test Person");
    log.mockRestore();
  });
});

describe("newReference", () => {
  it("never uses characters that are misread on the phone", () => {
    const many = Array.from({ length: 200 }, newReference).join("");
    expect(many).not.toMatch(/[01OIL]/);
  });
});
