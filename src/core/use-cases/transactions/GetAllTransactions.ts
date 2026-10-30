import type { ITransactionRepository } from "../../repositories/ITransactionRepository.js";
import type { Transaction } from "../../entities/Transaction.js";

export const GetAllTransactions = (repository: ITransactionRepository) => {
  return async (): Promise<Transaction[]> => {
    return repository.findAll();
  };
};
