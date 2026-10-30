import { describe, expect, it } from "vitest";
import { Category } from "@/core/entities/Category";
import {
  RULE_CONDITION_TYPES,
  type CategorizationRule,
} from "@/core/entities/CategorizationRule";
import { Transaction } from "@/core/entities/Transaction";
import { findMatchingRule, planRuleApplication } from "./ApplyCategorizationRules";

const category = (name: string) => Category.Create({ name });

const rule = (
  order: number,
  values: string[],
  target: Category,
  overrides: Partial<CategorizationRule> = {},
): CategorizationRule => ({
  id: `rule-${order}`,
  order,
  enabled: true,
  condition: { type: RULE_CONDITION_TYPES.DESCRIPTION_CONTAINS, values },
  category: target,
  ...overrides,
});

const transaction = (description: string) =>
  Transaction.Create({ amount: 10, date: Date.now(), description });

describe("findMatchingRule", () => {
  it("assigns the category from the first matching rule", () => {
    const match = findMatchingRule("Supermarket and pharmacy", [
      rule(1, ["supermarket"], category("Food")),
      rule(2, ["pharmacy"], category("Health")),
    ]);

    expect(match?.category.name).toBe("Food");
  });

  it("sorts by ascending order before picking the first match", () => {
    const match = findMatchingRule("Supermarket", [
      rule(2, ["supermarket"], category("Later")),
      rule(1, ["supermarket"], category("First")),
    ]);

    expect(match?.category.name).toBe("First");
  });

  it("matches the rule when any of its values is contained in the description", () => {
    const match = findMatchingRule("Payment to Acme store", [
      rule(1, ["globex", "acme"], category("Work")),
    ]);

    expect(match?.category.name).toBe("Work");
  });

  it("lowercases the description internally", () => {
    const match = findMatchingRule("SUPERMARKET", [
      rule(1, ["supermarket"], category("Food")),
    ]);

    expect(match?.category.name).toBe("Food");
  });

  it("leaves unmatched transactions uncategorized", () => {
    const match = findMatchingRule("Salary", [
      rule(1, ["rent"], category("Home")),
    ]);

    expect(match).toBeNull();
  });

  it("ignores disabled rules", () => {
    const match = findMatchingRule("Supermarket", [
      rule(1, ["supermarket"], category("Food"), { enabled: false }),
    ]);

    expect(match).toBeNull();
  });

  it("ignores malformed rules without blocking valid matches", () => {
    const malformedRule = {
      ...rule(1, ["super"], category("Food")),
      condition: { type: "unknown", values: 3 },
    } as unknown as CategorizationRule;

    const match = findMatchingRule("Supermarket", [
      malformedRule,
      rule(2, ["supermarket"], category("Groceries")),
    ]);

    expect(match?.category.name).toBe("Groceries");
  });
});

