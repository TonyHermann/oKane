import type { ITransactionRepository } from "../../repositories/ITransactionRepository.js";
import type { Transaction } from "../../entities/Transaction.js";

export const UpdateTransaction = (repository: ITransactionRepository) => {
  return async (transaction: Transaction) => {
    await repository.update(transaction);
  };
};
