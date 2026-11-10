import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CategoryActions } from "@/adapters/CategoryActions";
import type { AppErrorCode } from "@/core/errors/AppErrorCode";
import {
  createCategory,
  toCategory,
  toCategoryState,
} from "../mappers/toCategory";
import type { RootState } from "../store";

export interface CategoryState {
  id: string;
  name: string;
  created_at: number;
}

export interface CreateCategoryState {
  name: string;
}

export interface CategoriesState {
  items: CategoryState[];
  loading: boolean;
  error: AppErrorCode | null;
  loadedAt: number | null;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
  loadedAt: null,
};

export const loadCategories = createAsyncThunk<
  { items: CategoryState[]; loadedAt: number },
  { force?: boolean } | undefined,
  { state: RootState }
>(
  "categories/loadCategories",
  async () => {
    const categories = await CategoryActions.getAll();

    return {
      items: categories.map(toCategoryState),
      loadedAt: new Date().getTime(),
    };
  },
  {
    condition(arg, { getState }) {
      const { loading, loadedAt } = getState().categories;
      if (loading) return false;
      if (arg?.force) return true;
      return loadedAt === null;
    },
  },
);

export const saveCategory = createAsyncThunk(
  "categories/saveCategory",
  async (state: CreateCategoryState) => {
    const newCategory = createCategory(state);
    await CategoryActions.save(newCategory);
    return toCategoryState(newCategory);
  },
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async (state: CategoryState) => {
    const categoryEntity = toCategory(state);
    await CategoryActions.update(categoryEntity);
    return toCategoryState(categoryEntity);
  },
);

export const removeCategory = createAsyncThunk(
  "categories/removeCategory",
  async (id: string) => {
    await CategoryActions.delete(id);
    return id;
  },
);

const categoriesSlice = createSlice({
  name: "Categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.loadedAt = action.payload.loadedAt;
      })
      .addCase(loadCategories.rejected, (state) => {
        state.loading = false;
        state.error = "DATA_LOAD_FAILED";
      })
      .addCase(saveCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        if (state.loadedAt !== null) state.loadedAt = new Date().getTime();
      })
      .addCase(saveCategory.rejected, (state) => {
        state.loading = false;
        state.error = "DATA_SAVE_FAILED";
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.loadedAt !== null) state.loadedAt = new Date().getTime();
      })
      .addCase(updateCategory.rejected, (state) => {
        state.loading = false;
        state.error = "DATA_UPDATE_FAILED";
      })
      .addCase(removeCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.loadedAt !== null) state.loadedAt = new Date().getTime();
      })
      .addCase(removeCategory.rejected, (state) => {
        state.loading = false;
        state.error = "DATA_DELETE_FAILED";
      });
  },
});

export default categoriesSlice.reducer;
