import { describe, expect, it } from "vitest";
import {
  calculatePeriodSpending,
  currentSpendingPeriod,
  GetSpendingOverview,
  previousSpendingPeriod,
  sameMonthPreviousYearPeriod,
  spendingPeriodFromMonthInput,
  spendingPeriodOf,
  spendingPeriodToMonthInput,
  type SpendingPeriod,
  type SpendingTransaction,
} from "./GetSpendingOverview";

const at = (year: number, month: number, day = 15): number =>
  new Date(year, month - 1, day, 12).getTime();

const tx = (
  amount: number,
  date: number,
  category: { id: string; name: string } | null = null,
): SpendingTransaction => ({ amount, date, categories: category });

const JANUARY: SpendingPeriod = { year: 2024, month: 1 };

describe("spending period helpers", () => {
  it("derives the local calendar month from a timestamp", () => {
    expect(spendingPeriodOf(at(2024, 3, 31))).toEqual({
      year: 2024,
      month: 3,
    });
  });

  it("derives the current period from a date", () => {
    expect(currentSpendingPeriod(new Date(2024, 4, 9))).toEqual({
      year: 2024,
      month: 5,
    });
  });

  it("rolls the previous period over a year boundary", () => {
    expect(previousSpendingPeriod({ year: 2024, month: 1 })).toEqual({
      year: 2023,
      month: 12,
    });
    expect(previousSpendingPeriod({ year: 2024, month: 6 })).toEqual({
      year: 2024,
      month: 5,
    });
  });

  it("compares against the same month of the previous year", () => {
    expect(sameMonthPreviousYearPeriod({ year: 2024, month: 6 })).toEqual({
      year: 2023,
      month: 6,
    });
  });

  it("round-trips the month input value", () => {
    expect(spendingPeriodToMonthInput({ year: 2024, month: 2 })).toBe(
      "2024-02",
    );
    expect(spendingPeriodFromMonthInput("2024-02")).toEqual({
      year: 2024,
      month: 2,
    });
    expect(spendingPeriodFromMonthInput("")).toBeNull();
    expect(spendingPeriodFromMonthInput("2024-13")).toBeNull();
  });
});

describe("calculatePeriodSpending", () => {
  it("adds expenses, income and the resulting balance", () => {
    const result = calculatePeriodSpending(
      [
        tx(-100, at(2024, 1, 3)),
        tx(-50.5, at(2024, 1, 10)),
        tx(200, at(2024, 1, 20)),
      ],
      JANUARY,
    );

    expect(result.totalSpend).toBe(150.5);
    expect(result.income).toBe(200);
    expect(result.balance).toBe(49.5);
    expect(result.transactionCount).toBe(3);
    expect(result.expensesCount).toBe(2);
  });

  it("ignores transactions outside the period", () => {
    const result = calculatePeriodSpending(
      [
        tx(-10, at(2024, 1, 2)),
        tx(-99, at(2024, 2, 2)),
        tx(-99, at(2023, 1, 2)),
      ],
      JANUARY,
    );

    expect(result.totalSpend).toBe(10);
    expect(result.transactionCount).toBe(1);
  });

  it("groups expenses by category and keeps uncategorized spend explicit", () => {
    const food = { id: "cat-food", name: "Comida" };
    const home = { id: "cat-home", name: "Hogar" };

    const result = calculatePeriodSpending(
      [
        tx(-30, at(2024, 1, 4), food),
        tx(-20, at(2024, 1, 5), food),
        tx(-40, at(2024, 1, 6), home),
        tx(-10, at(2024, 1, 7)),
        tx(500, at(2024, 1, 8), food),
      ],
      JANUARY,
    );

    expect(result.totalSpend).toBe(100);
    expect(result.uncategorizedSpend).toBe(10);
    expect(result.byCategory).toEqual([
      {
        categoryId: "cat-food",
        categoryName: "Comida",
        amount: 50,
        share: 0.5,
      },
      {
        categoryId: "cat-home",
        categoryName: "Hogar",
        amount: 40,
        share: 0.4,
      },
    ]);
  });

  it("returns an empty period with a neutral balance", () => {
    const result = calculatePeriodSpending([], JANUARY);

    expect(result).toMatchObject({
      totalSpend: 0,
      income: 0,
      balance: 0,
      transactionCount: 0,
      expensesCount: 0,
      byCategory: [],
      uncategorizedSpend: 0,
    });
  });
});

describe("GetSpendingOverview", () => {
  it("compares the current month with the previous month", () => {
    const overview = GetSpendingOverview(
      [tx(-120, at(2024, 2, 5)), tx(-80, at(2024, 1, 5))],
      { year: 2024, month: 2 },
    );

    expect(overview.current.totalSpend).toBe(120);
    expect(overview.previousPeriod.totalSpend).toBe(80);
    expect(overview.previousPeriodDelta).toEqual({
      current: 120,
      previous: 80,
      absolute: 40,
      percentage: 50,
      direction: "up",
    });
  });

  it("compares the current month with the same month last year", () => {
    const overview = GetSpendingOverview(
      [tx(-120, at(2024, 2, 5)), tx(-160, at(2023, 2, 5))],
      { year: 2024, month: 2 },
    );

    expect(overview.sameMonthLastYear.totalSpend).toBe(160);
    expect(overview.yearOverYearDelta.absolute).toBe(-40);
    expect(overview.yearOverYearDelta.percentage).toBe(-25);
    expect(overview.yearOverYearDelta.direction).toBe("down");
  });

  it("reports a null percentage when the comparison period is empty", () => {
    const overview = GetSpendingOverview([tx(-50, at(2024, 2, 5))], {
      year: 2024,
      month: 2,
    });

    expect(overview.previousPeriodDelta.percentage).toBeNull();
    expect(overview.previousPeriodDelta.direction).toBe("up");
    expect(overview.yearOverYearDelta.percentage).toBeNull();
  });

  it("reports no change when both periods are empty", () => {
    const overview = GetSpendingOverview([], { year: 2024, month: 2 });

    expect(overview.previousPeriodDelta).toMatchObject({
      absolute: 0,
      percentage: null,
      direction: "flat",
    });
  });
});
