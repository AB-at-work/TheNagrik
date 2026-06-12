import type { ApiErrorCode, ApiFieldError } from '@thenagrik/shared';

/**
 * Application error carrying an HTTP status, a machine-readable code, and
 * optional field-level details. Thrown anywhere in the request lifecycle and
 * formatted by the global error handler into the standard error envelope.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly details: ApiFieldError[] | undefined;

  constructor(
    statusCode: number,
    code: ApiErrorCode,
    message: string,
    details?: ApiFieldError[],
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message = 'Bad request', details?: ApiFieldError[]): AppError {
    return new AppError(400, 'VALIDATION_ERROR', message, details);
  }

  static validation(message = 'Validation failed', details?: ApiFieldError[]): AppError {
    return new AppError(422, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Not found'): AppError {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static conflict(message = 'Conflict'): AppError {
    return new AppError(409, 'CONFLICT', message);
  }

  static locked(message = 'Account locked'): AppError {
    return new AppError(423, 'ACCOUNT_LOCKED', message);
  }

  static tooManyRequests(message = 'Too many requests'): AppError {
    return new AppError(429, 'RATE_LIMITED', message);
  }

  static payloadTooLarge(message = 'Payload too large'): AppError {
    return new AppError(413, 'PAYLOAD_TOO_LARGE', message);
  }

  static unsupportedMediaType(message = 'Unsupported media type'): AppError {
    return new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', message);
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(500, 'INTERNAL_ERROR', message);
  }
}
