import type { ITransactionRepository } from "../../repositories/ITransactionRepository.js";
import type { Transaction } from "../../entities/Transaction.js";

export const GetAllTransactions = async (
  repository: ITransactionRepository,
): Promise<Transaction[]> => {
  return repository.findAll();
};
