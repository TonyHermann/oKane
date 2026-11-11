import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { type ReactNode } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";
import transactionsReducer from "@/ui/store/slices/transactionsSlices";
import type {
  TransactionsState,
  TransactionState,
} from "@/ui/store/slices/transactionsSlices";
import categoriesReducer from "@/ui/store/slices/categorySlices";
import type {
  CategoriesState,
  CategoryState,
} from "@/ui/store/slices/categorySlices";
import { ModalProvider } from "../modal/context/modalContext";
import { I18nProvider } from "@/ui/i18n";
import { TransactionList } from "./TransactionList";

const initialTransactionsState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
  loadedAt: 1,
};

const initialCategoriesState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
  loadedAt: 1,
};

type PreloadedState = {
  transactions: typeof initialTransactionsState;
  categories: typeof initialCategoriesState;
};

const makeStore = (
  values: PreloadedState = {
    transactions: initialTransactionsState,
    categories: initialCategoriesState,
  },
) => {
  return configureStore({
    reducer: {
      transactions: transactionsReducer,
      categories: categoriesReducer,
    },
    preloadedState: {
      transactions: values.transactions,
      categories: values.categories,
    },
  });
};

const renderList = (state: PreloadedState) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider>
      <ModalProvider>
        <Provider store={makeStore(state)}>{children}</Provider>
      </ModalProvider>
    </I18nProvider>
  );

  return render(<TransactionList />, { wrapper: Wrapper });
};

describe("TransactionList", () => {
  it("should render the list item in the list with 'Categoría eliminada' label on category column", () => {
    const staleCategory: CategoryState = {
      id: "cat-deleted",
      name: "Comida",
      created_at: 1,
    };

    const transaction: TransactionState = {
      id: "tx-1",
      amount: 12.5,
      date: Date.now(),
      description: "Supermercado",
      categories: staleCategory,
      appliedRuleId: null,
    };

    const transactionsState: TransactionsState = {
      items: [transaction],
      loading: false,
      error: null,
      loadedAt: 1,
    };

    const categoriesState: CategoriesState = {
      items: [], // la categoría guardada ya no existe
      loading: false,
      error: null,
      loadedAt: 1,
    };

    renderList({
      transactions: transactionsState,
      categories: categoriesState,
    });
    expect(screen.getByText("Categoría eliminada")).toBeInTheDocument();
    expect(screen.getByText("1 fila")).toBeInTheDocument();
  });

  it("should render the list item in the list with the current category name label on category column", () => {
    const categoriaActual: CategoryState = {
      id: "cat-",
      name: "Comida (old)",
      created_at: 1,
    };

    const transaction: TransactionState = {
      id: "tx-1",
      amount: 12.5,
      date: Date.now(),
      description: "Supermercado",
      categories: categoriaActual,
      appliedRuleId: null,
    };

    const transactionsState: TransactionsState = {
      items: [transaction],
      loading: false,
      error: null,
      loadedAt: 1,
    };

    const categoriesState: CategoriesState = {
      items: [{ ...categoriaActual, name: "Comida (new)" }], // la categoría guardada ya no existe
      loading: false,
      error: null,
      loadedAt: 1,
    };

    renderList({
      transactions: transactionsState,
      categories: categoriesState,
    });
    expect(screen.getByText("Comida (new)")).toBeInTheDocument();
    expect(screen.queryByText("Comida (old)")).not.toBeInTheDocument();
  });

  it("should render 'Cargando...' text on categories field if loeadedAt === null", () => {
    const categoriaActual: CategoryState = {
      id: "cat-1",
      name: "Comida (old)",
      created_at: 1,
    };

    const transaction: TransactionState = {
      id: "tx-1",
      amount: 12.5,
      date: Date.now(),
      description: "Supermercado",
      categories: categoriaActual,
      appliedRuleId: null,
    };

    const transactionsState: TransactionsState = {
      items: [transaction],
      loading: false,
      error: null,
      loadedAt: 1,
    };

    const categoriesState: CategoriesState = {
      items: [categoriaActual],
      loading: true,
      error: null,
      loadedAt: null,
    };

    renderList({
      transactions: transactionsState,
      categories: categoriesState,
    });

    expect(screen.queryByText("Comida (old)")).not.toBeInTheDocument();
    expect(screen.getByText("Cargando…")).toBeInTheDocument();
  });

  it("should render 'Error al cargar categorías' text on categories field if error !== null", () => {
    const categoriaActual: CategoryState = {
      id: "cat-1",
      name: "Comida (old)",
      created_at: 1,
    };

    const transaction: TransactionState = {
      id: "tx-1",
      amount: 12.5,
      date: Date.now(),
      description: "Supermercado",
      categories: categoriaActual,
      appliedRuleId: null,
    };

    const transactionsState: TransactionsState = {
      items: [transaction],
      loading: false,
      error: null,
      loadedAt: 1,
    };

    const categoriesState: CategoriesState = {
      items: [categoriaActual],
      loading: true,
      error: "Error al cargar categorías, amigo!",
      loadedAt: null,
    };

    renderList({
      transactions: transactionsState,
      categories: categoriesState,
    });

    expect(screen.queryByText("Comida (old)")).not.toBeInTheDocument();
    expect(
      screen.getByText("Error al cargar categorías, amigo!"),
    ).toBeInTheDocument();
  });
});

// 2. Test "Cargando…". categories.loadedAt === null → la celda de categoría muestra "Cargando…".
// 3. Test "Error al cargar categorías". categories.error con valor → la celda muestra ese texto.
// Criterios (valen para los dos tests, declarados antes de que escribas):
// - Cubren una sola rama cada uno; el assert apunta al texto de esa rama.
// - Deterministas. Sin setTimeout, sin esperas arbitrarias, sin sleep. Si el test depende de timing, no cuenta.
// - Aislan la persistencia siguiendo la convención del repo. No mockees useAppSelector / useAppDispatch.
// - Sin any y sin duplicar tipos: los tipos se importan de las slices.
// - npx vitest run src/ui/components/TransactionList verde y npm run typecheck sin errores nuevos.
// - No tocás la lógica de TransactionList.tsx al final. No commiteás.
