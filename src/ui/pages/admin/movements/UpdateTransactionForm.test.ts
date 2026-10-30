import { describe, it, expect } from "vitest";
import { updateTransactionSchema } from "./UpdateTransactionForm";

describe("updateTransactionSchema", () => {
  it("accepts an empty categoryId", () => {
    const input = {
      description: "Compra de supermercado",
      amount: 25,
      date: new Date("2026-01-01"),
      categoryId: "",
    };

    const result = updateTransactionSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("accepts an non empty categoryId", () => {
    const mockId = "71248107412801321A093821";
    const input = {
      description: "Compra de supermercado",
      amount: 25,
      date: new Date("2026-01-01"),
      categoryId: mockId,
    };

    const result = updateTransactionSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("rejects a null categoryId", () => {
    const input = {
      description: "Compra de supermercado",
      amount: 25,
      date: new Date("2026-01-01"),
      categoryId: null,
    };

    const result = updateTransactionSchema.safeParse(input);

    expect(result.success).toBe(false);
  });
});
