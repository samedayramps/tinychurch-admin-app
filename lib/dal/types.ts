// lib/dal/types.ts
import type { Database } from '@/database.types'

export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

export type TableName = keyof Tables
export type TableRow<T extends TableName> = Tables[T]['Row']
export type TableInsert<T extends TableName> = Tables[T]['Insert']
export type TableUpdate<T extends TableName> = Tables[T]['Update']

export type AuditLogRow = Tables['user_activity_logs']['Row']
export type AuditLogInsert = Tables['user_activity_logs']['Insert']
export type AuditLogUpdate = Tables['user_activity_logs']['Update']