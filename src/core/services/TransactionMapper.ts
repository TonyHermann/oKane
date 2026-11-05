import { Transaction } from "../entities/Transaction";
import { CsvNormalizer } from "./CsvNormalizer";
import type { ICsvRow } from "./ICsvParser";
import type { ITransactionMapper } from "./ITransactionMapper";

export type ICsvMapping = {
  dateColumn: string;
  amountColumn: string;
  descriptionColumn: string;
};

const mapOne = (row: ICsvRow, mapping: ICsvMapping): Transaction => {
  return Transaction.Rehydrate({
    id: crypto.randomUUID(),
    date: CsvNormalizer.date(row[mapping.dateColumn]),
    amount: CsvNormalizer.amount(row[mapping.amountColumn]),
    description: row[mapping.descriptionColumn],
  });
};

export const transactionMapper: ITransactionMapper = {
  map(rows, mapping) {
    return rows.map((row) => {
      return mapOne(row, mapping);
    });
  },
  mapOne,
};
