import type { Transaction } from "@/core/entities/Transaction";
import type { ICsvRow } from "@/core/services/ICsvParser";

export type ImportResult = {
  imported: number;
  failed: { transaction: Transaction; error: Error }[];
  saved: Transaction[];
  total: number;
};

export type ImportRowResult = {
  transaction: ICsvRow | Transaction;
  status: "success" | "rejected";
  error?: Error;
};
