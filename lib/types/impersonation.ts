import type { Database } from '@/database.types'

export type ImpersonationMetadata = {
  impersonating: string
  original_user: string
  impersonation_started: number
}

export type ImpersonationState = {
  isImpersonating: boolean
  impersonatingId: string | null
  impersonatedUserId?: string | null
  realUserId: string | null
  isInitialized?: boolean
  refresh: () => Promise<void>
}

export type ImpersonationEventType = 'start' | 'stop'

export interface ImpersonationEventDetail {
  type: ImpersonationEventType
  userId?: string
}

export type AuditLogEntry = Database['public']['Tables']['user_activity_logs']['Row']

export type ImpersonationError = {
  code: 'UNAUTHORIZED' | 'INVALID_TARGET' | 'SELF_IMPERSONATION' | 'SYSTEM_ERROR'
  message: string
}

export type ImpersonationStatus = {
  isActive: boolean
  targetUser: {
    id: string
    email: string
  } | null
  originalUser: {
    id: string
    email: string
  } | null
}

export type ImpersonationStartResult = 
  | { success: true; userId: string }
  | { error: string }

export type ImpersonationStopResult = 
  | { success: true }
  | { error: string } 