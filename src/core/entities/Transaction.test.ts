import { describe, expect, it } from "vitest";
import { Category } from "@/core/entities/Category";
import {
  RULE_CONDITION_TYPES,
  type CategorizationRule,
} from "@/core/entities/CategorizationRule";
import { Transaction, resolveAppliedRuleIdAfterEdit } from "./Transaction";

const category = (name: string) => Category.Create({ name });

const rule = (id: string, target: Category): CategorizationRule => ({
  id,
  order: 1,
  enabled: true,
  condition: {
    type: RULE_CONDITION_TYPES.DESCRIPTION_CONTAINS,
    values: ["super"],
  },
  category: target,
});

describe("Transaction provenance", () => {
  it("treats a category without an owning rule as manual", () => {
    const transaction = Transaction.Create({
      amount: 10,
      date: Date.now(),
      description: "Supermarket",
      categories: category("Food"),
    });

    expect(transaction.appliedRuleId).toBeNull();
    expect(transaction.isManuallyCategorized).toBe(true);
  });

  it("does not treat an uncategorized transaction as manual", () => {
    const transaction = Transaction.Create({
      amount: 10,
      date: Date.now(),
      description: "Supermarket",
    });

    expect(transaction.categories).toBeNull();
    expect(transaction.isManuallyCategorized).toBe(false);
  });

  it("does not treat a rule-applied category as manual", () => {
    const transaction = Transaction.Create({
      amount: 10,
      date: Date.now(),
      description: "Supermarket",
    }).withCategoryFromRule(rule("rule-1", category("Food")));

    expect(transaction.appliedRuleId).toBe("rule-1");
    expect(transaction.categories?.name).toBe("Food");
    expect(transaction.isManuallyCategorized).toBe(false);
  });

  it("normalizes legacy records missing appliedRuleId to null", () => {
    const legacy = Transaction.Rehydrate({
      id: "legacy-1",
      amount: 10,
      date: Date.now(),
      description: "Supermarket",
      categories: category("Food"),
    });

    expect(legacy.appliedRuleId).toBeNull();
    expect(legacy.isManuallyCategorized).toBe(true);
  });

  it("clears the category and the rule ownership when reconciliation reverts", () => {
    const fromRule = Transaction.Create({
      amount: 10,
      date: Date.now(),
      description: "Supermarket",
    }).withCategoryFromRule(rule("rule-1", category("Food")));

    const reverted = fromRule.uncategorized();

    expect(reverted.categories).toBeNull();
    expect(reverted.appliedRuleId).toBeNull();
    expect(reverted.isManuallyCategorized).toBe(false);
    expect(fromRule.categories?.name).toBe("Food");
  });

  it("returns new instances without mutating the original", () => {
    const original = Transaction.Create({
      amount: 10,
      date: Date.now(),
      description: "Supermarket",
    });

    const categorized = original.withCategoryFromRule(
      rule("rule-1", category("Food")),
    );

    expect(categorized).not.toBe(original);
    expect(original.categories).toBeNull();
    expect(original.appliedRuleId).toBeNull();
  });
});

describe("resolveAppliedRuleIdAfterEdit", () => {
  it("clears provenance when the category changes", () => {
    expect(
      resolveAppliedRuleIdAfterEdit({
        currentCategoryId: "cat-old",
        nextCategoryId: "cat-new",
        appliedRuleId: "rule-1",
      }),
    ).toBeNull();
  });

  it("clears provenance when a rule-owned category is removed by hand", () => {
    expect(
      resolveAppliedRuleIdAfterEdit({
        currentCategoryId: "cat-old",
        nextCategoryId: null,
        appliedRuleId: "rule-1",
      }),
    ).toBeNull();
  });

  it("preserves provenance when only the description changes", () => {
    expect(
      resolveAppliedRuleIdAfterEdit({
        currentCategoryId: "cat-old",
        nextCategoryId: "cat-old",
        appliedRuleId: "rule-1",
      }),
    ).toBe("rule-1");
  });

  it("keeps a manual transaction manual when the category is untouched", () => {
    expect(
      resolveAppliedRuleIdAfterEdit({
        currentCategoryId: "cat-old",
        nextCategoryId: "cat-old",
        appliedRuleId: null,
      }),
    ).toBeNull();
  });
});
