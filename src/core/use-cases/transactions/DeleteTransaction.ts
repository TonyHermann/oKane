import type { ITransactionRepository } from "../../repositories/ITransactionRepository.js";

export const DeleteTransaction = (repository: ITransactionRepository) => {
  return async (transactionId: string) => {
    await repository.delete(transactionId);
  };
};
