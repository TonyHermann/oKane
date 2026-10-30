import type { Transaction } from "../entities/Transaction";
import type { ICsvRow } from "./ICsvParser";
import type { ICsvMapping } from "./TransactionMapper";

export interface ITransactionMapper {
  map(rows: ICsvRow[], mapping: ICsvMapping): Transaction[];
  mapOne(rwo: ICsvRow, mapping: ICsvMapping): Transaction;
}
