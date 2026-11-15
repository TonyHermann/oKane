import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/ui/store/hooks";
import { loadTransactions } from "@/ui/store/slices/transactionsSlices";
import { loadCategories } from "@/ui/store/slices/categorySlices";
import { getCategoryLabel } from "@/ui/components/TransactionList/categoryLabel";
import {
  useFormatters,
  useTranslation,
  type Formatters,
  type MessageKey,
  type TranslationParams,
} from "@/ui/i18n";
import {
  currentSpendingPeriod,
  GetSpendingOverview,
  isInSpendingPeriod,
  nextSpendingPeriod,
  previousSpendingPeriod,
  type SpendingDelta,
  type SpendingPeriod,
} from "@/core/use-cases/dashboard/GetSpendingOverview";
import { Spinner } from "@/ui/components/Spinner";
import { Button } from "@/ui/components/Button/Button";
import {
  CategoryBreakdown,
  type CategoryBreakdownRow,
} from "./CategoryBreakdown";
import styles from "./SpendingSummary.module.css";

type Translate = (key: MessageKey, params?: TranslationParams) => string;

const formatPercent = (value: number, formatters: Formatters): string =>
  formatters.number.format(Math.round(value * 10) / 10);

const describeDelta = (
  delta: SpendingDelta,
  t: Translate,
  formatters: Formatters,
): string => {
  if (delta.direction === "flat") return t("dashboard.delta.flat");
  if (delta.percentage === null) return t("dashboard.delta.noBaseline");

  const percent = formatPercent(Math.abs(delta.percentage), formatters);
  return delta.direction === "up"
    ? t("dashboard.delta.up", { percent })
    : t("dashboard.delta.down", { percent });
};