describe("planRuleApplication", () => {
  it("preserves a manually categorized transaction", () => {
    const manual = Transaction.Create({
      amount: 10,
      date: Date.now(),
      description: "Supermarket",
      categories: category("Manual"),
    });

    const plan = planRuleApplication(
      [manual],
      [rule(1, ["super"], category("Food"))],
    );

    expect(plan.unchanged).toEqual([manual]);
    expect(plan.toCategorize).toHaveLength(0);
    expect(plan.toRevert).toHaveLength(0);
  });

  it("does not rewrite an idempotent rule match", () => {
    const food = category("Food");
    const applied = transaction("Supermarket").withCategoryFromRule(
      rule(1, ["super"], food),
    );

    const plan = planRuleApplication([applied], [rule(1, ["super"], food)]);

    expect(plan.unchanged).toEqual([applied]);
    expect(plan.toCategorize).toHaveLength(0);
    expect(plan.toRevert).toHaveLength(0);
  });

  it("recategorizes when a different rule wins now", () => {
    const applied = transaction("Supermarket").withCategoryFromRule(
      rule(9, ["old"], category("Old")),
    );
    const winner = rule(1, ["super"], category("Food"));

    const plan = planRuleApplication([applied], [winner]);

    expect(plan.toCategorize).toEqual([{ transaction: applied, rule: winner }]);
    expect(plan.unchanged).toHaveLength(0);
    expect(plan.toRevert).toHaveLength(0);
  });

  it("recategorizes when the owning rule changed its target category", () => {
    const applied = transaction("Supermarket").withCategoryFromRule(
      rule(1, ["super"], category("Food")),
    );
    const edited = rule(1, ["super"], category("Groceries"));

    const plan = planRuleApplication([applied], [edited]);

    expect(plan.toCategorize).toEqual([{ transaction: applied, rule: edited }]);
    expect(plan.unchanged).toHaveLength(0);
  });

  it("reverts when the owning rule was deleted", () => {
    const applied = transaction("Supermarket").withCategoryFromRule(
      rule(9, ["super"], category("Food")),
    );

    const plan = planRuleApplication(
      [applied],
      [rule(1, ["rent"], category("Home"))],
    );

    expect(plan.toRevert).toEqual([applied]);
    expect(plan.toCategorize).toHaveLength(0);
    expect(plan.unchanged).toHaveLength(0);
  });

  it("preserves the category when the owning rule is disabled", () => {
    const applied = transaction("Supermarket").withCategoryFromRule(
      rule(1, ["super"], category("Food")),
    );

    const plan = planRuleApplication(
      [applied],
      [rule(1, ["super"], category("Food"), { enabled: false })],
    );

    expect(plan.unchanged).toEqual([applied]);
    expect(plan.toCategorize).toHaveLength(0);
    expect(plan.toRevert).toHaveLength(0);
  });

  it("reverts when the owning rule no longer matches", () => {
    const applied = transaction("Supermarket").withCategoryFromRule(
      rule(1, ["super"], category("Food")),
    );

    const plan = planRuleApplication(
      [applied],
      [rule(1, ["rent"], category("Food"))],
    );

    expect(plan.toRevert).toEqual([applied]);
    expect(plan.unchanged).toHaveLength(0);
  });

  it("leaves an uncategorized transaction with no match untouched", () => {
    const plain = transaction("Salary");

    const plan = planRuleApplication(
      [plain],
      [rule(1, ["rent"], category("Home"))],
    );

    expect(plan.unchanged).toEqual([plain]);
    expect(plan.toCategorize).toHaveLength(0);
    expect(plan.toRevert).toHaveLength(0);
  });

  it("leaves inconsistent legacy state untouched when nothing matches", () => {
    const inconsistent = Transaction.Rehydrate({
      id: "legacy-1",
      amount: 10,
      date: Date.now(),
      description: "Salary",
      appliedRuleId: "rule-1",
    });

    const plan = planRuleApplication(
      [inconsistent],
      [rule(1, ["rent"], category("Home"))],
    );

    expect(plan.unchanged).toEqual([inconsistent]);
    expect(plan.toRevert).toHaveLength(0);
  });

  it("categorizes inconsistent legacy state when a rule matches", () => {
    const inconsistent = Transaction.Rehydrate({
      id: "legacy-1",
      amount: 10,
      date: Date.now(),
      description: "Supermarket",
      appliedRuleId: "rule-1",
    });
    const match = rule(1, ["super"], category("Food"));

    const plan = planRuleApplication([inconsistent], [match]);

    expect(plan.toCategorize).toEqual([
      { transaction: inconsistent, rule: match },
    ]);
    expect(plan.unchanged).toHaveLength(0);
  });

  it("does not mutate the transactions it is given", () => {
    const plain = transaction("Supermarket");
    const transactions = [plain];

    const plan = planRuleApplication(
      transactions,
      [rule(1, ["super"], category("Food"))],
    );

    expect(plan.toCategorize[0].transaction).toBe(plain);
    expect(plain.categories).toBeNull();
    expect(plain.appliedRuleId).toBeNull();
    expect(transactions).toEqual([plain]);
  });
});
