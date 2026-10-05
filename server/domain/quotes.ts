import { z } from "zod";

// A quote a coordinator issues after the care plan (D-004). The amount is integer paise, read only here, on the
// server (INVARIANTS 4, 5). Until the quotes table exists, the only quotes are the development samples below (D-036):
// one per state, so the owners can see every screen. A production build has none.
const QUOTE_STATUSES = ["open", "paid", "expired", "cancelled"] as const;

const Quote = z.object({
  reference: z.string().length(8),
  service: z.string(),
  detail: z.string(),
  startsOn: z.date(),
  validUntil: z.date(),
  amountPaise: z.number().int().positive(),
  status: z.enum(QUOTE_STATUSES),
  paid: z.object({ at: z.date(), paymentId: z.string() }).optional(),
  // What the development sample bank does when this quote is paid (server/adapters/payments).
  sampleOutcome: z.enum(["paid", "failed", "pending"]),
});
export type Quote = z.infer<typeof Quote>;

const DAY = 86_400_000;

// End of a day in India, `days` from `now` (business dates are Asia/Kolkata, D-004).
function endOfDayIst(now: Date, days: number): Date {
  const ist = new Date(now.getTime() + 5.5 * 3_600_000 + days * DAY);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), 23, 59) - 5.5 * 3_600_000);
}

function samples(now: Date): Quote[] {
  const valid = endOfDayIst(now, 7);
  const starts = endOfDayIst(now, 5);
  const base = { startsOn: starts, validUntil: valid, status: "open" as const, sampleOutcome: "paid" as const };
  return [
    { ...base, reference: "4K7M9P2X", service: "Nurse at Home", detail: "7 day shifts", amountPaise: 2_100_000 },
    { ...base, reference: "8HRT3CWQ", service: "Physiotherapy", detail: "5 sessions", amountPaise: 450_000, sampleOutcome: "failed" },
    { ...base, reference: "6NBV2ZDE", service: "Rent equipment", detail: "Oxygen concentrator, 1 month", amountPaise: 900_000, sampleOutcome: "pending" },
    { ...base, reference: "5JXA7GSU", service: "GDA at Home", detail: "14 day shifts", amountPaise: 1_680_000, validUntil: endOfDayIst(now, -2), status: "expired" },
    { ...base, reference: "9MFE4KTB", service: "Doctor at Home", detail: "1 visit", amountPaise: 150_000, status: "cancelled" },
    {
      ...base,
      reference: "3WQD8RYN",
      service: "Nursing procedures",
      detail: "Wound dressing, 3 visits",
      amountPaise: 240_000,
      status: "paid",
      paid: { at: new Date(now.getTime() - DAY), paymentId: "pay_SAMPLE3WQD" },
    },
  ];
}

export const SAMPLE_REFERENCES = samples(new Date(0)).map((q) => ({ reference: q.reference, status: q.status, outcome: q.sampleOutcome }));

// An open quote past its date is expired, whatever it was stored as.
export function getQuote(reference: string, now = new Date()): Quote | undefined {
  if (process.env.NODE_ENV === "production") return undefined;
  const quote = samples(new Date()).find((q) => q.reference === reference);
  if (!quote) return undefined;
  return Quote.parse(quote.status === "open" && quote.validUntil < now ? { ...quote, status: "expired" } : quote);
}
