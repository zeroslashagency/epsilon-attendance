/**
 * Base Domain Error
 * All domain-specific errors extend this
 */
export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 * Thrown when domain validation fails
 */
export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

/**
 * Not Found Error
 * Thrown when an entity is not found
 */
export class NotFoundError extends DomainError {
  constructor(entityName: string, identifier: string) {
    super(`${entityName} not found: ${identifier}`, 'NOT_FOUND');
  }
}

/**
 * Permission Error
 * Thrown when user doesn't have required permission
 */
export class PermissionError extends DomainError {
  constructor(action: string) {
    super(`Permission denied: ${action}`, 'PERMISSION_DENIED');
  }
}

/**
 * Business Rule Error
 * Thrown when a business rule is violated
 */
export class BusinessRuleError extends DomainError {
  constructor(rule: string, details?: string) {
    const message = details 
      ? `Business rule violated: ${rule}. ${details}`
      : `Business rule violated: ${rule}`;
    super(message, 'BUSINESS_RULE_VIOLATION');
  }
}
