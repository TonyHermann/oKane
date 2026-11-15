import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategorizationRuleActions } from "@/adapters/CategorizationRuleActions";
import {
  RULE_CONDITION_TYPES,
  type CategorizationRule,
} from "@/core/entities/CategorizationRule";
import { Category } from "@/core/entities/Category";
import type { RuleApplicationPreview } from "@/core/use-cases/rules/PreviewRulesApplication";
import categoriesReducer from "./categorySlices";
import categorizationRulesReducer, {
  applyAllCategorizationRules,
  loadCategorizationRules,
  previewCategorizationRules,
  removeCategorizationRule,
  saveCategorizationRule,
} from "./categorizationRulesSlices";
import transactionsReducer from "./transactionsSlices";

vi.mock("@/adapters/CategorizationRuleActions", () => ({
  CategorizationRuleActions: {
    applyAll: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(),
    preview: vi.fn(),
    save: vi.fn(),
  },
}));

const FIXED_DATE = new Date("2024-01-01").getTime();

const categoryFixture = () =>
  Category.Rehydrate({
    id: "cat-1",
    name: "Food",
    created_at: FIXED_DATE,
  });

const previewFixture = (): RuleApplicationPreview => ({
  toCategorize: 2,
  toRevert: 1,
  unchanged: 3,
  totalTransactions: 6,
  totalRules: 4,
  enabledRules: 3,
});

const ruleFixture = (overrides: Partial<CategorizationRule> = {}): CategorizationRule => ({
  id: "rule-1",
  order: 1,
  enabled: true,
  condition: {
    type: RULE_CONDITION_TYPES.DESCRIPTION_CONTAINS,
    values: ["coffee"],
  },
  category: categoryFixture(),
  ...overrides,
});

const createTestStore = () =>
  configureStore({
    reducer: {
      transactions: transactionsReducer,
      categories: categoriesReducer,
      categorizationRules: categorizationRulesReducer,
    },
    preloadedState: {
      categories: {
        items: [
          {
            id: "cat-1",
            name: "Food",
            created_at: FIXED_DATE,
          },
        ],
        loading: false,
        error: null,
        loadedAt: null,
      },
    },
  });

