import { CsvSchemaValidator } from "@/core/services/CsvSchemaValidator";
import { TransactionMapper } from "@/core/services/TransactionMapper";
import { ImportTransactions } from "@/core/use-cases/import/ImportTransactions";
import { IndexedDBTransactionRepository } from "@/infraestructure/persistence/IndexedDBTransactionRepository";
import { CategorizationRuleActions } from "@/adapters/CategorizationRuleActions";

const repository = new IndexedDBTransactionRepository();
const validator = new CsvSchemaValidator();
const mapper = new TransactionMapper();

export const ImportTransactionActions = {
  importCsv: ImportTransactions(validator, mapper, repository, CategorizationRuleActions.getAll),
};
