import { Transaction } from "../entities/Transaction";
import { CsvNormalizer } from "./CsvNormalizer";
import type { ICsvRow } from "./ICsvParser";
import type { ITransactionMapper } from "./ITransactionMapper";

export type ICsvMapping = {
  dateColumn: string;
  amountColumn: string;
  descriptionColumn: string;
};

export class TransactionMapper implements ITransactionMapper {
  map(rows: ICsvRow[], mapping: ICsvMapping): Transaction[] {
    return rows.map((row) => {
      return this.mapOne(row, mapping);
    });
  }

  mapOne(row: ICsvRow, mapping: ICsvMapping): Transaction {
    return Transaction.Rehydrate({
      id: crypto.randomUUID(),
      date: CsvNormalizer.date(row[mapping.dateColumn]),
      amount: CsvNormalizer.amount(row[mapping.amountColumn]),
      description: row[mapping.descriptionColumn],
    });
  }
}
