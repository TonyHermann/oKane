import { describe, expect, it } from "vitest";
import { Transaction } from "@/core/entities/Transaction";
import type { TransactionState } from "../slices/transactionsSlices";
import {
  createTransaction,
  toTransaction,
  toTransactionState,
} from "./toTransaction";

const FIXED_DATE = new Date("2024-01-01").getTime();

describe("toTransaction → toTransactionState round-trip", () => {
  it("preserves appliedRuleId and the category id", () => {
    const state: TransactionState = {
      id: "tx-1",
      amount: 100,
      date: FIXED_DATE,
      description: "Café",
      categoryId: "cat-1",
      appliedRuleId: "rule-1",
    };

    const roundTripped = toTransactionState(toTransaction(state));

    expect(roundTripped).toEqual(state);
  });

  it("preserves a null appliedRuleId for a manually categorized transaction", () => {
    const state: TransactionState = {
      id: "tx-2",
      amount: 50,
      date: FIXED_DATE,
      description: "Manual",
      categoryId: "cat-2",
      appliedRuleId: null,
    };

    expect(toTransactionState(toTransaction(state)).appliedRuleId).toBeNull();
  });

  it("maps a rule-owned entity back to a state carrying its rule id", () => {
    const transaction = Transaction.Rehydrate({
      id: "tx-3",
      amount: 10,
      date: FIXED_DATE,
      description: "Café",
      categoryId: "cat-1",
      appliedRuleId: "rule-9",
    });

    const state = toTransactionState(transaction);

    expect(state.appliedRuleId).toBe("rule-9");
    expect(state.categoryId).toBe("cat-1");
  });

  it("creates new transactions without provenance", () => {
    const transaction = createTransaction({
      amount: 10,
      date: FIXED_DATE,
      description: "Nueva",
      categoryId: null,
    });

    expect(transaction.appliedRuleId).toBeNull();
    expect(toTransactionState(transaction).appliedRuleId).toBeNull();
  });

  it("passes the category id through instead of a snapshot", () => {
    const state: TransactionState = {
      id: "tx-1",
      amount: 100,
      date: FIXED_DATE,
      description: "Café",
      categoryId: "cat-1",
      appliedRuleId: null,
    };

    expect(toTransaction(state).categoryId).toBe("cat-1");
    expect(
      createTransaction({
        amount: 100,
        date: FIXED_DATE,
        description: "Café",
        categoryId: "cat-1",
      }).categoryId,
    ).toBe("cat-1");
  });

  it("keeps an uncategorized transaction uncategorized", () => {
    const state: TransactionState = {
      id: "tx-1",
      amount: 100,
      date: FIXED_DATE,
      description: "Café",
      categoryId: null,
      appliedRuleId: null,
    };

    expect(toTransactionState(toTransaction(state)).categoryId).toBeNull();
  });
});
