import { enquiryOpen } from "@/lib/content";
import { emailTransport } from "@/server/adapters/email";
import { QueryInput } from "@/server/contracts/queries";
import { getDb } from "@/server/db/client";
import { createQuery } from "@/server/domain/queries";
import { allow } from "@/server/rate-limit";

// POST /api/v1/queries (TRD §3, D-006, D-033): parse, then call the domain. Responses never echo submitted values,
// and nothing personal is logged (INVARIANT 11).
const MAX_BODY = 8_000;

const reply = (body: object, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (!enquiryOpen()) return reply({ error: "not_available" }, 404);
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return reply({ error: "unsupported_media_type" }, 415);
  }
  // The first forwarded address when a proxy sets one; which header is trustworthy depends on the host (Q1).
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

  const parsed = QueryInput.safeParse(body);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((issue) => issue.path.join(".") || "body"))];
    return reply({ error: "invalid", fields }, 422);
  }

  const { reference } = await createQuery(await getDb(), parsed.data, emailTransport());
  return reply({ reference }, 201);
}