export const SpendingSummary = () => {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector((state) => state.transactions.items);
  const loading = useAppSelector((state) => state.transactions.loading);
  const error = useAppSelector((state) => state.transactions.error);
  const categories = useAppSelector((state) => state.categories.items);
  const { t } = useTranslation();
  const formatters = useFormatters();

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const [period, setPeriod] = useState<SpendingPeriod>(() =>
    currentSpendingPeriod(),
  );
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    dispatch(loadTransactions());
    dispatch(loadCategories());
  }, [dispatch]);

  const overview = useMemo(
    () => GetSpendingOverview(transactions, period),
    [transactions, period],
  );

  const deltaLabels = useMemo(
    () => ({
      previous: describeDelta(overview.previousPeriodDelta, t, formatters),
      yearOverYear: describeDelta(overview.yearOverYearDelta, t, formatters),
    }),
    [overview, t, formatters],
  );

  const rows: CategoryBreakdownRow[] = useMemo(() => {
    const categorized = overview.current.byCategory.map((category) => ({
      key: `category-${category.categoryId}`,
      categoryId: category.categoryId,
      label: getCategoryLabel(category.categoryId, categoriesById, t),
      amount: category.amount,
      share: category.share,
      uncategorized: false,
    }));

    if (overview.current.uncategorizedSpend === 0) return categorized;

    return [
      ...categorized,
      {
        key: "uncategorized",
        categoryId: null,
        label: t("dashboard.uncategorized"),
        amount: overview.current.uncategorizedSpend,
        share:
          overview.current.totalSpend === 0
            ? 0
            : overview.current.uncategorizedSpend / overview.current.totalSpend,
        uncategorized: true,
      },
    ];
  }, [overview, t, categoriesById]);

  const changePeriod = (next: SpendingPeriod) => {
    setPeriod(next);
    setExpandedKey(null);
  };

  const toggleExpanded = (key: string) => {
    setExpandedKey((current) => (current === key ? null : key));
  };

  const renderExpanded = (row: CategoryBreakdownRow): ReactNode => {
    const expandedTransactions = transactions.filter(
      (transaction) =>
        transaction.categoryId === row.categoryId &&
        isInSpendingPeriod(transaction.date, period),
    );

    return (
      <div className={styles.transactions}>
        <p
          id={`${row.key}-transactions-title`}
          className={styles.transactionsTitle}
        >
          {t("dashboard.categoryTransactions", { category: row.label })}
        </p>
        {expandedTransactions.length === 0 ? (
          <p className={styles.status}>
            {t("dashboard.noCategoryTransactions")}
          </p>
        ) : (
          <ul
            className={styles.transactionsList}
            aria-labelledby={`${row.key}-transactions-title`}
          >
            {expandedTransactions.map((transaction) => (
              <li key={transaction.id} className={styles.transaction}>
                <span>
                  {formatters.date.format(new Date(transaction.date))}
                </span>
                <span className={styles.transactionDescription}>
                  {transaction.description}
                </span>
                <span>{formatters.currency.format(transaction.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const periodControl = (
    <div
      className={styles.periodControl}
      role="group"
      aria-label={t("dashboard.period")}
    >
      <button
        type="button"
        className={styles.periodButton}
        aria-label={t("dashboard.previousPeriod")}
        onClick={() => changePeriod(previousSpendingPeriod(period))}
      >
        ←
      </button>
      <span className={styles.periodLabel}>
        {formatters.month.format(new Date(period.year, period.month - 1, 1))}
      </span>
      <button
        type="button"
        className={styles.periodButton}
        aria-label={t("dashboard.nextPeriod")}
        onClick={() => changePeriod(nextSpendingPeriod(period))}
      >
        →
      </button>
    </div>
  );

  if (loading) {
    return (
      <section className={styles.dashboard} aria-label={t("dashboard.title")}>
        <Spinner size={32} label={t("dashboard.loading")} />
      </section>
    );
  }

  if (error !== null) {
    return (
      <section className={styles.dashboard} aria-label={t("dashboard.title")}>
        {periodControl}
        <div role="alert" className={styles.status}>
          <p>{t("dashboard.error")}</p>
          <Button
            label={t("dashboard.retry")}
            size="sm"
            variant="primary"
            onClick={() => {
              dispatch(loadTransactions({ force: true }));
            }}
          />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.dashboard} aria-label={t("dashboard.title")}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t("dashboard.title")}</h2>
        {periodControl}
      </header>

      {overview.current.transactionCount === 0 ? (
        <p className={styles.status}>{t("dashboard.empty")}</p>
      ) : (
        <>
          <dl className={styles.metrics}>
            <div className={styles.metric}>
              <dt className={styles.metricLabel}>
                {t("dashboard.totalSpend")}
              </dt>
              <dd className={styles.metricValue}>
                {formatters.currency.format(overview.current.totalSpend)}
              </dd>
            </div>
            <div className={styles.metric}>
              <dt className={styles.metricLabel}>{t("dashboard.income")}</dt>
              <dd className={styles.metricValue}>
                {formatters.currency.format(overview.current.income)}
              </dd>
            </div>
            <div className={styles.metric}>
              <dt className={styles.metricLabel}>{t("dashboard.balance")}</dt>
              <dd className={styles.metricValue}>
                {formatters.currency.format(overview.current.balance)}
              </dd>
            </div>
          </dl>

          <dl className={styles.deltas}>
            <div className={styles.delta}>
              <dt className={styles.deltaTerm}>
                {t("dashboard.previousMonth")}
              </dt>
              <dd className={styles.deltaValue}>{deltaLabels.previous}</dd>
            </div>
            <div className={styles.delta}>
              <dt className={styles.deltaTerm}>
                {t("dashboard.sameMonthLastYear")}
              </dt>
              <dd className={styles.deltaValue}>{deltaLabels.yearOverYear}</dd>
            </div>
          </dl>

          <CategoryBreakdown
            rows={rows}
            expandedKey={expandedKey}
            onToggle={toggleExpanded}
            renderExpanded={renderExpanded}
          />
        </>
      )}
    </section>
  );
};
