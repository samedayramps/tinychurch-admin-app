import type { Database as DatabaseGenerated } from '@/database.types'
import type { SupabaseClient as SupabaseClientOriginal } from '@supabase/supabase-js'
import type { TenantContext } from '../context/TenantContext'

// Database Types
export type Database = DatabaseGenerated
export type TableName = keyof Database['public']['Tables']
export type Json = Database['public']['Tables']['organization_settings']['Row']['value']

// Supabase Client Type
export type SupabaseClient<T extends Database = Database> = SupabaseClientOriginal<T>

// Re-export TenantContext
export { TenantContext }

// Define and export QueryOptions if needed
export type QueryOptions = {
  // Define the structure of QueryOptions here
}

// Error Types
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

// Cache Types
export interface CacheEntry {
  data: any
  expires: number
}

// Monitoring Types
export interface MetricTags {
  organization_id?: string
  user_id?: string
  operation: string
  status: 'success' | 'error'
}

// Re-export all types
export * from '../repositories/types' 