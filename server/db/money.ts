// The only number/bigint conversion boundary for integer paise.
const MAX_AMOUNT = BigInt(Number.MAX_SAFE_INTEGER);

export class MoneyBoundaryError extends Error {
  readonly code = "invalid_amount";
  constructor() {
    super("invalid_amount");
    this.name = "MoneyBoundaryError";
  }
}

export function toDbAmount(amount: number): bigint {
  if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount <= 0) {
    throw new MoneyBoundaryError();
  }
  return BigInt(amount);
}

export function fromDbAmount(amount: bigint): number {
  if (typeof amount !== "bigint" || amount <= BigInt(0) || amount > MAX_AMOUNT) {
    throw new MoneyBoundaryError();
  }
  return Number(amount);
}
