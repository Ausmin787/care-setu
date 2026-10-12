import { describe, expect, it } from "vitest";
import { fromDbAmount, MoneyBoundaryError, toDbAmount } from "@/server/db/money";

describe("money boundary", () => {
  it.each([1, 100, Number.MAX_SAFE_INTEGER])("round-trips safe boundary %s exactly", amount => {
    expect(fromDbAmount(toDbAmount(amount))).toBe(amount);
    expect(toDbAmount(amount)).toBe(BigInt(amount));
  });
  const invalidNumbers: readonly unknown[] = [
    0, -0, -1, 0.5, 1.5, NaN, Infinity, -Infinity, 9007199254740992,
    "100", "9007199254740991", null, undefined, true, false, BigInt(1), {}, [],
  ];
  it.each(invalidNumbers.map((value, index) => ({ value, index })))("refuses number input case $index without leaking the value", ({ value }) => {
    try {
      toDbAmount(value as number);
      expect.fail("invalid input accepted");
    } catch (error) {
      expect(error).toBeInstanceOf(MoneyBoundaryError);
      expect((error as MoneyBoundaryError).code).toBe("invalid_amount");
      expect((error as Error).message).toBe("invalid_amount");
      expect(Object.keys(error as object).sort()).toEqual(["code", "name"]);
    }
  });
  it.each([BigInt(0), BigInt(-1), BigInt("9007199254740992")])("refuses out-of-range bigint case %#", value => {
    expect(() => fromDbAmount(value)).toThrow(MoneyBoundaryError);
    expect(() => fromDbAmount(value)).toThrow("invalid_amount");
  });
  it.each([1, "1", null, undefined])("refuses non-bigint database input case %#", value => {
    expect(() => fromDbAmount(value as unknown as bigint)).toThrow(MoneyBoundaryError);
  });
});
