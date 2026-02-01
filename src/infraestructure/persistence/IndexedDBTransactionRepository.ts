import type { ITransactionRepository } from "../../core/repositories/ITransactionRepository.js";
import type { Transaction } from "../../core/entities/Transaction.js";
import { openDB } from "./IndexedDB.js";

export class IndexedDBTransactionRepository implements ITransactionRepository {
  private storename = "transactions";

  async save(transaction: Transaction): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(this.storename, "readwrite");
    const store = tx.objectStore(this.storename);

    store.add(transaction);
  }

  async update(transaction: Transaction): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(this.storename, "readwrite");
    const store = tx.objectStore(this.storename);

    store.put(transaction);
  }

  async delete(id: string): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(this.storename, "readwrite");
    const store = tx.objectStore(this.storename);

    store.delete(id);
  }

  async findAll(): Promise<Transaction[]> {
    const db = await openDB();
    const tx = db.transaction(this.storename, "readonly");
    const store = tx.objectStore(this.storename);

    return new Promise((resolve, reject) => {
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject("Error al obtener transacciones.");
    });
  }
}
