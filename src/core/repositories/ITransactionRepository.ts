import { Transaction } from "../entities/Transaction.js";

export type SaveManyResult = {
  imported: number;
  failed: { transaction: Transaction; error: Error }[];
};

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<void>;
  saveMany(transactions: Transaction[]): Promise<SaveManyResult>;
  update(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Transaction[]>;
  findDuplicates(fingerprints: string[]): Promise<Set<string>>;
}
