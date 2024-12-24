/**
 * Custom error class for authentication-related errors.
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype); // Ensure proper prototype chain
  }
}

/**
 * Custom error class for validation-related errors.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype); // Ensure proper prototype chain
  }
}

/**
 * Handles various types of errors and returns a user-friendly message.
 * @param error - The error to handle.
 * @returns A string message describing the error.
 */
export function handleError(error: unknown): string {
  if (error instanceof AuthError) {
    return `Authentication Error: ${error.message}`;
  }
  if (error instanceof ValidationError) {
    return `Validation Error: ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ha ocurrido un error inesperado';
}
