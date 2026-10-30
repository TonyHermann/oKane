import { Transaction } from "@/core/entities/Transaction";
import type {
  CreateTransactionState,
  TransactionState,
} from "../slices/transactionsSlices";
import { toCategory } from "./toCategory";

export const createTransaction = (
  state: CreateTransactionState,
): Transaction => {
  return Transaction.Create({
    amount: state.amount,
    description: state.description,
    date: state.date,
    categories: state.categories ? toCategory(state.categories) : null,
  });
};

export const toTransaction = (state: TransactionState): Transaction => {
  return Transaction.Rehydrate({
    id: state.id,
    amount: state.amount,
    description: state.description,
    date: state.date,
    categories: state.categories ? toCategory(state.categories) : null,
    appliedRuleId: state.appliedRuleId,
  });
};

export const toTransactionState = (
  transaction: Transaction,
): TransactionState => {
  return {
    id: transaction.id,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    categories: transaction.categories
      ? {
          id: transaction.categories.id,
          name: transaction.categories.name,
          created_at: transaction.categories.created_at,
        }
      : null,
    appliedRuleId: transaction.appliedRuleId,
  };
};
