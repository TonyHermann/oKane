import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/ui/store/hooks";
import { loadTransactions } from "@/ui/store/slices/transactionsSlices";
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
  spendingPeriodFromMonthInput,
  spendingPeriodToMonthInput,
  type SpendingDelta,
  type SpendingPeriod,
} from "@/core/use-cases/dashboard/GetSpendingOverview";
import { Spinner } from "@/ui/components/Spinner";
import { Button } from "@/ui/components/Button/Button";
import styles from "./SpendingDashboard.module.css";

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

interface BreakdownRow {
  key: string;
  label: string;
  amount: number;
  share: number;
  uncategorized: boolean;
}

export const SpendingDashboard = () => {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector((state) => state.transactions.items);
  const loading = useAppSelector((state) => state.transactions.loading);
  const error = useAppSelector((state) => state.transactions.error);
  const { t } = useTranslation();
  const formatters = useFormatters();

  const [period, setPeriod] = useState<SpendingPeriod>(() =>
    currentSpendingPeriod(),
  );

  useEffect(() => {
    dispatch(loadTransactions());
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

  const rows: BreakdownRow[] = useMemo(() => {
    const categorized = overview.current.byCategory.map((category) => ({
      key: `category-${category.categoryId}`,
      label: category.categoryName,
      amount: category.amount,
      share: category.share,
      uncategorized: false,
    }));

    if (overview.current.uncategorizedSpend === 0) return categorized;

    return [
      ...categorized,
      {
        key: "uncategorized",
        label: t("dashboard.uncategorized"),
        amount: overview.current.uncategorizedSpend,
        share:
          overview.current.totalSpend === 0
            ? 0
            : overview.current.uncategorizedSpend / overview.current.totalSpend,
        uncategorized: true,
      },
    ];
  }, [overview, t]);

  const periodControl = (
    <div className={styles.periodControl}>
      <label className={styles.periodLabel} htmlFor="spending-period">
        {t("dashboard.period")}
      </label>
      <input
        id="spending-period"
        className={styles.periodInput}
        type="month"
        value={spendingPeriodToMonthInput(period)}
        onChange={(event) => {
          const next = spendingPeriodFromMonthInput(event.target.value);
          if (next !== null) setPeriod(next);
        }}
      />
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

          <div className={styles.breakdown}>
            <table className={styles.table}>
              <caption className={styles.caption}>
                {t("dashboard.categoryBreakdown")}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{t("dashboard.category")}</th>
                  <th scope="col">{t("dashboard.amount")}</th>
                  <th scope="col">{t("dashboard.share")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={3}>{t("dashboard.noExpenses")}</td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.key}>
                      <th
                        scope="row"
                        className={
                          row.uncategorized ? styles.uncategorized : ""
                        }
                      >
                        {row.label}
                      </th>
                      <td>{formatters.currency.format(row.amount)}</td>
                      <td>
                        <span className={styles.barTrack} aria-hidden="true">
                          <span
                            className={styles.barFill}
                            style={{ width: `${Math.round(row.share * 100)}%` }}
                          />
                        </span>
                        {`${formatPercent(row.share * 100, formatters)}%`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};
