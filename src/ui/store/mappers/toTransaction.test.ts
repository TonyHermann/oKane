import { describe, expect, it } from "vitest";
import { Category } from "@/core/entities/Category";
import { Transaction } from "@/core/entities/Transaction";
import type { TransactionState } from "../slices/transactionsSlices";
import {
  createTransaction,
  toTransaction,
  toTransactionState,
} from "./toTransaction";
import type { CategoryState } from "../slices/categorySlices";

const FIXED_DATE = new Date("2024-01-01").getTime();

describe("toTransaction → toTransactionState round-trip", () => {
  it("preserves appliedRuleId and the category snapshot", () => {
    const state: TransactionState = {
      id: "tx-1",
      amount: 100,
      date: FIXED_DATE,
      description: "Café",
      categories: { id: "cat-1", name: "Food", created_at: FIXED_DATE },
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
      categories: { id: "cat-2", name: "Otros", created_at: FIXED_DATE },
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
      categories: Category.Rehydrate({
        id: "cat-1",
        name: "Food",
        created_at: FIXED_DATE,
      }),
      appliedRuleId: "rule-9",
    });

    const state = toTransactionState(transaction);

    expect(state.appliedRuleId).toBe("rule-9");
    expect(state.categories?.id).toBe("cat-1");
  });

  it("creates new transactions without provenance", () => {
    const transaction = createTransaction({
      amount: 10,
      date: FIXED_DATE,
      description: "Nueva",
      categories: null,
    });

    expect(transaction.appliedRuleId).toBeNull();
    expect(toTransactionState(transaction).appliedRuleId).toBeNull();
  });

  it("returns its category as an entity, not a plain object", () => {
    const state: TransactionState = {
      id: "tx-1",
      amount: 100,
      date: FIXED_DATE,
      description: "Café",
      categories: { id: "cat-1", name: "Food", created_at: FIXED_DATE },
      appliedRuleId: null,
    };

    const transaction = toTransaction(state);

    expect(transaction.categories).toBeInstanceOf(Category);
  });

  it("createTransaction returns its category as an entity, not a plain object", () => {
    const transaction = createTransaction({
      amount: 100,
      date: FIXED_DATE,
      description: "Café",
      categories: { id: "cat-1", name: "Food", created_at: FIXED_DATE },
    });

    expect(transaction.categories).toBeInstanceOf(Category);
  });

  it("does not share category with the store", () => {
    const storedCategory: CategoryState = {
      id: "cat-1",
      name: "Food",
      created_at: FIXED_DATE,
    };

    const state: TransactionState = {
      id: "tx-1",
      amount: 100,
      date: FIXED_DATE,
      description: "Café",
      categories: storedCategory,
      appliedRuleId: null,
    };

    const transaction = toTransaction(state);
    storedCategory.name = "Modified";

    expect(transaction.categories?.name).toBe("Food");
  });
});
