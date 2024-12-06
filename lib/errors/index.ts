export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }

  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError
  }
}

export class AuthError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AUTH_ERROR', 401, context)
    this.name = 'AuthError'
  }
}

export class PermissionError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'PERMISSION_ERROR', 403, context)
    this.name = 'PermissionError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'NOT_FOUND', 404, context)
    this.name = 'NotFoundError'
  }
} 