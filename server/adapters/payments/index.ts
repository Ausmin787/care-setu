import type { PayResult } from "../../contracts/payments";
import type { Quote } from "../../domain/quotes";

// Every payment goes through this interface, never a vendor SDK directly (D-003). The Razorpay sandbox adapter
// replaces the sample below when the backend is wired (D-036); its result will come from the signed callback and
// webhook, never from the browser (INVARIANT 7).
export interface PaymentProvider {
  pay(quote: Quote): Promise<PayResult>;
}

// Development only: a pretend bank that answers with each sample quote's outcome, so every result screen can be seen.
export const samplePaymentProvider: PaymentProvider = {
  async pay(quote) {
    if (quote.sampleOutcome !== "paid") return { status: quote.sampleOutcome };
    return { status: "paid", paidAt: new Date().toISOString(), paymentId: `pay_SAMPLE${quote.reference.slice(0, 4)}` };
  },
};
