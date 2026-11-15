export interface SpendingTransaction {
  amount: number;
  date: number;
  categoryId: string | null;
}

export type MonthOfYear = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** A local calendar month. `month` is 1-12, not `Date`'s zero-based index. */
export interface SpendingPeriod {
  year: number;
  month: MonthOfYear;
}

export type DeltaDirection = "up" | "down" | "flat";

export interface SpendingDelta {
  current: number;
  previous: number;
  absolute: number;
  /** `null` when `previous` is 0: the change is undefined. */
  percentage: number | null;
  direction: DeltaDirection;
}

export interface CategorySpending {
  categoryId: string;
  amount: number;
  /** Fraction of the period's total spend, 0-1. */
  share: number;
}

export interface PeriodSpending {
  period: SpendingPeriod;
  totalSpend: number;
  income: number;
  balance: number;
  transactionCount: number;
  expensesCount: number;
  /** Categorized expenses, highest amount first. */
  byCategory: CategorySpending[];
  /** Uncategorized expenses stay out of `byCategory` on purpose. */
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

// `Date.getMonth()` is the only zero-based month in the app; this cast is it.
const monthOfYear = (date: Date): MonthOfYear =>
  (date.getMonth() + 1) as MonthOfYear;

export const spendingPeriodOf = (timestamp: number): SpendingPeriod => {
  const date = new Date(timestamp);
  return { year: date.getFullYear(), month: monthOfYear(date) };
};

export const currentSpendingPeriod = (
  now: number | Date = Date.now(),
): SpendingPeriod => {
  const date = now instanceof Date ? now : new Date(now);
  return { year: date.getFullYear(), month: monthOfYear(date) };
};

export const previousSpendingPeriod = (
  period: SpendingPeriod,
): SpendingPeriod => {
  if (period.month === 1) {
    return { year: period.year - 1, month: 12 };
  }
  return { year: period.year, month: (period.month - 1) as MonthOfYear };
};

export const nextSpendingPeriod = (period: SpendingPeriod): SpendingPeriod => {
  if (period.month === 12) {
    return { year: period.year + 1, month: 1 };
  }
  return { year: period.year, month: (period.month + 1) as MonthOfYear };
};

export const sameMonthPreviousYearPeriod = (
  period: SpendingPeriod,
): SpendingPeriod => ({ year: period.year - 1, month: period.month });

export const spendingPeriodToMonthInput = (period: SpendingPeriod): string =>
  `${period.year}-${padMonth(period.month)}`;

export const spendingPeriodFromMonthInput = (
  value: string,
): SpendingPeriod | null => {
  const match = /^(\d{4})-(\d{2})$/.exec(value);

  if (match === null) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (!Number.isInteger(year) || month < 1 || month > 12) return null;

  return { year, month: month as MonthOfYear };
};

// Exported so the category drill-down in the UI shares this month rule
// instead of re-implementing it.
export const isInSpendingPeriod = (
  timestamp: number,
  period: SpendingPeriod,
): boolean => {
  const date = new Date(timestamp);
  return (
    date.getFullYear() === period.year && date.getMonth() + 1 === period.month
  );
};

// Signed-amount policy: negative is an expense, positive is income.
// TODO: [currency-import] Make this configurable when imports expose explicit
// income/expense semantics instead of relying on the sign.
const expenseMagnitude = (amount: number): number => (amount < 0 ? -amount : 0);
const incomeMagnitude = (amount: number): number => (amount > 0 ? amount : 0);

export const calculatePeriodSpending = (
  transactions: SpendingTransaction[],
  period: SpendingPeriod,
): PeriodSpending => {
  const categoryTotals = new Map<string, number>();
  let totalSpend = 0;
  let income = 0;
  let transactionCount = 0;
  let expensesCount = 0;
  let uncategorizedSpend = 0;

  transactions.forEach((transaction) => {
    if (!isInSpendingPeriod(transaction.date, period)) return;

    transactionCount += 1;

    if (transaction.amount < 0) {
      const spend = expenseMagnitude(transaction.amount);
      totalSpend += spend;
      expensesCount += 1;

      if (transaction.categoryId === null) {
        uncategorizedSpend += spend;
      } else {
        categoryTotals.set(
          transaction.categoryId,
          (categoryTotals.get(transaction.categoryId) ?? 0) + spend,
        );
      }
    } else {
      income += incomeMagnitude(transaction.amount);
    }
  });

  const byCategory: CategorySpending[] = Array.from(categoryTotals.entries())
    .map(([categoryId, amount]) => ({
      categoryId,
      amount,
      share: totalSpend === 0 ? 0 : amount / totalSpend,
    }))
    .sort(
      (left, right) =>
        right.amount - left.amount ||
        left.categoryId.localeCompare(right.categoryId),
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

// All three periods come from the same list, so a dashboard can never mix slices.
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
