import type { ICategoryRepository } from "../../core/repositories/ICategoryRepository.js";
import { Category } from "../../core/entities/Category.js";
import { openDB } from "./IndexedDB.js";

export class IndexedDBCategoryRepository implements ICategoryRepository {
  private storename = "categories";

  async save(category: Category): Promise<void> {
    const db = await openDB();
    const cat = db.transaction(this.storename, "readwrite");
    const store = cat.objectStore(this.storename);

    store.add(category);
  }

  async update(category: Category): Promise<void> {
    const db = await openDB();
    const cat = db.transaction(this.storename, "readwrite");
    const store = cat.objectStore(this.storename);

    store.put(category);
  }

  async delete(id: string): Promise<void> {
    const db = await openDB();
    const cat = db.transaction(this.storename, "readwrite");
    const store = cat.objectStore(this.storename);

    store.delete(id);
  }

  async findAll(): Promise<Category[]> {
    const db = await openDB();
    const cat = db.transaction(this.storename, "readonly");
    const store = cat.objectStore(this.storename);

    return new Promise((resolve, reject) => {
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject("Error al obtener transacciones.");
    });
  }
}
