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
import {
  currentSpendingPeriod,
  previousSpendingPeriod,
  spendingPeriodToMonthInput,
} from "@/core/use-cases/dashboard/GetSpendingOverview";
import { SpendingDashboard } from "./SpendingDashboard";

const timestampIn = (year: number, month: number, day = 10): number =>
  new Date(year, month - 1, day, 12).getTime();

const transaction = (
  id: string,
  amount: number,
  date: number,
  categories: TransactionState["categories"] = null,
): TransactionState => ({
  id,
  amount,
  date,
  description: id,
  categories,
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

const renderDashboard = (state: TransactionsState) => {
  const store = configureStore({
    reducer: { transactions: transactionsReducer },
    preloadedState: { transactions: state },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider>
      <Provider store={store}>{children}</Provider>
    </I18nProvider>
  );

  return render(<SpendingDashboard />, { wrapper: Wrapper });
};

const period = currentSpendingPeriod();
const thisMonth = (day = 10) => timestampIn(period.year, period.month, day);
const previousPeriod = previousSpendingPeriod(period);
const lastMonth = (day = 10) =>
  timestampIn(previousPeriod.year, previousPeriod.month, day);

describe("SpendingDashboard", () => {
  it("shows a loading state while transactions load", () => {
    renderDashboard(stateWith({ loading: true, loadedAt: null }));

    expect(
      screen.getByRole("status", { name: /cargando resumen de gastos/i }),
    ).toBeInTheDocument();
  });

  it("shows an explicit empty state when the period has no transactions", () => {
    renderDashboard(stateWith());

    expect(
      screen.getByText("No hay movimientos en este periodo."),
    ).toBeInTheDocument();
  });

  it("renders totals, deltas and the category breakdown from store data", () => {
    renderDashboard(
      stateWith({
        items: [
          transaction("food", -100, thisMonth(3), {
            id: "cat-food",
            name: "Comida",
            created_at: 1,
          }),
          transaction("uncategorized", -50, thisMonth(4)),
          transaction("salary", 200, thisMonth(5)),
          transaction("last-month", -75, lastMonth(3)),
        ],
      }),
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
    renderDashboard(
      stateWith({
        items: [
          transaction("current", -100, thisMonth(3)),
          transaction("previous", -40, lastMonth(3)),
        ],
      }),
    );

    expect(screen.getAllByText(/100,00/).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText("Periodo"), {
      target: { value: spendingPeriodToMonthInput(previousPeriod) },
    });

    expect(screen.getAllByText(/40,00/).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/100,00/)).toHaveLength(0);
  });

  it("shows an accessible error state with a retry action", () => {
    renderDashboard(stateWith({ error: "IndexedDB unavailable", loadedAt: 1 }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "No se pudo cargar el resumen de gastos.",
    );
    expect(
      screen.getByRole("button", { name: "Reintentar" }),
    ).toBeInTheDocument();
  });
});
