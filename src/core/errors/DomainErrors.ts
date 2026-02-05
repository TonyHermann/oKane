// Errores específicos del dominio
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id '${id}' not found`, "ENTITY_NOT_FOUND", {
      entity,
      id,
    });
    this.name = "EntityNotFoundError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, field?: string) {
    super(message, "VALIDATION_ERROR", { field });
    this.name = "ValidationError";
  }
}

export class DuplicateEntityError extends DomainError {
  constructor(entity: string, field: string, value: any) {
    super(
      `${entity} with ${field} '${value}' already exists`,
      "DUPLICATE_ENTITY",
      { entity, field, value },
    );
    this.name = "DuplicateEntityError";
  }
}
