/**
 * Spending dashboard metric model and aggregation.
 *
 * Pure core: no React, no storage, no formatting. The UI passes the
 * transactions it already holds and a period, and gets every metric back in
 * one pass so period changes stay consistent across the dashboard.
 */

/**
 * The projection the aggregation needs from a transaction.
 *
 * Declared structurally so both domain entities and plain store state satisfy
 * it without the core depending on the UI layer.
 */
export interface SpendingTransaction {
  amount: number;
  date: number;
  categories: { id: string; name: string } | null;
}

/** A calendar month. `month` is 1-12, not the zero-based index of `Date`. */
export interface SpendingPeriod {
  year: number;
  month: number;
}

export type DeltaDirection = "up" | "down" | "flat";

export interface SpendingDelta {
  current: number;
  previous: number;
  /** `current - previous`. Positive means the current period spent more. */
  absolute: number;
  /** `null` when the baseline is zero, because the change is undefined. */
  percentage: number | null;
  direction: DeltaDirection;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  amount: number;
  /** Fraction of the period's total spend, 0-1. */
  share: number;
}

export interface PeriodSpending {
  period: SpendingPeriod;
  /** Sum of expense magnitudes (always >= 0). */
  totalSpend: number;
  /** Sum of positive amounts (always >= 0). */
  income: number;
  /** `income - totalSpend`. */
  balance: number;
  transactionCount: number;
  expensesCount: number;
  /** Categorized expenses, highest amount first. */
  byCategory: CategorySpending[];
  /** Expenses without a category, kept out of `byCategory` on purpose. */
  uncategorizedSpend: number;
}

export interface SpendingOverview {
  current: PeriodSpending;
  previousPeriod: PeriodSpending;
  sameMonthLastYear: PeriodSpending;
  previousPeriodDelta: SpendingDelta;
  yearOverYearDelta: SpendingDelta;
}

const padMonth = (month: number): string => String(month).padStart(2, "0");

/** Extract the calendar month of a timestamp, in the user's local time. */
export const spendingPeriodOf = (timestamp: number): SpendingPeriod => {
  const date = new Date(timestamp);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
};

export const currentSpendingPeriod = (
  now: number | Date = Date.now(),
): SpendingPeriod => {
  const date = now instanceof Date ? now : new Date(now);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
};

export const previousSpendingPeriod = (
  period: SpendingPeriod,
): SpendingPeriod => {
  if (period.month === 1) {
    return { year: period.year - 1, month: 12 };
  }
  return { year: period.year, month: period.month - 1 };
};

export const sameMonthPreviousYearPeriod = (
  period: SpendingPeriod,
): SpendingPeriod => ({ year: period.year - 1, month: period.month });

/** Format a period for `<input type="month">` (`YYYY-MM`). */
export const spendingPeriodToMonthInput = (period: SpendingPeriod): string =>
  `${period.year}-${padMonth(period.month)}`;

/** Parse an `<input type="month">` value; `null` for empty or invalid input. */
export const spendingPeriodFromMonthInput = (
  value: string,
): SpendingPeriod | null => {
  const match = /^(\d{4})-(\d{2})$/.exec(value);

  if (match === null) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (!Number.isInteger(year) || month < 1 || month > 12) return null;

  return { year, month };
};

const isInPeriod = (timestamp: number, period: SpendingPeriod): boolean => {
  const date = new Date(timestamp);
  return (
    date.getFullYear() === period.year && date.getMonth() + 1 === period.month
  );
};

/**
 * Signed-amount policy: bank amounts are stored as exported, so a negative
 * amount is an expense and a positive amount is income.
 *
 * TODO: [currency-import] Make this configurable when imports expose explicit
 * income/expense semantics instead of relying on the sign.
 */
const expenseMagnitude = (amount: number): number => (amount < 0 ? -amount : 0);
const incomeMagnitude = (amount: number): number => (amount > 0 ? amount : 0);

export const calculatePeriodSpending = (
  transactions: SpendingTransaction[],
  period: SpendingPeriod,
): PeriodSpending => {
  const categoryTotals = new Map<string, { name: string; amount: number }>();
  let totalSpend = 0;
  let income = 0;
  let transactionCount = 0;
  let expensesCount = 0;
  let uncategorizedSpend = 0;

  transactions.forEach((transaction) => {
    if (!isInPeriod(transaction.date, period)) return;

    transactionCount += 1;

    if (transaction.amount < 0) {
      const spend = expenseMagnitude(transaction.amount);
      totalSpend += spend;
      expensesCount += 1;

      if (transaction.categories === null) {
        uncategorizedSpend += spend;
      } else {
        const current = categoryTotals.get(transaction.categories.id);
        categoryTotals.set(transaction.categories.id, {
          name: transaction.categories.name,
          amount: (current?.amount ?? 0) + spend,
        });
      }
    } else {
      income += incomeMagnitude(transaction.amount);
    }
  });

  const byCategory: CategorySpending[] = Array.from(categoryTotals.entries())
    .map(([categoryId, total]) => ({
      categoryId,
      categoryName: total.name,
      amount: total.amount,
      share: totalSpend === 0 ? 0 : total.amount / totalSpend,
    }))
    .sort(
      (left, right) =>
        right.amount - left.amount ||
        left.categoryName.localeCompare(right.categoryName),
    );

  return {
    period,
    totalSpend,
    income,
    balance: income - totalSpend,
    transactionCount,
    expensesCount,
    byCategory,
    uncategorizedSpend,
  };
};

const deltaDirection = (absolute: number): DeltaDirection => {
  if (absolute > 0) return "up";
  if (absolute < 0) return "down";
  return "flat";
};

const calculateDelta = (current: number, previous: number): SpendingDelta => {
  const absolute = current - previous;
  return {
    current,
    previous,
    absolute,
    percentage: previous === 0 ? null : (absolute / previous) * 100,
    direction: deltaDirection(absolute),
  };
};

/**
 * Build every dashboard metric for a period: the period itself, its
 * month-over-month and year-over-year comparisons, and the deltas.
 *
 * All three periods are derived from the same transaction list, so a period
 * change can never leave one metric reading a different slice.
 */
export const GetSpendingOverview = (
  transactions: SpendingTransaction[],
  period: SpendingPeriod,
): SpendingOverview => {
  const current = calculatePeriodSpending(transactions, period);
  const previousPeriod = calculatePeriodSpending(
    transactions,
    previousSpendingPeriod(period),
  );
  const sameMonthLastYear = calculatePeriodSpending(
    transactions,
    sameMonthPreviousYearPeriod(period),
  );

  return {
    current,
    previousPeriod,
    sameMonthLastYear,
    previousPeriodDelta: calculateDelta(
      current.totalSpend,
      previousPeriod.totalSpend,
    ),
    yearOverYearDelta: calculateDelta(
      current.totalSpend,
      sameMonthLastYear.totalSpend,
    ),
  };
};
