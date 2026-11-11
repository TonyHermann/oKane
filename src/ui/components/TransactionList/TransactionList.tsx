import { useEffect } from "react";
import { Spinner } from "@/ui/components/Spinner";
import { Table } from "../Table/Table";
import { useAppDispatch, useAppSelector } from "@/ui/store/hooks";
import {
  loadTransactions,
  removeTransaction,
  type TransactionState,
} from "@/ui/store/slices/transactionsSlices";
import { Button } from "../Button/Button";
import { EditIcon } from "../Icons/EditIcon";
import { RemoveIcon } from "../Icons/RemoveIcon";
import useModalContext from "../modal/context/useModalContext";
import Modal from "../modal/Modal";
import { UpdateTransactionForm } from "@/ui/pages/admin/movements/UpdateTransactionForm";
import {
  loadCategories,
  type CategoryState,
} from "@/ui/store/slices/categorySlices";
import { getCategoryLabel } from "./categoryLabel";
import {
  useFormatters,
  usePlural,
  useTranslation,
  type Formatters,
} from "@/ui/i18n";

interface TransactionRowProps {
  row: TransactionState;
  index: number;
  handleEdit: (id: string) => void;
  handleRemove: (id: string) => void;
  categoryLabel: string;
  formatters: Formatters;
}

const TransactionRow = ({
  row,
  index,
  handleEdit,
  handleRemove,
  categoryLabel,
  formatters,
}: TransactionRowProps) => {
  const { t } = useTranslation();
  const formattedAmount = formatters.currency.format(row.amount);

  return (
    <tr>
      <Table.SelectRow row={row} index={index} />
      <td>{row.id.slice(0, 8)}…</td>
      <td>{row.description}</td>
      <td>{formattedAmount}</td>
      <td>{formatters.date.format(new Date(row.date))}</td>
      {/* TODO: [transaction-category-selection] Resolve the stored category against the current category index and show "Categoría eliminada" for stale references. */}
      <td>{categoryLabel}</td>
      <td>
        <div className="rowActions-container">
          <Button
            variant="icon"
            size="sm"
            icon={<EditIcon />}
            label={t("common.edit")}
            onClick={() => {
              handleEdit(row.id);
            }}
          />
          <Button
            variant="icon"
            size="sm"
            icon={<RemoveIcon />}
            label={t("common.remove")}
            onClick={() => {
              handleRemove(row.id);
            }}
          />
        </div>
      </td>
    </tr>
  );
};

export interface TransactionListProps {
  title?: string;
}

export const TransactionList = ({ title }: TransactionListProps) => {
  const { t } = useTranslation();
  const plural = usePlural();
  const resolvedTitle = title ?? t("transactions.title");
  const transactions = useAppSelector((state) => state.transactions.items);
  const loading = useAppSelector((state) => state.transactions.loading);
  const error = useAppSelector((state) => state.transactions.error);

  const categories = useAppSelector((state) => state.categories.items);
  const categoriesById = new Map(
    categories.map((category) => {
      return [category.id, category];
    }),
  );
  const categoriesLoadedAt = useAppSelector(
    (state) => state.categories.loadedAt,
  );
  const categoriesError = useAppSelector((state) => state.categories.error);

  const dispatch = useAppDispatch();
  const { openModal } = useModalContext();
  const formatters = useFormatters();

  const handleEdit = (id: string) => {
    const transaction = transactions.find((item) => item.id === id);
    if (!transaction) return;

    openModal({
      title: t("transactions.editModalTitle"),
      content: (
        <Modal.Body>
          <UpdateTransactionForm transaction={transaction} />
        </Modal.Body>
      ),
    });
  };

  const handleRemove = (id: string) => {
    dispatch(removeTransaction(id));
  };
  useEffect(() => {
    dispatch(loadTransactions());
    dispatch(loadCategories());
  }, [dispatch]);

  if (loading) {
    return (
      <div role="status" aria-label={t("transactions.loadingAria")}>
        <Spinner size={32} label={t("transactions.loading")} />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert">
        <p style={{ color: "red" }}>
          {t("transactions.error", { message: error })}
        </p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <section>
        <p>{t("transactions.empty", { title: resolvedTitle })}</p>
      </section>
    );
  }

  const toCategoryLabel = (stored: CategoryState | null) => {
    if (categoriesError) return categoriesError;
    if (categoriesLoadedAt === null) return t("transactions.categoryLoading");
    return getCategoryLabel(stored, categoriesById);
  };

  return (
    <section>
      <div className="scrollable-area">
        <Table
          rows={transactions}
          getRowId={(row) => row.id}
          pagination
          pageSize={25}
        >
          <Table.Header>
            <Table.SelectColumn />
            <th>{t("transactions.header.id")}</th>

            <th>{t("transactions.header.description")}</th>
            <th>{t("transactions.header.amount")}</th>
            <th>{t("transactions.header.date")}</th>
            <th>{t("transactions.header.category")}</th>
            <th>{t("transactions.header.actions")}</th>
          </Table.Header>
          <Table.Body>
            {(transaction: TransactionState, index: number) => (
              <TransactionRow
                key={transaction.id}
                row={transaction}
                index={index}
                handleEdit={handleEdit}
                handleRemove={handleRemove}
                categoryLabel={toCategoryLabel(transaction.categories)}
                formatters={formatters}
              />
            )}
          </Table.Body>
          <Table.Footer>
            {plural(
              { one: "common.rows.one", other: "common.rows.other" },
              transactions.length,
            )}
          </Table.Footer>
        </Table>
      </div>
    </section>
  );
};
