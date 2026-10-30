import type { CsvSchema } from "@/core/entities/Import/CsvSchema";
import type { ITransactionRepository } from "@/core/repositories/ITransactionRepository";
import type { ICsvRow } from "@/core/services/ICsvParser";
import type { ICsvSchemaValidator } from "@/core/services/ICsvSchemaValidator";
import type { ITransactionMapper } from "@/core/services/ITransactionMapper";
import type { ICsvMapping } from "@/core/services/TransactionMapper";
import { findMatchingRule } from "@/core/services/ApplyCategorizationRules";
import type { CategorizationRule } from "@/core/entities/CategorizationRule";
import type { ImportResult } from "./ImportResult";

export const ImportTransactions = (
  validator: ICsvSchemaValidator,
  mapper: ITransactionMapper,
  repository: ITransactionRepository,
  rulesProvider: () => Promise<CategorizationRule[]> = async () => [],
) => {
  return async (input: {
    rows: ICsvRow[];
    schema: CsvSchema;
    mapping: ICsvMapping;
  }): Promise<ImportResult> => {
    const headers = Object.values(input.mapping);
    validator.validate(headers, input.schema);

    const transactions = input.rows.map((row) =>
      mapper.mapOne(row, input.mapping),
    );

    const rules = await rulesProvider();
    const categorizedTransactions = transactions.map((transaction) => {
      const match = findMatchingRule(transaction.description, rules);

      return match ? transaction.withCategoryFromRule(match) : transaction;
    });
    const result = await repository.saveMany(categorizedTransactions);

    const failedTransactions = new Set(
      result.failed.map((failure) => failure.transaction),
    );
    const saved = categorizedTransactions.filter(
      (transaction) => !failedTransactions.has(transaction),
    );

    return {
      imported: result.imported,
      failed: result.failed,
      saved,
      total: input.rows.length,
    } satisfies ImportResult;
  };
};
