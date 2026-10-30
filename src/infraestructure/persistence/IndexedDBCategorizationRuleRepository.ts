import type { CategorizationRule } from "../../core/entities/CategorizationRule.js";
import type { ICategorizationRuleRepository } from "../../core/repositories/ICategorizationRuleRepository.js";
import { openDB } from "./IndexedDB.js";
import { logger } from "../../shared/logger/Logger.js";

export class IndexedDBCategorizationRuleRepository
  implements ICategorizationRuleRepository
{
  private readonly storeName = "categorizationRules";

  async save(rule: CategorizationRule): Promise<void> {
    logger.info("Saving categorization rule", { id: rule.id });

    try {
      const db = await openDB();

      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);

        transaction.onerror = () => {
          const { error } = transaction;
          logger.error(error || new Error("Unknown transaction error"), {
            operation: "save_categorization_rule",
            ruleId: rule.id,
            errorName: error?.name,
            errorMessage: error?.message,
          });
          reject(
            new Error(
              `Failed to save categorization rule: ${error?.message || "Unknown error"}`,
            ),
          );
        };

        const request = store.add(rule);

        request.onsuccess = () => {
          logger.info("Categorization rule saved successfully", { id: rule.id });
          resolve();
        };

        request.onerror = () => {
          const { error } = request;
          const errorMessage =
            error?.name === "ConstraintError"
              ? `Categorization rule with id '${rule.id}' already exists`
              : `Failed to save categorization rule: ${error?.message || "Unknown error"}`;

          logger.error(error || new Error("Unknown request error"), {
            operation: "save_categorization_rule_request",
            ruleId: rule.id,
            errorName: error?.name,
            errorMessage,
          });
          reject(new Error(errorMessage));
        };
      });
    } catch (error) {
      logger.error(error as Error, {
        operation: "save_categorization_rule_unexpected",
        ruleId: rule.id,
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    logger.info("Deleting categorization rule", { id });

    try {
      const db = await openDB();

      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);

        transaction.onerror = () => {
          const { error } = transaction;
          logger.error(error || new Error("Unknown transaction error"), {
            operation: "delete_categorization_rule",
            ruleId: id,
            errorName: error?.name,
            errorMessage: error?.message,
          });
          reject(
            new Error(
              `Failed to delete categorization rule: ${error?.message || "Unknown error"}`,
            ),
          );
        };

        const request = store.delete(id);

        request.onsuccess = () => {
          logger.info("Categorization rule deleted successfully", { id });
          resolve();
        };

        request.onerror = () => {
          const { error } = request;
          const errorMessage = `Failed to delete categorization rule: ${error?.message || "Unknown error"}`;

          logger.error(error || new Error("Unknown request error"), {
            operation: "delete_categorization_rule_request",
            ruleId: id,
            errorName: error?.name,
            errorMessage,
          });
          reject(new Error(errorMessage));
        };
      });
    } catch (error) {
      logger.error(error as Error, {
        operation: "delete_categorization_rule_unexpected",
        ruleId: id,
      });
      throw error;
    }
  }

  async findAll(): Promise<CategorizationRule[]> {
    logger.info("Finding all categorization rules");

    try {
      const db = await openDB();

      return await new Promise<CategorizationRule[]>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readonly");
        const store = transaction.objectStore(this.storeName);

        transaction.onerror = () => {
          const { error } = transaction;
          logger.error(error || new Error("Unknown transaction error"), {
            operation: "find_all_categorization_rules",
            errorName: error?.name,
            errorMessage: error?.message,
          });
          reject(
            new Error(
              `Failed to retrieve categorization rules: ${error?.message || "Unknown error"}`,
            ),
          );
        };

        const request = store.getAll();

        request.onsuccess = () => {
          const rules = (request.result as CategorizationRule[]).sort(
            (a, b) => a.order - b.order,
          );

          logger.info("Categorization rules retrieved successfully", {
            count: rules.length,
          });
          resolve(rules);
        };

        request.onerror = () => {
          const { error } = request;
          const errorMessage = `Failed to retrieve categorization rules: ${error?.message || "Unknown error"}`;

          logger.error(error || new Error("Unknown request error"), {
            operation: "find_all_categorization_rules_request",
            errorName: error?.name,
            errorMessage,
          });
          reject(new Error(errorMessage));
        };
      });
    } catch (error) {
      logger.error(error as Error, {
        operation: "find_all_categorization_rules_unexpected",
      });
      throw error;
    }
  }
}
