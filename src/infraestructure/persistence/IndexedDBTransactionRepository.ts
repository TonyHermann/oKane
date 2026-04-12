import type { ITransactionRepository } from "../../core/repositories/ITransactionRepository.js";
import type { Transaction } from "../../core/entities/Transaction.js";
import { openDB } from "./IndexedDB.js";
import { logger } from "../../shared/logger/Logger.js";

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
          const error = request.error;
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

  async update(transaction: Transaction): Promise<void> {
    logger.info("Updating transaction", { id: transaction.id });

    try {
      const db = await openDB();

      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.storename, "readwrite");
        const store = tx.objectStore(this.storename);

        tx.onerror = () => {
          const error = tx.error;
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
          const error = request.error;
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

      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.storename, "readwrite");
        const store = tx.objectStore(this.storename);

        tx.onerror = () => {
          const error = tx.error;
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
          const error = request.error;
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

      return new Promise<Transaction[]>((resolve, reject) => {
        const tx = db.transaction(this.storename, "readonly");
        const store = tx.objectStore(this.storename);

        tx.onerror = () => {
          const error = tx.error;
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
          const transactions = request.result;
          logger.info("Transactions retrieved successfully", {
            count: transactions.length,
          });
          resolve(transactions);
        };

        request.onerror = () => {
          const error = request.error;
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
}
