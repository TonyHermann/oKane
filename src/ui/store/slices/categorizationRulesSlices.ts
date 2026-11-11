import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CategorizationRuleActions } from "@/adapters/CategorizationRuleActions";
import type { AppErrorCode } from "@/core/errors/AppErrorCode";
import { ValidationError } from "@/core/errors/DomainErrors";
import { resolveErrorCode, toErrorCode } from "@/core/errors/toErrorCode";
import type { RuleApplicationPreview } from "@/core/use-cases/rules/PreviewRulesApplication";
import {
  createCategorizationRule,
  RULE_CONDITION_TYPES,
} from "@/core/entities/CategorizationRule";
import { Category } from "@/core/entities/Category";
import { toTransactionState } from "../mappers/toTransaction";
import type { RootState } from "../store";
import type { CategoryState } from "./categorySlices";

export interface CategorizationRuleState {
  id: string;
  order: number;
  enabled: boolean;
  conditionType: (typeof RULE_CONDITION_TYPES)[keyof typeof RULE_CONDITION_TYPES];
  conditionValues: string[];
  category: CategoryState;
}

export interface CreateCategorizationRuleState {
  conditionValues: string[];
  categoryId: string;
}

interface CategorizationRulesState {
  items: CategorizationRuleState[];
  loading: boolean;
  error: AppErrorCode | null;
  loadedAt: number | null;
}

const initialState: CategorizationRulesState = {
  items: [],
  loading: false,
  error: null,
  loadedAt: null,
};

const toRuleState = (rule: Awaited<ReturnType<typeof CategorizationRuleActions.getAll>>[number]) => ({
  id: rule.id,
  order: rule.order,
  enabled: rule.enabled,
  conditionType: rule.condition.type,
  conditionValues: rule.condition.values,
  category: {
    id: rule.category.id,
    name: rule.category.name,
    created_at: rule.category.created_at,
  },
});

export const loadCategorizationRules = createAsyncThunk<
  { items: CategorizationRuleState[]; loadedAt: number },
  { force?: boolean } | undefined,
  { state: RootState }
>(
  "categorizationRules/load",
  async (_arg, { rejectWithValue }) => {
    try {
      return {
        items: (await CategorizationRuleActions.getAll()).map(toRuleState),
        loadedAt: new Date().getTime(),
      };
    } catch (error) {
      return rejectWithValue(toErrorCode(error));
    }
  },
  {
    condition(arg, { getState }) {
      const { loading, loadedAt } = getState().categorizationRules;
      if (loading) return false;
      if (arg?.force) return true;
      return loadedAt === null;
    },
  },
);

export const saveCategorizationRule = createAsyncThunk(
  "categorizationRules/save",
  async (state: CreateCategorizationRuleState, thunkApi) => {
    try {
      const category = (thunkApi.getState() as RootState).categories.items.find(
        (item) => item.id === state.categoryId,
      );

      if (!category) {
        throw new ValidationError("The selected category does not exist.");
      }

      const conditionValues = state.conditionValues
        .map((value) => value.trim())
        .filter((value) => value !== "");

      if (conditionValues.length === 0) {
        throw new ValidationError(
          "The rule needs at least one description.",
        );
      }

      const rule = createCategorizationRule({
        order:
          Math.max(
            0,
            ...(thunkApi.getState() as RootState).categorizationRules.items.map(
              (item) => item.order,
            ),
          ) + 1,
        condition: {
          type: RULE_CONDITION_TYPES.DESCRIPTION_CONTAINS,
          values: conditionValues,
        },
        category: Category.Rehydrate(category),
      });

      await CategorizationRuleActions.save(rule);
      return toRuleState(rule);
    } catch (error) {
      return thunkApi.rejectWithValue(toErrorCode(error));
    }
  },
);

export const applyAllCategorizationRules = createAsyncThunk(
  "categorizationRules/applyAll",
  async (_arg, { rejectWithValue }) => {
    try {
      return (await CategorizationRuleActions.applyAll()).map(
        toTransactionState,
      );
    } catch (error) {
      return rejectWithValue(toErrorCode(error));
    }
  },
);

// The preview crosses the Redux action boundary, so it must carry plain
// numbers only. `RuleApplicationPreview` already is a flat block of counts.
export const previewCategorizationRules = createAsyncThunk<
  RuleApplicationPreview,
  void
>(
  "categorizationRules/preview",
  async (_arg, { rejectWithValue }) => {
    try {
      return await CategorizationRuleActions.preview();
    } catch (error) {
      return rejectWithValue(toErrorCode(error));
    }
  },
);

export const removeCategorizationRule = createAsyncThunk(
  "categorizationRules/remove",
  async (id: string, { rejectWithValue }) => {
    try {
      await CategorizationRuleActions.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(toErrorCode(error));
    }
  },
);

const categorizationRulesSlice = createSlice({
  name: "CategorizationRules",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCategorizationRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCategorizationRules.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.loadedAt = action.payload.loadedAt;
      })
      .addCase(loadCategorizationRules.rejected, (state, action) => {
        state.loading = false;
        state.error = resolveErrorCode(action.payload, "DATA_LOAD_FAILED");
      })
      .addCase(saveCategorizationRule.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        if (state.loadedAt !== null) state.loadedAt = new Date().getTime();
      })
      .addCase(saveCategorizationRule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveCategorizationRule.rejected, (state, action) => {
        state.loading = false;
        state.error = resolveErrorCode(action.payload, "DATA_SAVE_FAILED");
      })
      .addCase(removeCategorizationRule.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.loadedAt !== null) state.loadedAt = new Date().getTime();
      })
      .addCase(removeCategorizationRule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCategorizationRule.rejected, (state, action) => {
        state.loading = false;
        state.error = resolveErrorCode(action.payload, "DATA_DELETE_FAILED");
      })
      .addCase(applyAllCategorizationRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyAllCategorizationRules.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(applyAllCategorizationRules.rejected, (state, action) => {
        state.loading = false;
        state.error = resolveErrorCode(action.payload, "RULES_APPLY_FAILED");
      });
  },
});

export default categorizationRulesSlice.reducer;
