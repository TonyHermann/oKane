import { csvSchemaValidator } from "@/core/services/CsvSchemaValidator";
import { transactionMapper } from "@/core/services/TransactionMapper";
import { ImportTransactions } from "@/core/use-cases/import/ImportTransactions";
import { IndexedDBTransactionRepository } from "@/infraestructure/persistence/IndexedDBTransactionRepository";
import { CategorizationRuleActions } from "@/adapters/CategorizationRuleActions";

const repository = new IndexedDBTransactionRepository();

export const ImportTransactionActions = {
  importCsv: ImportTransactions(
    csvSchemaValidator,
    transactionMapper,
    repository,
    CategorizationRuleActions.getAll,
  ),
};
