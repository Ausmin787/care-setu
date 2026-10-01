import { z } from "zod";
import { ALPHABET } from "./enums";

// POST /api/v1/payments (D-004, D-036). The client sends a quote reference and nothing else: the amount always comes
// from the server-side quote (INVARIANT 4).

// A quote reference is "QT" + 8 characters from the phone-safe alphabet, shown as "QT 4K7M 9P2X". People type it with
// or without the QT, spaces or dashes, in any case; it is stored and sent as the 8 characters. An issued reference
// must never itself start with "QT", so a typed prefix is always recognised as one.
export const QUOTE_PREFIX = "QT";
const REFERENCE = new RegExp(`^[${ALPHABET}]{8}$`);

export const QuoteReference = z
  .string()
  .max(24)
  .transform((v) => v.toUpperCase().replace(/[\s-]/g, "").replace(/^QT(?=.{8}$)/, ""))
  .pipe(z.string().regex(REFERENCE));

export const PayInput = z.strictObject({ reference: QuoteReference });

// What the gateway said. "paid" only ever comes from a verified gateway confirmation (INVARIANT 7); until the backend
// is wired, the development sample adapter stands in for it (D-036).
export const PayResult = z.discriminatedUnion("status", [
  z.object({ status: z.literal("paid"), paidAt: z.iso.datetime(), paymentId: z.string() }),
  z.object({ status: z.literal("failed") }),
  z.object({ status: z.literal("pending") }),
]);
export type PayResult = z.infer<typeof PayResult>;

// "QT 4K7M 9P2X" from "4K7M9P2X".
export const showReference = (reference: string) =>
  `${QUOTE_PREFIX} ${reference.slice(0, 4)} ${reference.slice(4)}`;
