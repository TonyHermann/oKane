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

interface TransactionRowProps {
  row: TransactionState;
  index: number;
  handleEdit: (id: string) => void;
  handleRemove: (id: string) => void;
  categoryLabel: string;
}

const TransactionRow = ({
  row,
  index,
  handleEdit,
  handleRemove,
  categoryLabel,
}: TransactionRowProps) => {
  const formattedAmount = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(row.amount);

  return (
    <tr>
      <Table.SelectRow row={row} index={index} />
      <td>{row.id.slice(0, 8)}…</td>
      <td>{row.description}</td>
      <td>{formattedAmount}</td>
      <td>{new Date(row.date).toLocaleDateString()}</td>
      {/* TODO: [transaction-category-selection] Resolve the stored category against the current category index and show "Categoría eliminada" for stale references. */}
      <td>{categoryLabel}</td>
      <td>
        <div className="rowActions-container">
          <Button
            variant="icon"
            size="sm"
            icon={<EditIcon />}
            label="Editar"
            onClick={() => {
              handleEdit(row.id);
            }}
          />
          <Button
            variant="icon"
            size="sm"
            icon={<RemoveIcon />}
            label="Eliminar"
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

export const TransactionList = ({
  title = "Transacciones",
}: TransactionListProps) => {
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

  const handleEdit = (id: string) => {
    const transaction = transactions.find((item) => item.id === id);
    if (!transaction) return;

    openModal({
      title: "Editar una transacción",
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
      <div role="status" aria-label="Cargando transacciones">
        <Spinner size={32} label="Cargando transacciones…" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert">
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <section>
        <p>No hay {title} registradas.</p>
      </section>
    );
  }

  const toCategoryLabel = (stored: CategoryState | null) => {
    if (categoriesError) return categoriesError;
    if (categoriesLoadedAt === null) return "Cargando…";
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
            <th>ID</th>

            <th>Descripción</th>
            <th>Importe</th>
            <th>Fecha</th>
            <th>Categoría</th>
            <th>Acciones</th>
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
              />
            )}
          </Table.Body>
          <Table.Footer>{transactions.length} rows.</Table.Footer>
        </Table>
      </div>
    </section>
  );
};
