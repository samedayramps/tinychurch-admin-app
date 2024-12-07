export type ErrorCode = 
  | 'RESOURCE_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'QUERY_ERROR'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'INVALID_OPERATION'
  | 'INITIALIZATION_ERROR'
  | 'TRANSACTION_ERROR'

export type PublicError = {
  code: ErrorCode
  message: string
  context?: Record<string, unknown>
} 