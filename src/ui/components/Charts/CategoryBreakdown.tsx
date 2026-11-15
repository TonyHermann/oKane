import { Fragment, type ReactNode } from "react";
import { useFormatters, useTranslation, type Formatters } from "@/ui/i18n";
import styles from "./CategoryBreakdown.module.css";

export interface CategoryBreakdownRow {
  key: string;
  categoryId: string | null;
  label: string;
  amount: number;
  share: number;
  uncategorized: boolean;
}

interface CategoryBreakdownProps {
  rows: CategoryBreakdownRow[];
  expandedKey: string | null;
  onToggle: (key: string) => void;
  renderExpanded: (row: CategoryBreakdownRow) => ReactNode;
}

const formatPercent = (value: number, formatters: Formatters): string =>
  formatters.number.format(Math.round(value * 10) / 10);

export const CategoryBreakdown = ({
  rows,
  expandedKey,
  onToggle,
  renderExpanded,
}: CategoryBreakdownProps) => {
  const { t } = useTranslation();
  const formatters = useFormatters();

  return (
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
            rows.map((row) => {
              const expanded = expandedKey === row.key;

              return (
                <Fragment key={row.key}>
                  <tr>
                    <th
                      scope="row"
                      className={
                        row.uncategorized ? styles.uncategorized : undefined
                      }
                    >
                      <button
                        type="button"
                        className={styles.toggle}
                        aria-expanded={expanded}
                        aria-controls={`${row.key}-transactions`}
                        onClick={() => onToggle(row.key)}
                      >
                        {row.label}
                      </button>
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
                  {expanded ? (
                    <tr id={`${row.key}-transactions`}>
                      <td colSpan={3}>{renderExpanded(row)}</td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
