import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ImportTransactionActions } from "@/adapters/ImportTransactionActions";
import { transactionActions } from "@/adapters/TransactionActions";
import type { AppErrorCode } from "@/core/errors/AppErrorCode";
import type { CategoryState } from "./categorySlices";
import { applyAllCategorizationRules } from "./categorizationRulesSlices";
import {
  createTransaction,
  toTransaction,
  toTransactionState,
} from "../mappers/toTransaction";
import type { RootState } from "../store";

export interface CreateTransactionState {
  amount: number;
  date: number;
  description: string;
  categories: CategoryState | null;
}

export type TransactionState = CreateTransactionState & {
  id: string;
  appliedRuleId: string | null;
};

export interface TransactionsState {
  items: TransactionState[];
  loading: boolean;
  error: AppErrorCode | null;
  loadedAt: number | null;
}

const initialState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
  loadedAt: null,
};

export const loadTransactions = createAsyncThunk<
  { items: TransactionState[]; loadedAt: number },
  { force?: boolean } | undefined,
  { state: RootState }
>(
  "transactions/loadTransactions",
  async () => {
    const transactions = await transactionActions.getAll();

    const transactionsState = transactions.map((transaction) => {
      return toTransactionState(transaction);
    });
    return { items: transactionsState, loadedAt: new Date().getTime() };
  },
  {
    condition(arg, { getState }) {
      const { loading, loadedAt } = getState().transactions;
      if (loading) return false;
      if (arg?.force) return true;
      return loadedAt === null;
    },
  },
);

export const importTransactions = createAsyncThunk(
  "transactions/importTransactions",
  async (input: Parameters<typeof ImportTransactionActions.importCsv>[0]) => {
    const result = await ImportTransactionActions.importCsv(input);

    return {
      saved: result.saved.map(toTransactionState),
      imported: result.imported,
      failed: result.failed.length,
      total: result.total,
    };
  },
);

export const saveTransaction = createAsyncThunk(
  "transactions/saveTransaction",
  async (transaction: CreateTransactionState) => {
    const newTransaction = createTransaction(transaction);
    await transactionActions.save(newTransaction);
    return toTransactionState(newTransaction);
  },
);

export const updateTransaction = createAsyncThunk(
  "transaction/updateTransaction",
  async (transaction: TransactionState) => {
    const transactionEntity = toTransaction(transaction);
    await transactionActions.update(transactionEntity);
    return toTransactionState(transactionEntity);
  },
);

export const removeTransaction = createAsyncThunk(
  "transaction/removeTransaction",
  async (id: string) => {
    await transactionActions.delete(id);
    return id;
  },
);

const transactionsSlice = createSlice({
  name: "Transactions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.loadedAt = action.payload.loadedAt;
      })
      .addCase(loadTransactions.rejected, (state) => {
        state.loading = false;
        state.error = "DATA_LOAD_FAILED";
      })
      .addCase(saveTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        if (state.loadedAt !== null) state.loadedAt = new Date().getTime();
      })
      .addCase(saveTransaction.rejected, (state) => {
        state.loading = false;
        state.error = "DATA_SAVE_FAILED";
      })
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }

        if (state.loadedAt !== null) state.loadedAt = new Date().getTime();
      })
      .addCase(updateTransaction.rejected, (state) => {
        state.loading = false;
        state.error = "DATA_UPDATE_FAILED";
      })
      .addCase(removeTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.loadedAt !== null) state.loadedAt = new Date().getTime();
      })
      .addCase(removeTransaction.rejected, (state) => {
        state.loading = false;
        state.error = "DATA_DELETE_FAILED";
      })
      .addCase(importTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(...action.payload.saved);
        if (state.loadedAt !== null) state.loadedAt = new Date().getTime();
      })
      .addCase(importTransactions.rejected, (state) => {
        state.loading = false;
        state.error = "TRANSACTIONS_IMPORT_FAILED";
      })
      .addCase(applyAllCategorizationRules.fulfilled, (state, action) => {
        // Cross-slice reaction: applying rules mutates transactions in
        // persistence from the categorization rules flow, so this slice
        // writes the returned entities through instead of going stale.
        action.payload.forEach((updated) => {
          const index = state.items.findIndex((item) => item.id === updated.id);

          if (index !== -1) {
            state.items[index] = updated;
          }
        });

        if (action.payload.length > 0 && state.loadedAt !== null) {
          state.loadedAt = new Date().getTime();
        }
      });
  },
});

export default transactionsSlice.reducer;
