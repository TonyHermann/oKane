import { DomainError } from "../../core/errors/DomainErrors.js";
import { PersistenceError } from "../../infraestructure/errors/PersistenceErrors.js";
import type { ILogger } from "../../core/entities/Logger.js";

const formatError = (error: Error): string => {
  if (error instanceof DomainError) {
    return `[${error.code}] ${error.message}`;
  }

  if (error instanceof PersistenceError) {
    return `[${error.code}] ${error.message} | Operation: ${error.operation}`;
  }

  return error.message;
};

// TODO: [notifications] Decide which user-actionable log events may publish through a notification port or event bus; keep diagnostic logging UI-independent.
export const logger: ILogger = {
  error(error: Error, context?: unknown): void {
    const formattedError = formatError(error);

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
  },

  warn(message: string, context?: unknown): void {
    console.warn(`⚠️  WARNING: ${message}`, context || "");
  },

  info(message: string, context?: unknown): void {
    console.info(`ℹ️  INFO: ${message}`, context || "");
  },
};
