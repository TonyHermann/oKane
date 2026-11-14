import { configureStore, type PayloadAction } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CategorizationRuleActions } from "@/adapters/CategorizationRuleActions";
import { ImportTransactionActions } from "@/adapters/ImportTransactionActions";
import { transactionActions } from "@/adapters/TransactionActions";
import { Category } from "@/core/entities/Category";
import { CsvSchema } from "@/core/entities/Import/CsvSchema";
import { Transaction } from "@/core/entities/Transaction";
import categoriesReducer, { type CategoryState } from "./categorySlices";
import categorizationRulesReducer, {
  applyAllCategorizationRules,
} from "./categorizationRulesSlices";
import transactionsReducer, {
  importTransactions,
  loadTransactions,
  removeTransaction,
  saveTransaction,
  updateTransaction,
  type TransactionState,
} from "./transactionsSlices";

vi.mock("@/adapters/TransactionActions", () => ({
  transactionActions: {
    delete: vi.fn(),
    getAll: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/adapters/ImportTransactionActions", () => ({
  ImportTransactionActions: { importCsv: vi.fn() },
}));

vi.mock("@/adapters/CategorizationRuleActions", () => ({
  CategorizationRuleActions: {
    applyAll: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(),
    save: vi.fn(),
  },
}));

const FIXED_DATE = new Date("2024-01-01").getTime();
const T0 = new Date("2024-01-01T00:00:00Z").getTime();
const T1 = T0 + 60_000;

const entityFixture = (
  overrides: Partial<{
    id: string;
    amount: number;
    description: string;
  }> = {},
) =>
  Transaction.Rehydrate({
    id: "tx-1",
    amount: 100,
    date: FIXED_DATE,
    description: "Café",
    categories: null,
    ...overrides,
  });

const createTransactionInput = (
  overrides: Partial<{ description: string }> = {},
) => ({
  amount: 250,
  date: FIXED_DATE,
  description: "Nueva transacción",
  categories: null,
  ...overrides,
});

const createTestStore = (items: CategoryState[] = []) => {
  return configureStore({
    reducer: {
      transactions: transactionsReducer,
      categories: categoriesReducer,
      categorizationRules: categorizationRulesReducer,
    },
    preloadedState: {
      categories: { items, loading: false, error: null, loadedAt: null },
    },
  });
};

describe("transactions slice cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts cold so the first consumer reads persistence", async () => {
    const store = createTestStore();
    vi.mocked(transactionActions.getAll).mockResolvedValue([entityFixture()]);

    expect(store.getState().transactions.loadedAt).toBeNull();

    await store.dispatch(loadTransactions());

    const state = store.getState().transactions;
    expect(transactionActions.getAll).toHaveBeenCalledTimes(1);
    expect(state.items).toHaveLength(1);
    expect(state.loadedAt).not.toBeNull();
  });

  it("skips persistence when the collection is already loaded", async () => {
    const store = createTestStore();
    vi.mocked(transactionActions.getAll).mockResolvedValue([entityFixture()]);

    await store.dispatch(loadTransactions());
    await store.dispatch(loadTransactions());

    expect(transactionActions.getAll).toHaveBeenCalledTimes(1);
  });

  it("treats an empty loaded collection as loaded, not cold", async () => {
    const store = createTestStore();
    vi.mocked(transactionActions.getAll).mockResolvedValue([]);

    await store.dispatch(loadTransactions());
    await store.dispatch(loadTransactions());

    const state = store.getState().transactions;
    expect(state.items).toEqual([]);
    expect(state.loadedAt).not.toBeNull();
    expect(transactionActions.getAll).toHaveBeenCalledTimes(1);
  });

  it("re-reads persistence when force is requested", async () => {
    const store = createTestStore();
    vi.mocked(transactionActions.getAll).mockResolvedValue([entityFixture()]);

    await store.dispatch(loadTransactions());
    await store.dispatch(loadTransactions({ force: true }));

    expect(transactionActions.getAll).toHaveBeenCalledTimes(2);
  });

  it("does not start a second read when force arrives during an in-flight load", async () => {
    const store = createTestStore();
    let release!: (rows: Transaction[]) => void;
    vi.mocked(transactionActions.getAll).mockReturnValue(
      new Promise<Transaction[]>((resolve) => {
        release = resolve;
      }),
    );

    const inFlight = store.dispatch(loadTransactions());
    const forced = store.dispatch(loadTransactions({ force: true }));

    release([entityFixture()]);
    await Promise.all([inFlight, forced]);

    expect(transactionActions.getAll).toHaveBeenCalledTimes(1);
  });

  it("keeps the previous collection and timestamp when loading fails", async () => {
    const store = createTestStore();
    vi.mocked(transactionActions.getAll).mockResolvedValueOnce([
      entityFixture(),
    ]);

    await store.dispatch(loadTransactions());
    const { loadedAt } = store.getState().transactions;

    vi.mocked(transactionActions.getAll).mockRejectedValueOnce(
      new Error("offline"),
    );
    await store.dispatch(loadTransactions({ force: true }));

    const state = store.getState().transactions;
    expect(state.items).toHaveLength(1);
    expect(state.loadedAt).toBe(loadedAt);
    expect(state.error).toBe("DATA_LOAD_FAILED");
  });
});