describe("categorization rules slice cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads rules from persistence while cold", async () => {
    const store = createTestStore();
    vi.mocked(CategorizationRuleActions.getAll).mockResolvedValue([
      ruleFixture(),
    ]);

    await store.dispatch(loadCategorizationRules());

    const state = store.getState().categorizationRules;
    expect(CategorizationRuleActions.getAll).toHaveBeenCalledTimes(1);
    expect(state.items).toHaveLength(1);
    expect(state.items[0].category.name).toBe("Food");
    expect(state.loadedAt).not.toBeNull();
  });

  it("uses a warm cache instead of reading persistence again", async () => {
    const store = createTestStore();
    vi.mocked(CategorizationRuleActions.getAll).mockResolvedValue([]);

    await store.dispatch(loadCategorizationRules());
    await store.dispatch(loadCategorizationRules());

    expect(CategorizationRuleActions.getAll).toHaveBeenCalledTimes(1);
  });

  it("treats an empty loaded collection as a cache hit", async () => {
    const store = createTestStore();
    vi.mocked(CategorizationRuleActions.getAll).mockResolvedValue([]);

    await store.dispatch(loadCategorizationRules());
    await store.dispatch(loadCategorizationRules());

    expect(store.getState().categorizationRules.loadedAt).not.toBeNull();
    expect(CategorizationRuleActions.getAll).toHaveBeenCalledTimes(1);
  });

  it("reloads rules when forced", async () => {
    const store = createTestStore();
    vi.mocked(CategorizationRuleActions.getAll).mockResolvedValue([]);

    await store.dispatch(loadCategorizationRules());
    await store.dispatch(loadCategorizationRules({ force: true }));

    expect(CategorizationRuleActions.getAll).toHaveBeenCalledTimes(2);
  });

  it("keeps a cold cache cold after saving", async () => {
    const store = createTestStore();
    vi.mocked(CategorizationRuleActions.save).mockResolvedValue(undefined);

    await store.dispatch(
      saveCategorizationRule({
        categoryId: "cat-1",
        conditionValues: ["coffee"],
      }),
    );

    const state = store.getState().categorizationRules;
    expect(state.items).toHaveLength(1);
    expect(state.loadedAt).toBeNull();
  });

  it("writes saved rules through and keeps a warm cache loaded", async () => {
    const store = createTestStore();
    vi.mocked(CategorizationRuleActions.getAll).mockResolvedValue([]);
    vi.mocked(CategorizationRuleActions.save).mockResolvedValue(undefined);

    await store.dispatch(loadCategorizationRules());
    await store.dispatch(
      saveCategorizationRule({
        categoryId: "cat-1",
        conditionValues: ["coffee"],
      }),
    );

    const state = store.getState().categorizationRules;
    expect(state.items).toHaveLength(1);
    expect(state.loadedAt).not.toBeNull();
  });

  it("writes removed rules through and keeps a warm cache loaded", async () => {
    const store = createTestStore();
    vi.mocked(CategorizationRuleActions.getAll).mockResolvedValue([
      ruleFixture(),
    ]);
    vi.mocked(CategorizationRuleActions.delete).mockResolvedValue(undefined);

    await store.dispatch(loadCategorizationRules());
    await store.dispatch(removeCategorizationRule("rule-1"));

    const state = store.getState().categorizationRules;
    expect(state.items).toEqual([]);
    expect(state.loadedAt).not.toBeNull();
  });

  it("returns the preview counts without touching the cached rules", async () => {
    const store = createTestStore();
    const preview = previewFixture();
    vi.mocked(CategorizationRuleActions.preview).mockResolvedValue(preview);

    const result = await store.dispatch(previewCategorizationRules()).unwrap();

    expect(result).toEqual(preview);
    expect(CategorizationRuleActions.preview).toHaveBeenCalledTimes(1);
    expect(store.getState().categorizationRules.items).toEqual([]);
    expect(store.getState().categorizationRules.loadedAt).toBeNull();
  });

  it("preserves items and loadedAt when persistence rejects", async () => {
    const store = createTestStore();
    vi.mocked(CategorizationRuleActions.getAll).mockResolvedValue([
      ruleFixture(),
    ]);
    vi.mocked(CategorizationRuleActions.delete).mockRejectedValue(
      new Error("offline"),
    );

    await store.dispatch(loadCategorizationRules());
    const before = store.getState().categorizationRules;
    await store.dispatch(removeCategorizationRule("rule-1"));

    const state = store.getState().categorizationRules;
    expect(state.items).toEqual(before.items);
    expect(state.loadedAt).toBe(before.loadedAt);
    expect(state.error).toBe("DATA_DELETE_FAILED");
  });
});

describe("categorization rules slice errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores the load error code when loading fails", async () => {
    const store = createTestStore();
    vi.mocked(CategorizationRuleActions.getAll).mockRejectedValue(
      new Error("offline"),
    );

    await store.dispatch(loadCategorizationRules());

    expect(store.getState().categorizationRules.error).toBe(
      "DATA_LOAD_FAILED",
    );
  });

  it("stores the validation error code when saving fails", async () => {
    const store = createTestStore();

    await store.dispatch(
      saveCategorizationRule({ categoryId: "missing", conditionValues: ["x"] }),
    );

    expect(store.getState().categorizationRules.error).toBe(
      "VALIDATION_FAILED",
    );
  });

  it("stores the save error code when persistence fails while saving a rule", async () => {
    const store = createTestStore();
    vi.mocked(CategorizationRuleActions.save).mockRejectedValue(
      new Error("offline"),
    );

    await store.dispatch(
      saveCategorizationRule({ categoryId: "cat-1", conditionValues: ["x"] }),
    );

    expect(store.getState().categorizationRules.error).toBe(
      "DATA_SAVE_FAILED",
    );
  });

  it("stores the apply-rules error code when applying fails", async () => {
    const store = createTestStore();
    vi.mocked(CategorizationRuleActions.applyAll).mockRejectedValue(
      new Error("offline"),
    );

    await store.dispatch(applyAllCategorizationRules());

    expect(store.getState().categorizationRules.error).toBe(
      "RULES_APPLY_FAILED",
    );
  });
});
