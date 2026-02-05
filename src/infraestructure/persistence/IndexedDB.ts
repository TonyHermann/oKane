import { logger } from "../../shared/logger/Logger.js";

const DB_NAME = "oKaneDB";
const DB_VERSION = 1;

class DatabaseConnection {
  private static instance: Promise<IDBDatabase> | null = null;

  static async getConnection(): Promise<IDBDatabase> {
    if (!this.instance || this.instance == undefined) {
      this.instance = this.openConnection();
    }
    return this.instance;
  }

  private static openConnection(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      logger.info(`Opening database connection: ${DB_NAME} v${DB_VERSION}`);

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        const error = request.error || new Error("Unknown database error");
        logger.error(error, { dbName: DB_NAME, version: DB_VERSION });
        reject(error);
      };

      request.onsuccess = () => {
        const db = request.result;
        logger.info("Database connection opened successfully");
        resolve(db);
      };

      request.onupgradeneeded = () => {
        logger.info(`Upgrading database to version ${DB_VERSION}`);
        const db = request.result;

        if (!db.objectStoreNames.contains("categories")) {
          logger.info('Creating "categories" object store');
          db.createObjectStore("categories", { keyPath: "name" });
        }

        if (!db.objectStoreNames.contains("transactions")) {
          logger.info('Creating "transactions" object store');
          db.createObjectStore("transactions", { autoIncrement: true });
        }
      };

      request.onblocked = () => {
        logger.warn("Database connection blocked", { dbName: DB_NAME });
      };
    });
  }
}

export const openDB = () => DatabaseConnection.getConnection();