describe("transactions slice write-through", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not share the category object with the categories slice", async () => {
    vi.useFakeTimers();

    const cat1 = { id: "cat-1", name: "Comida", created_at: FIXED_DATE };

    const store = createTestStore([cat1]);

    await store.dispatch(loadTransactions());

    await store.dispatch(
      updateTransaction({
        id: "tx-1",
        amount: 999,
        date: FIXED_DATE,
        description: "Café",
        categories: cat1,
        appliedRuleId: null,
      }),
    );

    const categoriesState = store.getState().categories;

    const state = store.getState().transactions;
    expect(state.items).toHaveLength(1);
    expect(categoriesState.items).toHaveLength(1);
    expect(state.items[0].categories).not.toBe(categoriesState.items[0]);
  });

  it("appends a saved transaction and keeps the collection loaded", async () => {
    const store = createTestStore();
    vi.mocked(transactionActions.getAll).mockResolvedValue([entityFixture()]);
    vi.mocked(transactionActions.save).mockResolvedValue(undefined);

    await store.dispatch(loadTransactions());
    await store.dispatch(saveTransaction(createTransactionInput()));

    const state = store.getState().transactions;
    expect(state.items).toHaveLength(2);
    expect(state.items[1].description).toBe("Nueva transacción");
    expect(state.loadedAt).not.toBeNull();
  });

  it("does not mark the collection loaded when saving onto a cold cache", async () => {
    const store = createTestStore();
    vi.mocked(transactionActions.save).mockResolvedValue(undefined);

    await store.dispatch(saveTransaction(createTransactionInput()));

    const state = store.getState().transactions;
    expect(state.items).toHaveLength(1);
    expect(state.loadedAt).toBeNull();
  });

  it("reads the full collection when a consumer mounts after a cold-cache save", async () => {
    const store = createTestStore();
    vi.mocked(transactionActions.save).mockResolvedValue(undefined);

    await store.dispatch(saveTransaction(createTransactionInput()));

    vi.mocked(transactionActions.getAll).mockResolvedValue([
      entityFixture({ id: "tx-1" }),
      entityFixture({ id: "tx-2", description: "Importada" }),
    ]);
    await store.dispatch(loadTransactions());

    const state = store.getState().transactions;
    expect(transactionActions.getAll).toHaveBeenCalledTimes(1);
    expect(state.items).toHaveLength(2);
  });

  it("replaces the edited transaction and advances the timestamp", async () => {
    vi.useFakeTimers();
    const store = createTestStore();
    vi.mocked(transactionActions.getAll).mockResolvedValue([entityFixture()]);
    vi.mocked(transactionActions.update).mockResolvedValue(undefined);

    vi.setSystemTime(T0);
    await store.dispatch(loadTransactions());

    vi.setSystemTime(T1);
    await store.dispatch(
      updateTransaction({
        id: "tx-1",
        amount: 999,
        date: FIXED_DATE,
        description: "Café",
        categories: null,
        appliedRuleId: null,
      }),
    );

    const state = store.getState().transactions;
    expect(state.items).toHaveLength(1);
    expect(state.items[0].amount).toBe(999);
    expect(state.loadedAt).toBe(T1);
  });

  it("filters the removed transaction and advances the timestamp", async () => {
    vi.useFakeTimers();
    const store = createTestStore();
    vi.mocked(transactionActions.getAll).mockResolvedValue([
      entityFixture({ id: "tx-1" }),
      entityFixture({ id: "tx-2", description: "Otra" }),
    ]);
    vi.mocked(transactionActions.delete).mockResolvedValue(undefined);

    vi.setSystemTime(T0);
    await store.dispatch(loadTransactions());

    vi.setSystemTime(T1);
    await store.dispatch(removeTransaction("tx-1"));

    const state = store.getState().transactions;
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe("tx-2");
    expect(state.loadedAt).toBe(T1);
  });

  it("keeps the cache timestamp when a write fails", async () => {
    const store = createTestStore();
    vi.mocked(transactionActions.getAll).mockResolvedValue([entityFixture()]);
    vi.mocked(transactionActions.delete).mockRejectedValue(new Error("boom"));

    await store.dispatch(loadTransactions());
    const { loadedAt } = store.getState().transactions;

    await store.dispatch(removeTransaction("tx-1"));

    const state = store.getState().transactions;
    expect(state.items).toHaveLength(1);
    expect(state.loadedAt).toBe(loadedAt);
    expect(state.error).toBe("DATA_DELETE_FAILED");
  });
});

