import type { ICategoryRepository } from "../../core/repositories/ICategoryRepository.ts";
import { Category } from "../../core/entities/Category.ts";
import { openDB } from "./IndexedDB.ts";
import { logger } from "../../shared/logger/Logger.ts";

export class IndexedDBCategoryRepository implements ICategoryRepository {
  private readonly storeName = "categories";

  async save(category: Category): Promise<void> {
    logger.info("Saving category", { id: category.id, name: category.name });

    try {
      const db = await openDB();

      return await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);

        transaction.onerror = () => {
          const { error } = transaction;
          logger.error(error || new Error("Unknown transaction error"), {
            operation: "save_category",
            categoryId: category.id,
            errorName: error?.name,
            errorMessage: error?.message,
          });
          reject(
            new Error(
              `Failed to save category: ${error?.message || "Unknown error"}`,
            ),
          );
        };

        const request = store.add(category);

        request.onsuccess = () => {
          logger.info("Category saved successfully", { id: category.id });
          resolve();
        };

        request.onerror = () => {
          const { error } = request;
          let errorMessage = "Failed to save category";

          if (error?.name === "ConstraintError") {
            errorMessage = `Category with id '${category.id}' already exists`;
          } else if (error?.message) {
            errorMessage = `Failed to save category: ${error.message}`;
          }

          logger.error(error || new Error("Unknown error"), {
            operation: "save_category_request",
            categoryId: category.id,
            errorName: error?.name,
            errorMessage,
          });
          reject(new Error(errorMessage));
        };
      });
    } catch (error) {
      logger.error(error as Error, { operation: "save_category_unexpected" });
      throw error;
    }
  }

  async update(category: Category): Promise<void> {
    logger.info("Updating category", { id: category.id, name: category.name });

    try {
      const db = await openDB();

      return await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);

        transaction.onerror = () => {
          const { error } = transaction;
          logger.error(error || new Error("Unknown error"), {
            operation: "update_category",
            categoryId: category.id,
            errorName: error?.name,
            errorMessage: error?.message,
          });
          reject(
            new Error(
              `Failed to update category: ${error?.message || "Unknown error"}`,
            ),
          );
        };

        const request = store.put(category);

        request.onsuccess = () => {
          logger.info("Category updated successfully", { id: category.id });
          resolve();
        };

        request.onerror = () => {
          const { error } = request;
          let errorMessage = "Failed to update category";

          if (error?.name === "NotFoundError") {
            errorMessage = `Category with id '${category.id}' not found`;
          } else if (error?.message) {
            errorMessage = `Failed to update category: ${error.message}`;
          }

          logger.error(error || new Error("Unknown error"), {
            operation: "update_category_request",
            categoryId: category.id,
            errorName: error?.name,
            errorMessage,
          });
          reject(new Error(errorMessage));
        };
      });
    } catch (error) {
      logger.error(error as Error, { operation: "update_category_unexpected" });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    logger.info("Deleting category", { id });

    try {
      const db = await openDB();

      return await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);

        transaction.onerror = () => {
          const { error } = transaction;
          logger.error(error || new Error("Unknown error"), {
            operation: "delete_category",
            categoryId: id,
            errorName: error?.name,
            errorMessage: error?.message,
          });
          reject(
            new Error(
              `Failed to delete category: ${error?.message || "Unknown error"}`,
            ),
          );
        };

        const request = store.delete(id);

        request.onsuccess = () => {
          logger.info("Category deleted successfully", { id });
          resolve();
        };

        request.onerror = () => {
          const { error } = request;
          const errorMessage = `Failed to delete category: ${error?.message || "Unknown error"}`;

          logger.error(error || new Error("Unknown error"), {
            operation: "delete_category_request",
            categoryId: id,
            errorName: error?.name,
            errorMessage,
          });
          reject(new Error(errorMessage));
        };
      });
    } catch (error) {
      logger.error(error as Error, { operation: "delete_category_unexpected" });
      throw error;
    }
  }

  async findAll(): Promise<Category[]> {
    logger.info("Finding all categories");

    try {
      const db = await openDB();

      return await new Promise<Category[]>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readonly");
        const store = transaction.objectStore(this.storeName);

        transaction.onerror = () => {
          const { error } = transaction;
          logger.error(error || new Error("Unknown error"), {
            operation: "find_all_categories",
            errorName: error?.name,
            errorMessage: error?.message,
          });
          reject(
            new Error(
              `Failed to retrieve categories: ${error?.message || "Unknown error"}`,
            ),
          );
        };

        const request = store.getAll();

        request.onsuccess = () => {
          const categories = request.result.map((category) =>
            Category.Rehydrate({
              id: category.id,
              name: category.name,
              created_at: category.created_at,
            }),
          );
          logger.info("Categories retrieved successfully", {
            count: categories.length,
          });
          resolve(categories);
        };

        request.onerror = () => {
          const { error } = request;
          const errorMessage = `Failed to retrieve categories: ${error?.message || "Unknown error"}`;

          logger.error(error || new Error("Unknown error"), {
            operation: "find_all_categories_request",
            errorName: error?.name,
            errorMessage,
          });
          reject(new Error(errorMessage));
        };
      });
    } catch (error) {
      logger.error(error as Error, {
        operation: "find_all_categories_unexpected",
      });
      throw error;
    }
  }
}
