import type { ITransactionRepository } from "../../repositories/ITransactionRepository.js";
import type { Transaction } from "../../entities/Transaction.js";

export const UpdateTransaction = async (repository: ITransactionRepository) => {
  return async (transactionData: Transaction) => {
    if (transactionData.amount === 0) {
      throw new Error("Importe inválido.");
    }
    return await repository.update(transactionData);
  };
};