describe("transactions slice import write-through", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const importInput = () => ({
    rows: [],
    schema: new CsvSchema(["description"]),
    mapping: {
      dateColumn: "date",
      amountColumn: "amount",
      descriptionColumn: "description",
    },
  });

  it("appends imported transactions and keeps a cold cache cold", async () => {
    const store = createTestStore();
    vi.mocked(ImportTransactionActions.importCsv).mockResolvedValue({
      imported: 2,
      failed: [],
      saved: [entityFixture({ id: "tx-a" }), entityFixture({ id: "tx-b" })],
      total: 2,
    });

    await store.dispatch(importTransactions(importInput()));

    const state = store.getState().transactions;
    expect(state.items).toHaveLength(2);
    expect(state.loadedAt).toBeNull();
  });

  it("advances the timestamp when importing into a loaded collection", async () => {
    vi.useFakeTimers();
    const store = createTestStore();
    vi.mocked(transactionActions.getAll).mockResolvedValue([entityFixture()]);
    vi.mocked(ImportTransactionActions.importCsv).mockResolvedValue({
      imported: 2,
      failed: [],
      saved: [entityFixture({ id: "tx-a" }), entityFixture({ id: "tx-b" })],
      total: 2,
    });

    vi.setSystemTime(T0);
    await store.dispatch(loadTransactions());

    vi.setSystemTime(T1);
    await store.dispatch(importTransactions(importInput()));

    const state = store.getState().transactions;
    expect(state.items).toHaveLength(3);
    expect(state.loadedAt).toBe(T1);
  });

  it("stores the import error code when importing fails", async () => {
    const store = createTestStore();
    vi.mocked(ImportTransactionActions.importCsv).mockRejectedValue(
      new Error("invalid csv"),
    );

    await store.dispatch(importTransactions(importInput()));

    expect(store.getState().transactions.error).toBe(
      "TRANSACTIONS_IMPORT_FAILED",
    );
  });
});

