export interface PublicError {
  message: string
  code: string
}

export type ErrorCode = 
  | 'RESOURCE_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'INITIALIZATION_ERROR'
  | 'TRANSACTION_ERROR'
  | 'QUERY_ERROR'
  | 'VALIDATION_ERROR' 