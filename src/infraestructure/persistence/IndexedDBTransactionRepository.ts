import type {
  ITransactionRepository,
  SaveManyResult,
} from "../../core/repositories/ITransactionRepository.js";
import { Transaction } from "../../core/entities/Transaction";
import { openDB } from "./IndexedDB.js";
import { logger } from "../../shared/logger/Logger.js";

const CHUNK_SIZE = 10;

export class IndexedDBTransactionRepository implements ITransactionRepository {
  private readonly storename = "transactions";

  async save(transaction: Transaction): Promise<void> {
    logger.info("Saving transaction", { id: transaction.id });

    try {
      const db = await openDB();

      return await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.storename, "readwrite");
        const store = tx.objectStore(this.storename);

        tx.onerror = () => {
          const { error } = tx;
          logger.error(error || new Error("Unknown transaction error"), {
            operation: "save_transaction",
            transactionId: transaction.id,
            errorName: error?.name,
            errorMessage: error?.message,
          });
          reject(
            new Error(
              `Failed to save transaction: ${error?.message || "Unknown error"}`,
            ),
          );
        };

        const request = store.add(transaction);

        request.onsuccess = () => {
          logger.info("Transaction saved successfully", { id: transaction.id });
          resolve();
        };

        request.onerror = () => {
          const { error } = request;
          let errorMessage = "Failed to save transaction";

          if (error?.name === "ConstraintError") {
            errorMessage = `Transaction with id '${transaction.id}' already exists`;
          } else if (error?.message) {
            errorMessage = `Failed to save transaction: ${error.message}`;
          }

          logger.error(error || new Error("Unknown error"), {
            operation: "save_transaction_request",
            transactionId: transaction.id,
            errorName: error?.name,
            errorMessage,
          });

          reject(new Error(errorMessage));
        };
      });
    } catch (error) {
      logger.error(error as Error, {
        operation: "save_transaction_unexpected",
      });
      throw error;
    }
  }

  async saveMany(transactions: Transaction[]): Promise<SaveManyResult> {
    const db = await openDB();
    const chunks = Array.from(
      { length: Math.ceil(transactions.length / CHUNK_SIZE) },
      (_, index) =>
        transactions.slice(
          index * CHUNK_SIZE,
          index * CHUNK_SIZE + CHUNK_SIZE,
        ),
    );

    return chunks.reduce<Promise<SaveManyResult>>(
      async (previous, chunk) => {
        const result = await previous;
        const chunkResult = await this.saveChunk(chunk, db);

        result.imported += chunkResult.imported;
        result.failed.push(...chunkResult.failed);

        return result;
      },
      Promise.resolve<SaveManyResult>({ imported: 0, failed: [] }),
    );
  }

  private saveChunk(
    chunk: Transaction[],
    db: IDBDatabase,
  ): Promise<SaveManyResult> {
    return new Promise((resolve) => {
      const result: SaveManyResult = { imported: 0, failed: [] };
      const tx = db.transaction(this.storename, "readwrite");
      const store = tx.objectStore(this.storename);

      tx.onabort = () => {
        // Chunk entero falló → marcar todos como failed
        chunk.forEach((t) => {
          result.failed.push({
            transaction: t,
            error: new Error("Batch transaction aborted"),
          });
        });
        resolve(result);
      };

      tx.oncomplete = () => resolve(result);

      chunk.forEach((t) => {
        const request = store.add(t);

        request.onsuccess = () => {
          result.imported += 1;
        };

        request.onerror = (event) => {
          event.preventDefault();
          result.failed.push({
            transaction: t,
            error: new Error(request.error?.message || "Unknown save error"),
          });
        };
      });
    });
  }

  async update(transaction: Transaction): Promise<void> {
    logger.info("Updating transaction", { id: transaction.id });

    try {
      const db = await openDB();

      return await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.storename, "readwrite");
        const store = tx.objectStore(this.storename);

        tx.onerror = () => {
          const { error } = tx;
          logger.error(error || new Error("Unknown transaction error"), {
            operation: "update_transaction",
            transactionId: transaction.id,
            errorName: error?.name,
            errorMessage: error?.message,
          });
          reject(
            new Error(
              `Failed to update transaction: ${error?.message || "Unknown error"}`,
            ),
          );
        };

        const request = store.put(transaction);

        request.onsuccess = () => {
          logger.info("Transaction updated successfully", {
            id: transaction.id,
          });
          resolve();
        };

        request.onerror = () => {
          const { error } = request;
          let errorMessage = "Failed to update transaction";

          if (error?.name === "NotFoundError") {
            errorMessage = `Transaction with id '${transaction.id}' not found`;
          } else if (error?.message) {
            errorMessage = `Failed to update transaction: ${error.message}`;
          }

          logger.error(error || new Error("Unknown error"), {
            operation: "update_transaction_request",
            transactionId: transaction.id,
            errorName: error?.name,
            errorMessage,
          });

          reject(new Error(errorMessage));
        };
      });
    } catch (error) {
      logger.error(error as Error, {
        operation: "update_transaction_unexpected",
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    logger.info("Deleting transaction", { id });

    try {
      const db = await openDB();

      return await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.storename, "readwrite");
        const store = tx.objectStore(this.storename);

        tx.onerror = () => {
          const { error } = tx;
          logger.error(error || new Error("Unknown transaction error"), {
            operation: "delete_transaction",
            transactionId: id,
            errorName: error?.name,
            errorMessage: error?.message,
          });
          reject(
            new Error(
              `Failed to delete transaction: ${error?.message || "Unknown error"}`,
            ),
          );
        };

        const request = store.delete(id);

        request.onsuccess = () => {
          logger.info("Transaction deleted successfully", { id });
          resolve();
        };

        request.onerror = () => {
          const { error } = request;
          let errorMessage = "Failed to delete transaction";

          if (error?.name === "NotFoundError") {
            errorMessage = `Transaction with id '${id}' not found`;
          } else if (error?.message) {
            errorMessage = `Failed to delete transaction: ${error.message}`;
          }

          logger.error(error || new Error("Unknown error"), {
            operation: "delete_transaction_request",
            transactionId: id,
            errorName: error?.name,
            errorMessage,
          });

          reject(new Error(errorMessage));
        };
      });
    } catch (error) {
      logger.error(error as Error, {
        operation: "delete_transaction_unexpected",
      });
      throw error;
    }
  }

  async findAll(): Promise<Transaction[]> {
    logger.info("Finding all transactions");

    try {
      const db = await openDB();

      return await new Promise<Transaction[]>((resolve, reject) => {
        const tx = db.transaction(this.storename, "readonly");
        const store = tx.objectStore(this.storename);

        tx.onerror = () => {
          const { error } = tx;
          logger.error(error || new Error("Unknown transaction error"), {
            operation: "find_all_transactions",
            errorName: error?.name,
            errorMessage: error?.message,
          });
          reject(
            new Error(
              `Failed to retrieve transactions: ${error?.message || "Unknown error"}`,
            ),
          );
        };

        const request = store.getAll();

        request.onsuccess = () => {
          const raw = request.result;
          const transactions = raw.map((r) => Transaction.Rehydrate(r));
          logger.info("Transactions retrieved successfully", {
            count: transactions.length,
          });
          resolve(transactions);
        };

        request.onerror = () => {
          const { error } = request;
          const errorMessage = `Failed to retrieve transactions: ${error?.message || "Unknown error"}`;

          logger.error(error || new Error("Unknown error"), {
            operation: "find_all_transactions_request",
            errorName: error?.name,
            errorMessage,
          });

          reject(new Error(errorMessage));
        };
      });
    } catch (error) {
      logger.error(error as Error, {
        operation: "find_all_transactions_unexpected",
      });
      throw error;
    }
  }

  async findDuplicates(fingerprints: string[]): Promise<Set<string>> {
    if (fingerprints.length === 0) return new Set();

    const all = await this.findAll();

    const fingerprintSet = new Set(
      all.map((t) => {
        const date = new Date(t.date);
        return `${date.toISOString()}|${t.amount}|${t.description}`;
      }),
    );

    return new Set(fingerprints.filter((f) => fingerprintSet.has(f)));
  }
}
