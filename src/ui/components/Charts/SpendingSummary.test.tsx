import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { type ReactNode } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/ui/i18n";
import transactionsReducer, {
  type TransactionsState,
  type TransactionState,
} from "@/ui/store/slices/transactionsSlices";
import categoriesReducer, {
  type CategoriesState,
  type CategoryState,
} from "@/ui/store/slices/categorySlices";
import {
  currentSpendingPeriod,
  previousSpendingPeriod,
} from "@/core/use-cases/dashboard/GetSpendingOverview";
import { SpendingSummary } from "./SpendingSummary";

const timestampIn = (year: number, month: number, day = 10): number =>
  new Date(year, month - 1, day, 12).getTime();

const transaction = (
  id: string,
  amount: number,
  date: number,
  categoryId: TransactionState["categoryId"] = null,
): TransactionState => ({
  id,
  amount,
  date,
  description: id,
  categoryId,
  appliedRuleId: null,
});

const stateWith = (
  overrides: Partial<TransactionsState> = {},
): TransactionsState => ({
  items: [],
  loading: false,
  error: null,
  loadedAt: 1,
  ...overrides,
});

const categoriesWith = (items: CategoryState[] = []): CategoriesState => ({
  items,
  loading: false,
  error: null,
  loadedAt: 1,
});

const renderSummary = (
  state: TransactionsState,
  categories: CategoriesState = categoriesWith(),
) => {
  const store = configureStore({
    reducer: { transactions: transactionsReducer, categories: categoriesReducer },
    preloadedState: { transactions: state, categories },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider>
      <Provider store={store}>{children}</Provider>
    </I18nProvider>
  );

  return render(<SpendingSummary />, { wrapper: Wrapper });
};

const period = currentSpendingPeriod();
const thisMonth = (day = 10) => timestampIn(period.year, period.month, day);
const previousPeriod = previousSpendingPeriod(period);
const lastMonth = (day = 10) =>
  timestampIn(previousPeriod.year, previousPeriod.month, day);

describe("SpendingSummary", () => {
  it("shows a loading state while transactions load", () => {
    renderSummary(stateWith({ loading: true, loadedAt: null }));

    expect(
      screen.getByRole("status", { name: /cargando resumen de gastos/i }),
    ).toBeInTheDocument();
  });

  it("shows an explicit empty state when the period has no transactions", () => {
    renderSummary(stateWith());

    expect(
      screen.getByText("No hay movimientos en este periodo."),
    ).toBeInTheDocument();
  });

  it("renders totals, deltas and the category breakdown from store data", () => {
    renderSummary(
      stateWith({
        items: [
          transaction("food", -100, thisMonth(3), "cat-food"),
          transaction("uncategorized", -50, thisMonth(4)),
          transaction("salary", 200, thisMonth(5)),
          transaction("last-month", -75, lastMonth(3)),
        ],
      }),
      categoriesWith([{ id: "cat-food", name: "Comida", created_at: 1 }]),
    );

    expect(screen.getByText(/150,00/)).toBeInTheDocument();
    expect(screen.getByText(/200,00/)).toBeInTheDocument();
    expect(screen.getAllByText(/50,00/).length).toBeGreaterThan(0);
    expect(screen.getByText("Comida")).toBeInTheDocument();
    expect(screen.getByText("Sin categoría")).toBeInTheDocument();
    expect(screen.getByText("un 100% más")).toBeInTheDocument();
    expect(screen.getByText("sin datos para comparar")).toBeInTheDocument();
  });

  it("updates every metric when the selected period changes", () => {
    renderSummary(
      stateWith({
        items: [
          transaction("current", -100, thisMonth(3)),
          transaction("previous", -40, lastMonth(3)),
        ],
      }),
    );

    expect(screen.getAllByText(/100,00/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Período anterior" }));

    expect(screen.getAllByText(/40,00/).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/100,00/)).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "Período siguiente" }));

    expect(screen.getAllByText(/100,00/).length).toBeGreaterThan(0);
  });

  it("toggles a category's transactions from its row button", () => {
    renderSummary(
      stateWith({
        items: [
          transaction("food-one", -100, thisMonth(3), "cat-food"),
          transaction("food-two", -20, thisMonth(4), "cat-food"),
        ],
      }),
      categoriesWith([{ id: "cat-food", name: "Comida", created_at: 1 }]),
    );

    const toggle = screen.getByRole("button", { name: "Comida" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute(
      "aria-controls",
      "category-cat-food-transactions",
    );

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("food-one")).toBeInTheDocument();
    expect(screen.getByText("food-two")).toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("food-one")).not.toBeInTheDocument();
    expect(screen.queryByText("food-two")).not.toBeInTheDocument();
  });

  it("expands the uncategorized row and lists its transactions", () => {
    renderSummary(
      stateWith({ items: [transaction("misc", -50, thisMonth(4))] }),
    );

    const toggle = screen.getByRole("button", { name: "Sin categoría" });

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("misc")).toBeInTheDocument();
    expect(
      screen.getByText("Movimientos de Sin categoría"),
    ).toBeInTheDocument();
  });

  it("shows an accessible error state with a retry action", () => {
    renderSummary(stateWith({ error: "DATA_LOAD_FAILED", loadedAt: 1 }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "No se pudo cargar el resumen de gastos.",
    );
    expect(
      screen.getByRole("button", { name: "Reintentar" }),
    ).toBeInTheDocument();
  });
});
