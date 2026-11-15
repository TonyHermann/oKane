import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoryActions } from "@/adapters/CategoryActions";
import type { Category } from "@/core/entities/Category";
import categorizationRulesReducer from "./categorizationRulesSlices";
import transactionsReducer from "./transactionsSlices";
import categoriesReducer, {
  loadCategories,
  removeCategory,
  saveCategory,
  updateCategory,
  type CategoryState,
} from "./categorySlices";

vi.mock("@/adapters/CategoryActions", () => ({
  CategoryActions: {
    delete: vi.fn(),
    getAll: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  },
}));

const FIXED_DATE = new Date("2024-01-01").getTime();

const categoryFixture = (overrides: Partial<Category> = {}): Category => ({
  id: "cat-1",
  name: "Comida",
  created_at: FIXED_DATE,
  ...overrides,
});

const createTestStore = (items: CategoryState[] = []) =>
  configureStore({
    reducer: {
      transactions: transactionsReducer,
      categories: categoriesReducer,
      categorizationRules: categorizationRulesReducer,
    },
    preloadedState: {
      categories: { items, loading: false, error: null, loadedAt: null },
    },
  });

describe("categories slice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with empty items, loading false and error null", () => {
    const store = createTestStore();

    expect(store.getState().categories).toEqual({
      items: [],
      loading: false,
      error: null,
      loadedAt: null,
    });
  });

  it("loadCategories sets loading while pending and stores mapped items on fulfillment", async () => {
    const store = createTestStore();
    vi.mocked(CategoryActions.getAll).mockResolvedValue([
      categoryFixture({ id: "cat-1", name: "Comida" }),
      categoryFixture({ id: "cat-2", name: "Transporte" }),
    ]);

    const pending = store.dispatch(loadCategories());
    expect(store.getState().categories.loading).toBe(true);

    await pending;

    const state = store.getState().categories;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.items).toEqual([
      { id: "cat-1", name: "Comida", created_at: FIXED_DATE },
      { id: "cat-2", name: "Transporte", created_at: FIXED_DATE },
    ]);
    expect(state.loadedAt).not.toBeNull();
  });

  it("uses the loaded collection as a warm cache", async () => {
    const store = createTestStore();
    vi.mocked(CategoryActions.getAll).mockResolvedValue([]);

    await store.dispatch(loadCategories());
    await store.dispatch(loadCategories());

    expect(CategoryActions.getAll).toHaveBeenCalledTimes(1);
  });

  it("treats an empty loaded collection as a cache hit", async () => {
    const store = createTestStore();
    vi.mocked(CategoryActions.getAll).mockResolvedValue([]);

    await store.dispatch(loadCategories());
    await store.dispatch(loadCategories());

    expect(store.getState().categories.loadedAt).not.toBeNull();
    expect(CategoryActions.getAll).toHaveBeenCalledTimes(1);
  });

  it("reloads persistence when forced", async () => {
    const store = createTestStore();
    vi.mocked(CategoryActions.getAll).mockResolvedValue([]);

    await store.dispatch(loadCategories());
    await store.dispatch(loadCategories({ force: true }));

    expect(CategoryActions.getAll).toHaveBeenCalledTimes(2);
  });

  it("saveCategory appends the mapped new category to items", async () => {
    const store = createTestStore();
    vi.mocked(CategoryActions.save).mockResolvedValue(undefined);

    await store.dispatch(saveCategory({ name: "Nuevo" }));

    const state = store.getState().categories;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].name).toBe("Nuevo");
    expect(state.items[0].id.length).toBeGreaterThan(0);
    expect(state.items[0].created_at).toBeTypeOf("number");
  });

  it("keeps a cold cache cold after saving", async () => {
    const store = createTestStore();
    vi.mocked(CategoryActions.save).mockResolvedValue(undefined);

    await store.dispatch(saveCategory({ name: "Nuevo" }));

    expect(store.getState().categories.loadedAt).toBeNull();
  });

  it("updateCategory replaces the matching item in place", async () => {
    const store = createTestStore([
      categoryFixture({ id: "cat-1", name: "Comida" }),
      categoryFixture({ id: "cat-2", name: "Transporte" }),
    ]);
    vi.mocked(CategoryActions.update).mockResolvedValue(undefined);

    await store.dispatch(
      updateCategory({ id: "cat-1", name: "Comidas", created_at: FIXED_DATE }),
    );

    const state = store.getState().categories;
    expect(state.loading).toBe(false);
    expect(state.items).toHaveLength(2);
    expect(state.items[0]).toEqual({
      id: "cat-1",
      name: "Comidas",
      created_at: FIXED_DATE,
    });
    expect(state.items[1]).toEqual({
      id: "cat-2",
      name: "Transporte",
      created_at: FIXED_DATE,
    });
    expect(state.loadedAt).toBeNull();
  });

  it("keeps a warm cache loaded after updating", async () => {
    vi.useFakeTimers();
    const store = createTestStore();
    vi.mocked(CategoryActions.getAll).mockResolvedValue([categoryFixture()]);
    vi.mocked(CategoryActions.update).mockResolvedValue(undefined);

    await store.dispatch(loadCategories());
    const { loadedAt } = store.getState().categories;
    vi.setSystemTime(new Date("2024-01-01T00:01:00Z"));
    await store.dispatch(
      updateCategory({ id: "cat-1", name: "Comidas", created_at: FIXED_DATE }),
    );

    expect(store.getState().categories.loadedAt).not.toBeNull();
    expect(store.getState().categories.loadedAt).not.toBe(loadedAt);
    vi.useRealTimers();
  });

  it("removeCategory filters the removed id out of items", async () => {
    const store = createTestStore([
      categoryFixture({ id: "cat-1" }),
      categoryFixture({ id: "cat-2" }),
    ]);
    vi.mocked(CategoryActions.delete).mockResolvedValue(undefined);

    await store.dispatch(removeCategory("cat-1"));

    const state = store.getState().categories;
    expect(state.loading).toBe(false);
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual({
      id: "cat-2",
      name: "Comida",
      created_at: FIXED_DATE,
    });
    expect(state.loadedAt).toBeNull();
  });

  it("keeps a warm cache loaded after removing", async () => {
    const store = createTestStore();
    vi.mocked(CategoryActions.getAll).mockResolvedValue([
      categoryFixture({ id: "cat-1" }),
    ]);
    vi.mocked(CategoryActions.delete).mockResolvedValue(undefined);

    await store.dispatch(loadCategories());
    await store.dispatch(removeCategory("cat-1"));

    expect(store.getState().categories.items).toEqual([]);
    expect(store.getState().categories.loadedAt).not.toBeNull();
  });

  it("stores the save error code when saving fails", async () => {
    const store = createTestStore();
    vi.mocked(CategoryActions.save).mockRejectedValue({ code: "ERR_UNKNOWN" });

    await store.dispatch(saveCategory({ name: "Nuevo" }));

    const state = store.getState().categories;
    expect(state.loading).toBe(false);
    expect(state.error).toBe("DATA_SAVE_FAILED");
  });

  it("stores the load error code when loading fails", async () => {
    const store = createTestStore();
    vi.mocked(CategoryActions.getAll).mockRejectedValue(new Error("offline"));

    await store.dispatch(loadCategories());

    expect(store.getState().categories.error).toBe("DATA_LOAD_FAILED");
  });

  it("stores the delete error code when removing fails", async () => {
    const store = createTestStore([categoryFixture({ id: "cat-1" })]);
    vi.mocked(CategoryActions.delete).mockRejectedValue(new Error("offline"));

    await store.dispatch(removeCategory("cat-1"));

    expect(store.getState().categories.error).toBe("DATA_DELETE_FAILED");
  });

  it("preserves items and loadedAt when persistence fails", async () => {
    const store = createTestStore();
    vi.mocked(CategoryActions.getAll).mockResolvedValue([categoryFixture()]);
    vi.mocked(CategoryActions.update).mockRejectedValue(new Error("offline"));

    await store.dispatch(loadCategories());
    const before = store.getState().categories;
    await store.dispatch(
      updateCategory({ id: "cat-1", name: "Comidas", created_at: FIXED_DATE }),
    );

    expect(store.getState().categories.items).toEqual(before.items);
    expect(store.getState().categories.loadedAt).toBe(before.loadedAt);
    expect(store.getState().categories.error).toBe("DATA_UPDATE_FAILED");
  });
});
