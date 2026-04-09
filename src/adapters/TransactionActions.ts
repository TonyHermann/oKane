import { IndexedDBTransactionRepository } from "../infraestructure/persistence/IndexedDBTransactionRepository.js";

import { DeleteTransaction } from "../core/use-cases/transactions/DeleteTransaction.js";
import { GetAllTransactions } from "../core/use-cases/transactions/GetAllTransactions.js";
import { SaveTransaction } from "../core/use-cases/transactions/SaveTransaction.js";
import { UpdateTransaction } from "../core/use-cases/transactions/UpdateTransaction.js";

const repository = new IndexedDBTransactionRepository();

export const transactionActions = {
  delete: DeleteTransaction(repository),
  getAll: GetAllTransactions(repository),
  save: SaveTransaction(repository),
  update: UpdateTransaction(repository),
};
