import type { ErrorCode } from './types'

export class DalError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'DalError'
  }

  static notFound(resource: string) {
    return new DalError(
      `${resource} not found`,
      'RESOURCE_NOT_FOUND',
      { resource }
    )
  }

  static unauthorized() {
    return new DalError(
      'Unauthorized access',
      'PERMISSION_DENIED'
    )
  }

  static operationFailed(operation: string, error: unknown) {
    const context = {
      originalError: error instanceof Error ? error.message : String(error)
    }
    
    return new DalError(
      `Operation ${operation} failed`,
      'QUERY_ERROR',
      context
    )
  }

  static validationError(message: string, context?: Record<string, unknown>) {
    return new DalError(
      message,
      'VALIDATION_ERROR',
      context
    )
  }
}

export { DalError as AppError }
export type { ErrorCode, PublicError } from './types'

// Centralized error handler
export function handleDalError(error: unknown): never {
  if (error instanceof DalError) {
    throw error
  }
  
  throw new DalError(
    'An unexpected error occurred',
    'QUERY_ERROR',
    { cause: error instanceof Error ? error.message : String(error) }
  )
} 