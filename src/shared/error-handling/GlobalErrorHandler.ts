import { logger } from "../logger/Logger.js";
import { DomainError } from "../../core/errors/DomainErrors.js";

export class GlobalErrorHandler {
  static handleError(error: Error, context?: unknown): void {
    if (error instanceof DomainError) {
      // Errores del dominio - generalmente esperados
      logger.warn(error.message, {
        type: "DOMAIN_ERROR",
        code: error.code,
        details: error.details,
        context,
      });
    } else {
      // Errores inesperados
      logger.error(error, {
        type: "UNEXPECTED_ERROR",
        context,
      });
    }
  }

  static handleAsyncError<T>(
    promise: Promise<T>,
    context?: unknown,
  ): Promise<T> {
    return promise.catch((error: unknown) => {
      this.handleError(
        error instanceof Error ? error : new Error(String(error)),
        context,
      );
      throw error; // Re-throw for upstream handling
    });
  }
}

// Para uso en UI/React components
export function useErrorHandler() {
  return {
    handleError: (error: Error, context?: unknown) => {
      GlobalErrorHandler.handleError(error, context);

      // Aquí podrías mostrar notificaciones al usuario
      // Por ejemplo: toast.error(error.message);
    },
  };
}
