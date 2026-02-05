import type { ITransactionRepository } from "../../repositories/ITransactionRepository.js";

export const DeleteTransactions = async (repository: ITransactionRepository) => {
  return async (transactionId: string) => {
    return await repository.delete(transactionId);
  }
}