describe("transactions slice apply-rules write-through", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const updatedEntity = () =>
    Transaction.Rehydrate({
      id: "tx-1",
      amount: 100,
      date: FIXED_DATE,
      description: "Café",
      categories: Category.Rehydrate({
        id: "cat-food",
        name: "Food",
        created_at: FIXED_DATE,
      }),
    });

  it("replaces the cached transaction and advances the timestamp", async () => {
    vi.useFakeTimers();
    const store = createTestStore();
    vi.mocked(transactionActions.getAll).mockResolvedValue([entityFixture()]);
    vi.mocked(CategorizationRuleActions.applyAll).mockResolvedValue([
      updatedEntity(),
    ]);

    vi.setSystemTime(T0);
    await store.dispatch(loadTransactions());

    vi.setSystemTime(T1);
    await store.dispatch(applyAllCategorizationRules());

    const state = store.getState().transactions;
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe("tx-1");
    expect(state.items[0].categories?.name).toBe("Food");
    expect(state.loadedAt).toBe(T1);
  });

  it("carries the applied rule provenance into the cached transaction", async () => {
    const store = createTestStore();
    vi.mocked(transactionActions.getAll).mockResolvedValue([entityFixture()]);
    vi.mocked(CategorizationRuleActions.applyAll).mockResolvedValue([
      Transaction.Rehydrate({
        id: "tx-1",
        amount: 100,
        date: FIXED_DATE,
        description: "Café",
        categories: Category.Rehydrate({
          id: "cat-food",
          name: "Food",
          created_at: FIXED_DATE,
        }),
        appliedRuleId: "rule-1",
      }),
    ]);

    await store.dispatch(loadTransactions());
    await store.dispatch(applyAllCategorizationRules());

    const state = store.getState().transactions;
    expect(state.items[0].appliedRuleId).toBe("rule-1");
  });

  it("leaves the cache untouched when nothing matched", async () => {
    const store = createTestStore();
    vi.mocked(transactionActions.getAll).mockResolvedValue([entityFixture()]);
    vi.mocked(CategorizationRuleActions.applyAll).mockResolvedValue([]);

    await store.dispatch(loadTransactions());
    const before = store.getState().transactions;

    await store.dispatch(applyAllCategorizationRules());

    const state = store.getState().transactions;
    expect(state.items).toHaveLength(before.items.length);
    expect(state.loadedAt).toBe(before.loadedAt);
  });

  it("does not mark a cold cache as loaded", async () => {
    const store = createTestStore();
    vi.mocked(CategorizationRuleActions.applyAll).mockResolvedValue([
      updatedEntity(),
    ]);

    await store.dispatch(applyAllCategorizationRules());

    const state = store.getState().transactions;
    expect(state.loadedAt).toBeNull();
  });
});

describe("action payloads stay serializable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const isPlainObject = (value: unknown): boolean => {
    if (typeof value !== "object" || value === null) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  };

  const categorizedEntity = () =>
    Transaction.Rehydrate({
      id: "tx-1",
      amount: 100,
      date: FIXED_DATE,
      description: "Café",
      categories: Category.Rehydrate({
        id: "cat-food",
        name: "Food",
        created_at: FIXED_DATE,
      }),
    });

  const importInput = () => ({
    rows: [],
    schema: new CsvSchema(["description"]),
    mapping: {
      dateColumn: "date",
      amountColumn: "amount",
      descriptionColumn: "description",
    },
  });

  type ImportPayload = {
    saved: TransactionState[];
    imported: number;
    failed: number;
    total: number;
  };

  it("projects applied rule results to plain transaction states", async () => {
    const store = createTestStore();
    vi.mocked(transactionActions.getAll).mockResolvedValue([entityFixture()]);
    vi.mocked(CategorizationRuleActions.applyAll).mockResolvedValue([
      categorizedEntity(),
    ]);

    await store.dispatch(loadTransactions());

    const action = (await store.dispatch(
      applyAllCategorizationRules(),
    )) as PayloadAction<TransactionState[]>;

    expect(action.type).toContain("fulfilled");
    expect(Array.isArray(action.payload)).toBe(true);
    expect(action.payload.length).toBeGreaterThan(0);
    action.payload.forEach((item) => {
      expect(isPlainObject(item)).toBe(true);
      if (item.categories) {
        expect(isPlainObject(item.categories)).toBe(true);
      }
    });
  });

  it("projects imported transactions to plain transaction states", async () => {
    const store = createTestStore();
    vi.mocked(ImportTransactionActions.importCsv).mockResolvedValue({
      imported: 1,
      failed: [],
      saved: [categorizedEntity()],
      total: 1,
    });

    const action = (await store.dispatch(
      importTransactions(importInput()),
    )) as PayloadAction<ImportPayload>;

    expect(action.type).toContain("fulfilled");
    expect(action.payload.saved.length).toBeGreaterThan(0);
    action.payload.saved.forEach((item) => {
      expect(isPlainObject(item)).toBe(true);
      if (item.categories) {
        expect(isPlainObject(item.categories)).toBe(true);
      }
    });
  });
});
