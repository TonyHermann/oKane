import { Transaction } from "@/core/entities/Transaction";
import type {
  CreateTransactionState,
  TransactionState,
} from "../slices/transactionsSlices";

export const createTransaction = (
  state: CreateTransactionState,
): Transaction => {
  return Transaction.Create({
    amount: state.amount,
    description: state.description,
    date: state.date,
    categoryId: state.categoryId,
  });
};

export const toTransaction = (state: TransactionState): Transaction => {
  return Transaction.Rehydrate({
    id: state.id,
    amount: state.amount,
    description: state.description,
    date: state.date,
    categoryId: state.categoryId,
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
    categoryId: transaction.categoryId,
    appliedRuleId: transaction.appliedRuleId,
  };
};
