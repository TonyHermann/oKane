import { describe, expect, it, vi } from "vitest";
import { Category } from "@/core/entities/Category";
import { Transaction } from "@/core/entities/Transaction";
import {
  RULE_CONDITION_TYPES,
  type CategorizationRule,
} from "@/core/entities/CategorizationRule";
import type { ICategorizationRuleRepository } from "@/core/repositories/ICategorizationRuleRepository";
import type { ITransactionRepository } from "@/core/repositories/ITransactionRepository";
import { ApplyRulesToExistingTransactions } from "./ApplyRulesToExistingTransactions";

const rule = (
  order: number,
  values: string[],
  category: Category,
): CategorizationRule => ({
  id: `rule-${order}`,
  order,
  enabled: true,
  condition: { type: RULE_CONDITION_TYPES.DESCRIPTION_CONTAINS, values },
  category,
});

describe("ApplyRulesToExistingTransactions", () => {
  it("updates only the transactions matched by a rule", async () => {
    const supermarket = Transaction.Create({
      amount: 10,
      date: Date.now(),
      description: "Supermarket",
    });
    const salary = Transaction.Create({
      amount: 100,
      date: Date.now(),
      description: "Salary",
    });
    const updatedTransactions: Transaction[] = [];
    const transactionRepository = {
      findAll: vi.fn(async () => [supermarket, salary]),
      update: vi.fn(async (transaction: Transaction) => {
        updatedTransactions.push(transaction);
      }),
    } as unknown as ITransactionRepository;
    const ruleRepository = {
      findAll: vi.fn(async () => [rule(1, ["super"], Category.Create({ name: "Food" }))]),
    } as unknown as ICategorizationRuleRepository;

    const updated = await ApplyRulesToExistingTransactions(
      transactionRepository,
      ruleRepository,
    )();

    expect(updated).toHaveLength(1);
    expect(updated[0].id).toBe(supermarket.id);
    expect(updated[0].categories?.name).toBe("Food");
    expect(updatedTransactions).toHaveLength(1);
    expect(updatedTransactions[0].id).toBe(supermarket.id);
    expect(updatedTransactions[0]).not.toBe(supermarket);
    expect(updatedTransactions[0].categories?.name).toBe("Food");
  });

  it("returns the updated transactions when several match", async () => {
    const first = Transaction.Create({
      amount: 10,
      date: Date.now(),
      description: "Supermarket",
    });
    const second = Transaction.Create({
      amount: 20,
      date: Date.now(),
      description: "Pharmacy",
    });
    const update = vi.fn(async () => undefined);
    const transactionRepository = {
      findAll: vi.fn(async () => [first, second]),
      update,
    } as unknown as ITransactionRepository;
    const ruleRepository = {
      findAll: vi.fn(async () => [
        rule(1, ["super"], Category.Create({ name: "Food" })),
        rule(2, ["pharmacy"], Category.Create({ name: "Health" })),
      ]),
    } as unknown as ICategorizationRuleRepository;

    const updated = await ApplyRulesToExistingTransactions(
      transactionRepository,
      ruleRepository,
    )();

    expect(updated).toHaveLength(2);
    expect(update).toHaveBeenCalledTimes(2);
  });

  it("performs no updates when nothing matches", async () => {
    const salary = Transaction.Create({
      amount: 100,
      date: Date.now(),
      description: "Salary",
    });
    const update = vi.fn(async () => undefined);
    const transactionRepository = {
      findAll: vi.fn(async () => [salary]),
      update,
    } as unknown as ITransactionRepository;
    const ruleRepository = {
      findAll: vi.fn(async () => [rule(1, ["rent"], Category.Create({ name: "Home" }))]),
    } as unknown as ICategorizationRuleRepository;

    const updated = await ApplyRulesToExistingTransactions(
      transactionRepository,
      ruleRepository,
    )();

    expect(updated).toHaveLength(0);
    expect(update).not.toHaveBeenCalled();
  });

  it("reverts a category whose owning rule was deleted", async () => {
    const orphanedRule = rule(1, ["super"], Category.Create({ name: "Food" }));
    const categorized = Transaction.Create({
      amount: 10,
      date: Date.now(),
      description: "Supermarket",
    }).withCategoryFromRule(orphanedRule);
    const update = vi.fn(async () => undefined);
    const transactionRepository = {
      findAll: vi.fn(async () => [categorized]),
      update,
    } as unknown as ITransactionRepository;
    const ruleRepository = {
      findAll: vi.fn(async () => [
        rule(2, ["rent"], Category.Create({ name: "Home" })),
      ]),
    } as unknown as ICategorizationRuleRepository;

    const updated = await ApplyRulesToExistingTransactions(
      transactionRepository,
      ruleRepository,
    )();

    expect(updated).toHaveLength(1);
    expect(updated[0].id).toBe(categorized.id);
    expect(updated[0].categories).toBeNull();
    expect(updated[0].appliedRuleId).toBeNull();
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("keeps the category when the owning rule is disabled", async () => {
    const categorized = Transaction.Create({
      amount: 10,
      date: Date.now(),
      description: "Supermarket",
    }).withCategoryFromRule(
      rule(1, ["super"], Category.Create({ name: "Food" })),
    );
    const update = vi.fn(async () => undefined);
    const transactionRepository = {
      findAll: vi.fn(async () => [categorized]),
      update,
    } as unknown as ITransactionRepository;
    const ruleRepository = {
      findAll: vi.fn(async () => [
        {
          ...rule(1, ["super"], Category.Create({ name: "Food" })),
          enabled: false,
        },
      ]),
    } as unknown as ICategorizationRuleRepository;

    const updated = await ApplyRulesToExistingTransactions(
      transactionRepository,
      ruleRepository,
    )();

    expect(updated).toHaveLength(0);
    expect(update).not.toHaveBeenCalled();
  });
});
