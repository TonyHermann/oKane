import { useEffect, useState, type SubmitEvent } from "react";
import z from "zod";
import { useAppDispatch, useAppSelector } from "@/ui/store/hooks";
import useModalContext from "@/ui/components/modal/context/useModalContext";
import { updateTransaction } from "@/ui/store/slices/transactionsSlices";
import type { TransactionState } from "@/ui/store/slices/transactionsSlices";
import { Select } from "@/ui/components/Select/Select";
import { loadCategories } from "@/ui/store/slices/categorySlices";
import { resolveAppliedRuleIdAfterEdit } from "@/core/entities/Transaction";

export const updateTransactionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(2, "La descripción es obligatoria.")
    .max(100, "La descripción no puede tener más de 100 carácteres."),
  amount: z.number().max(999999, "El monto no puede ser superior a 999999"),
  date: z.date(),
  categoryId: z.string(),
});

interface UpdateTransactionFromProps {
  transaction: TransactionState;
}

export const UpdateTransactionForm = ({
  transaction,
}: UpdateTransactionFromProps) => {
  const categories = useAppSelector((state) => state.categories.items);
  const Catloading = useAppSelector((state) => state.categories.loading);

  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(String(transaction.amount));
  const initialDate = new Date(transaction.date);
  const [date, setDate] = useState(
    `${initialDate.getFullYear()}-${String(initialDate.getMonth() + 1).padStart(2, "0")}-${String(initialDate.getDate()).padStart(2, "0")}`,
  );
  const [categoryId, setCategoryId] = useState(
    transaction.categories?.id || "",
  );
  const [errors, setErrors] = useState<{
    description?: string[];
    amount?: string[];
    date?: string[];
    categoryId?: string[];
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { closeModal } = useModalContext();

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const result = updateTransactionSchema.safeParse({
      description,
      amount: Number(amount),
      date: new Date(`${date}T00:00:00`),
      categoryId,
    });

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);

    try {
      const selectedCategory = categories.find((catx) => {
        return catx.id === result.data.categoryId;
      });

      await dispatch(
        updateTransaction({
          ...transaction,
          description: result.data.description,
          amount: result.data.amount,
          date: result.data.date.getTime(),
          categories: selectedCategory || null,
          appliedRuleId: resolveAppliedRuleIdAfterEdit({
            currentCategoryId: transaction.categories?.id ?? null,
            nextCategoryId: selectedCategory?.id ?? null,
            appliedRuleId: transaction.appliedRuleId,
          }),
        }),
      ).unwrap();
      closeModal();
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo editar la transacción.",
      );
    }
  };

  useEffect(() => {
    dispatch(loadCategories());
  }, [dispatch]);

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="transaction-description">Descripción</label>
        <input
          id="transaction-description"
          name="description"
          type="text"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setErrors({});
            setSubmitError(null);
          }}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? "description-error" : undefined
          }
        />
        {errors.description && (
          <p id="description-error">{errors.description[0]}</p>
        )}
      </div>
      <div>
        <label htmlFor="transaction-amount">Importe</label>
        <input
          id="transaction-amount"
          name="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
            setErrors({});
            setSubmitError(null);
          }}
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? "amount-error" : undefined}
        />
        {errors.amount && <p id="amount-error">{errors.amount[0]}</p>}
      </div>
      <div>
        <label htmlFor="transaction-date">Fecha</label>
        <input
          id="transaction-date"
          name="date"
          type="date"
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setErrors({});
            setSubmitError(null);
          }}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? "date-error" : undefined}
        />
        {errors.date && <p id="date-error">{errors.date[0]}</p>}
      </div>
      <div>
        <label htmlFor="transaction-categories">Categoría</label>
        <Select
          id="transaction-categories"
          label="Categoría"
          name="categoryId"
          options={categories.map((cat) => {
            return { label: cat.name, value: cat.id };
          })}
          disabled={Catloading}
          placeholder="Selecciona una categoría"
          error={errors.categoryId}
          errorId="category-error"
          value={categoryId || ""}
          onChange={(e) => {
            setErrors({});
            setSubmitError(null);
            setCategoryId(e.target.value);
          }}
        />
      </div>

      {submitError && <p role="alert">{submitError}</p>}
      <button type="submit">Guardar cambios</button>
    </form>
  );
};
