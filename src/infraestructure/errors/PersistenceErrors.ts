import {
  DomainError,
  EntityNotFoundError,
  DuplicateEntityError,
} from "../../core/errors/DomainErrors.js";

// Errores específicos de persistencia
export class PersistenceError extends DomainError {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: Error,
  ) {
    super(message, "PERSISTENCE_ERROR", { operation });
    this.name = "PersistenceError";
  }
}

export class DatabaseConnectionError extends PersistenceError {
  constructor(originalError?: Error) {
    super("Failed to connect to database", "DB_CONNECTION", originalError);
    this.name = "DatabaseConnectionError";
  }
}

export class TransactionError extends PersistenceError {
  constructor(operation: string, originalError?: Error) {
    super(
      `Transaction failed during ${operation}`,
      "TRANSACTION_ERROR",
      originalError,
    );
    this.name = "TransactionError";
  }
}

export class QuotaExceededError extends PersistenceError {
  constructor(originalError?: Error) {
    super("Storage quota exceeded", "QUOTA_EXCEEDED", originalError);
    this.name = "QuotaExceededError";
  }
}

// Utilidad para convertir errores de IndexedDB a errores del dominio
export class IndexedDBErrorMapper {
  static mapError(
    error: DOMException | Error | null,
    operation: string,
    context?: any,
  ): PersistenceError {
    if (!error) {
      return new TransactionError(operation, new Error("Unknown error"));
    }

    const errorMessage = error.message;
    const errorName = error.name;

    // Errores comunes de IndexedDB y su mapeo
    switch (errorName) {
      case "ConstraintError":
        const duplicateError = new DuplicateEntityError(
          context?.entity || "Unknown",
          context?.field || "Unknown",
          context?.value || "Unknown",
        );
        return new PersistenceError(
          duplicateError.message,
          operation,
          duplicateError,
        );

      case "QuotaExceededError":
        return new QuotaExceededError(error);

      case "NotFoundError":
        const notFoundError = new EntityNotFoundError(
          context?.entity || "Unknown",
          context?.id || "Unknown",
        );
        return new PersistenceError(
          notFoundError.message,
          operation,
          notFoundError,
        );

      case "InvalidStateError":
      case "TransactionInactiveError":
        return new TransactionError(
          `${operation} - Invalid transaction state`,
          error,
        );

      case "AbortError":
        return new TransactionError(
          `${operation} - Transaction aborted`,
          error,
        );

      case "TimeoutError":
        return new TransactionError(`${operation} - Operation timeout`, error);

      case "VersionError":
      case "VersionChangeError":
        return new PersistenceError(
          `Database version error during ${operation}`,
          "VERSION_ERROR",
          error,
        );

      default:
        return new TransactionError(`${operation} - ${errorMessage}`, error);
    }
  }
}
