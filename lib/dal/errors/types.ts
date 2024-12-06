export type ErrorCode = 
  | 'RESOURCE_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INITIALIZATION_ERROR'
  | 'TRANSACTION_ERROR'
  | 'QUERY_ERROR'
  | 'VALIDATION_ERROR'
  | 'OPERATION_ERROR'

export interface PublicError {
  message: string
  code: ErrorCode
  context?: Record<string, unknown>
} 