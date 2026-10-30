import { describe, expect, it, vi } from "vitest";
import { Category } from "@/core/entities/Category";
import {
  RULE_CONDITION_TYPES,
  type CategorizationRule,
} from "@/core/entities/CategorizationRule";
import { CsvSchema } from "@/core/entities/Import/CsvSchema";
import { Transaction } from "@/core/entities/Transaction";
import type { ITransactionRepository } from "@/core/repositories/ITransactionRepository";
import { ImportTransactions } from "./ImportTransactions";

const mapping = {
  dateColumn: "date",
  amountColumn: "amount",
  descriptionColumn: "description",
};

describe("ImportTransactions categorization", () => {
  it("persists categorized and unmatched transactions", async () => {
    const food = Category.Create({ name: "Food" });
    const mapper = {
      map: vi.fn(),
      mapOne: vi
        .fn()
        .mockReturnValueOnce(
          Transaction.Create({
            amount: 10,
            date: Date.now(),
            description: "Supermarket",
          }),
        )
        .mockReturnValueOnce(
          Transaction.Create({
            amount: 20,
            date: Date.now(),
            description: "Salary",
          }),
        ),
    };
    const saved: Transaction[] = [];
    const repository = {
      saveMany: vi.fn(async (transactions: Transaction[]) => {
        saved.push(...transactions);
        return { imported: transactions.length, failed: [] };
      }),
    } as unknown as ITransactionRepository;
    const importTransactions = ImportTransactions(
      { validate: vi.fn() },
      mapper,
      repository,
      async () => [
        {
          id: "rule-1",
          order: 1,
          enabled: true,
          condition: {
            type: RULE_CONDITION_TYPES.DESCRIPTION_CONTAINS,
            values: ["super"],
          },
          category: food,
        },
      ],
    );

    const result = await importTransactions({
      rows: [{ description: "Supermarket" }, { description: "Salary" }],
      schema: new CsvSchema(["description"]),
      mapping,
    });

    expect(result).toMatchObject({ imported: 2, total: 2, failed: [] });
    expect(result.saved).toHaveLength(2);
    expect(result.saved[0].description).toBe("Supermarket");
    expect(saved[0].categories?.name).toBe("Food");
    expect(saved[0].appliedRuleId).toBe("rule-1");
    expect(saved[1].categories).toBeNull();
    expect(saved[1].appliedRuleId).toBeNull();
  });

  it("persists the category from the first matching rule", async () => {
    const food = Category.Create({ name: "Food" });
    const health = Category.Create({ name: "Health" });
    const transaction = Transaction.Create({
      amount: 10,
      date: Date.now(),
      description: "Supermarket pharmacy",
    });
    const saved: Transaction[] = [];
    const repository = {
      saveMany: vi.fn(async (transactions: Transaction[]) => {
        saved.push(...transactions);
        return { imported: transactions.length, failed: [] };
      }),
    } as unknown as ITransactionRepository;
    const importTransactions = ImportTransactions(
      { validate: vi.fn() },
      { map: vi.fn(), mapOne: vi.fn(() => transaction) },
      repository,
      async () => [
        {
          id: "rule-1",
          order: 1,
          enabled: true,
          condition: {
            type: RULE_CONDITION_TYPES.DESCRIPTION_CONTAINS,
            values: ["super"],
          },
          category: food,
        },
        {
          id: "rule-2",
          order: 2,
          enabled: true,
          condition: {
            type: RULE_CONDITION_TYPES.DESCRIPTION_CONTAINS,
            values: ["pharmacy"],
          },
          category: health,
        },
      ],
    );

    await importTransactions({
      rows: [{ description: transaction.description }],
      schema: new CsvSchema(["description"]),
      mapping,
    });

    expect(saved[0].categories?.name).toBe("Food");
    expect(saved[0].appliedRuleId).toBe("rule-1");
  });

  it("never reverts a pre-existing category", async () => {
    const food = Category.Create({ name: "Food" });
    const orphanedRule: CategorizationRule = {
      id: "rule-deleted",
      order: 1,
      enabled: true,
      condition: {
        type: RULE_CONDITION_TYPES.DESCRIPTION_CONTAINS,
        values: ["super"],
      },
      category: food,
    };
    const existing = Transaction.Create({
      amount: 10,
      date: Date.now(),
      description: "Salary",
    }).withCategoryFromRule(orphanedRule);
    const saved: Transaction[] = [];
    const repository = {
      saveMany: vi.fn(async (transactions: Transaction[]) => {
        saved.push(...transactions);
        return { imported: transactions.length, failed: [] };
      }),
    } as unknown as ITransactionRepository;
    const importTransactions = ImportTransactions(
      { validate: vi.fn() },
      { map: vi.fn(), mapOne: vi.fn(() => existing) },
      repository,
      async () => [],
    );

    await importTransactions({
      rows: [{ description: existing.description }],
      schema: new CsvSchema(["description"]),
      mapping,
    });

    expect(saved[0].categories?.name).toBe("Food");
    expect(saved[0].appliedRuleId).toBe("rule-deleted");
  });
});
