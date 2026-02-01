import { Transaction } from "../entities/Transaction.js";

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<void>;
  update(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Transaction[]>;
}
