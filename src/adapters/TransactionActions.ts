import { IndexedDBTransactionRepository } from "../infraestructure/persistence/IndexedDBTransactionRepository";

import { DeleteTransaction } from "../core/use-cases/transactions/DeleteTransaction";
import { GetAllTransactions } from "../core/use-cases/transactions/GetAllTransactions";
import { SaveTransaction } from "../core/use-cases/transactions/SaveTransaction";
import { UpdateTransaction } from "../core/use-cases/transactions/UpdateTransaction";

const repository = new IndexedDBTransactionRepository();

export const transactionActions = {
  delete: DeleteTransaction(repository),
  getAll: GetAllTransactions(repository),
  save: SaveTransaction(repository),
  update: UpdateTransaction(repository),
};
