import { paymentsOpen } from "@/lib/content";
import { samplePaymentProvider } from "@/server/adapters/payments";
import { PayInput } from "@/server/contracts/payments";
import { getQuote } from "@/server/domain/quotes";
import { allow } from "@/server/rate-limit";

// POST /api/v1/payments (D-004, D-036): pay a quote by its reference. The body carries the reference only; the amount
// is the server's. Runs in development on sample quotes until `paymentsLive` is set by a D-entry.
const MAX_BODY = 1_000;

const reply = (body: object, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (!paymentsOpen()) return reply({ error: "not_available" }, 404);
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return reply({ error: "unsupported_media_type" }, 415);
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allow(ip)) return reply({ error: "rate_limited" }, 429);

  const text = await request.text();
  if (text.length > MAX_BODY) return reply({ error: "too_large" }, 413);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return reply({ error: "invalid_json" }, 400);
  }

  const parsed = PayInput.safeParse(body);
  if (!parsed.success) return reply({ error: "invalid" }, 422);

  const quote = getQuote(parsed.data.reference);
  if (!quote) return reply({ error: "not_found" }, 404);
  if (quote.status !== "open") return reply({ error: quote.status }, 409);

  return reply(await samplePaymentProvider.pay(quote), 200);
}
