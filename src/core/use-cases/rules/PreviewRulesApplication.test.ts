import { describe, expect, it, vi } from "vitest";
import { Category } from "@/core/entities/Category";
import {
  RULE_CONDITION_TYPES,
  type CategorizationRule,
} from "@/core/entities/CategorizationRule";
import { Transaction } from "@/core/entities/Transaction";
import type { ICategorizationRuleRepository } from "@/core/repositories/ICategorizationRuleRepository";
import type { ITransactionRepository } from "@/core/repositories/ITransactionRepository";
import { PreviewRulesApplication } from "./PreviewRulesApplication";

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

describe("PreviewRulesApplication", () => {
  it("returns serializable counts without writing", async () => {
    const matched = Transaction.Create({
      amount: 10,
      date: Date.now(),
      description: "Supermarket",
    });
    const manual = Transaction.Create({
      amount: 20,
      date: Date.now(),
      description: "Salary",
      categories: category("Manual"),
    });
    const orphaned = Transaction.Create({
      amount: 30,
      date: Date.now(),
      description: "Rent",
    }).withCategoryFromRule(rule(9, ["rent"], category("Home")));

    const update = vi.fn(async () => undefined);
    const transactionRepository = {
      findAll: vi.fn(async () => [matched, manual, orphaned]),
      update,
    } as unknown as ITransactionRepository;
    const ruleRepository = {
      findAll: vi.fn(async () => [
        rule(1, ["super"], category("Food")),
        rule(2, ["rent"], category("Home"), { enabled: false }),
      ]),
    } as unknown as ICategorizationRuleRepository;

    const preview = await PreviewRulesApplication(
      transactionRepository,
      ruleRepository,
    )();

    expect(preview).toEqual({
      toCategorize: 1,
      toRevert: 1,
      unchanged: 1,
      totalTransactions: 3,
      totalRules: 2,
      enabledRules: 1,
    });
    expect(
      Object.values(preview).every((value) => typeof value === "number"),
    ).toBe(true);
    expect(update).not.toHaveBeenCalled();
  });
});
