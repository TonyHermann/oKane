import { DomainError } from "../../core/errors/DomainErrors.js";
import { PersistenceError } from "../../infraestructure/errors/PersistenceErrors.js";
import type { ILogger } from "../../core/entities/Logger.js";

export class ConsoleLogger implements ILogger {
  private formatError(error: Error): string {
    if (error instanceof DomainError) {
      return `[${error.code}] ${error.message}`;
    }

    if (error instanceof PersistenceError) {
      return `[${error.code}] ${error.message} | Operation: ${error.operation}`;
    }

    return error.message;
  }

  error(error: Error, context?: any): void {
    const formattedError = this.formatError(error);

    console.group(`🚨 ERROR: ${formattedError}`);
    console.error("Error:", error);
    console.error("Stack:", error.stack);

    if (error instanceof DomainError) {
      console.error("Error Code:", error.code);
      console.error("Details:", error.details);
    }

    if (error instanceof PersistenceError && error.originalError) {
      console.error("Original Error:", error.originalError);
    }

    if (context) {
      console.error("Context:", context);
    }

    console.groupEnd();
  }

  warn(message: string, context?: any): void {
    console.warn(`⚠️  WARNING: ${message}`, context || "");
  }

  info(message: string, context?: any): void {
    console.info(`ℹ️  INFO: ${message}`, context || "");
  }
}

// Singleton instance
export const logger = new ConsoleLogger();
