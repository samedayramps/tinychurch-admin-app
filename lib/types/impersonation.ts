import type { Database } from '@/database.types'

export type ImpersonationMetadata = {
  impersonating: string
  original_user: string
  impersonation_started: number
}

export type ImpersonationState = {
  isImpersonating: boolean
  impersonatingId: string | null
  realUserId: string | null
}

export type AuditLogEntry = Database['public']['Tables']['audit_logs']['Row'] 