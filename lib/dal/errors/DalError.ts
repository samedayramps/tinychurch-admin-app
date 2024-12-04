import type { PublicError, ErrorCode } from './types'

export class DalError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly organizationId?: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'DalError'
  }

  toPublicError(): PublicError {
    return {
      message: this.getPublicMessage(),
      code: this.code
    }
  }

  private getPublicMessage(): string {
    switch (this.code) {
      case 'RESOURCE_NOT_FOUND':
        return 'The requested resource was not found'
      case 'PERMISSION_DENIED':
        return 'You do not have permission to perform this action'
      case 'INITIALIZATION_ERROR':
        return 'Unable to initialize data access'
      case 'TRANSACTION_ERROR':
        return 'Operation failed, please try again'
      case 'VALIDATION_ERROR':
        return 'Invalid data provided'
      default:
        return 'An unexpected error occurred'
    }
  }
} 