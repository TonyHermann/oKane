import type { ITransactionRepository } from "../../repositories/ITransactionRepository.js";
import type { Transaction } from "../../entities/Transaction.js";

export const SaveTransaction = (repository: ITransactionRepository) => {
  return async (transaction: Transaction) => {
    await repository.save(transaction);
  };
};
