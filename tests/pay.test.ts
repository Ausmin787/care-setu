import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/v1/payments/route";
import { paymentsOpen } from "@/lib/content";
import { PayInput, PayResult, QuoteReference, showReference } from "@/server/contracts/payments";
import { SAMPLE_REFERENCES, getQuote } from "@/server/domain/quotes";

// D-004, D-036: a quote is paid by its reference only; sample quotes exist in development only.
afterEach(() => vi.unstubAllEnvs());

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/v1/payments", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 250)}` },
      body: JSON.stringify(body),
    }),
  );

describe("quote reference", () => {
  it.each(["4K7M9P2X", "qt 4k7m 9p2x", "QT-4K7M-9P2X", " 4K7M 9P2X "])("reads %s", (raw) => {
    expect(QuoteReference.parse(raw)).toBe("4K7M9P2X");
  });
  it.each(["", "4K7M9P2", "4K7M9P2XY", "4K7M9P20", "4K7M9PIX", "OK7M9P2X", "4K7L9P2X"])("rejects %s", (raw) => {
    expect(QuoteReference.safeParse(raw).success).toBe(false);
  });
  it("is shown in two groups after QT", () => {
    expect(showReference("4K7M9P2X")).toBe("QT 4K7M 9P2X");
  });
});

describe("pay input", () => {
  it("never accepts a price from the client (INVARIANT 4)", () => {
    expect(PayInput.safeParse({ reference: "4K7M9P2X", amountPaise: 100 }).success).toBe(false);
    expect(PayInput.safeParse({ reference: "4K7M9P2X" }).success).toBe(true);
  });
});

describe("sample quotes", () => {
  it("exist in development, one per state, with integer paise", () => {
    vi.stubEnv("NODE_ENV", "development");
    const quotes = SAMPLE_REFERENCES.map((s) => getQuote(s.reference));
    expect(quotes.map((q) => q?.status).sort()).toEqual(["cancelled", "expired", "open", "open", "open", "paid"]);
    for (const q of quotes) expect(Number.isInteger(q?.amountPaise)).toBe(true);
  });
  it("never exist in a production build", () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const s of SAMPLE_REFERENCES) expect(getQuote(s.reference)).toBeUndefined();
    expect(paymentsOpen()).toBe(false);
  });
  it("expire once their date has passed", () => {
    vi.stubEnv("NODE_ENV", "development");
    const later = new Date(Date.now() + 30 * 86_400_000);
    expect(getQuote("4K7M9P2X", later)?.status).toBe("expired");
  });
});

describe("POST /api/v1/payments", () => {
  it("is closed in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await post({ reference: "4K7M9P2X" })).status).toBe(404);
  });
  it("answers each sample with its outcome", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const paid = await post({ reference: "QT 4K7M 9P2X" });
    expect(paid.status).toBe(200);
    expect(PayResult.parse(await paid.json()).status).toBe("paid");
    expect(PayResult.parse(await (await post({ reference: "8HRT3CWQ" })).json()).status).toBe("failed");
    expect(PayResult.parse(await (await post({ reference: "6NBV2ZDE" })).json()).status).toBe("pending");
  });
  it("refuses a price, an unknown quote and a closed one", async () => {
    vi.stubEnv("NODE_ENV", "development");
    expect((await post({ reference: "4K7M9P2X", amountPaise: 1 })).status).toBe(422);
    expect((await post({ reference: "22222222" })).status).toBe(404);
    const expired = await post({ reference: "5JXA7GSU" });
    expect(expired.status).toBe(409);
    expect(await expired.json()).toEqual({ error: "expired" });
    expect((await post({ reference: "3WQD8RYN" })).status).toBe(409);
  });
});
