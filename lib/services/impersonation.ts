// lib/services/impersonation.ts
import { ImpersonationRepository } from '@/lib/dal/repositories/impersonation'
import { AuditLogRepository } from '@/lib/dal/repositories/audit-log'
import { createClient } from '@/lib/utils/supabase/server'
import { ImpersonationCookies } from '@/lib/utils/impersonation-cookies'
import { ImpersonationStartResult, ImpersonationStopResult } from '@/lib/types/impersonation'

export class ImpersonationService {
  private impersonationRepo: ImpersonationRepository
  private auditRepo: AuditLogRepository

  private constructor(
    impersonationRepo: ImpersonationRepository,
    auditRepo: AuditLogRepository
  ) {
    this.impersonationRepo = impersonationRepo
    this.auditRepo = auditRepo
  }

  static async create() {
    const supabase = await createClient(true)
    return new ImpersonationService(
      new ImpersonationRepository(supabase),
      new AuditLogRepository(supabase)
    )
  }

  async startImpersonation(adminId: string, targetUserId: string): Promise<ImpersonationStartResult> {
    try {
      const result = await this.impersonationRepo.startImpersonation(adminId, targetUserId)

      // Get organization context from target's memberships
      const organizationId = result.target.organization_members?.[0]?.organization_id

      // Log the event
      await this.auditRepo.create({
        user_id: adminId,
        event_type: 'login',
        details: `Admin ${adminId} started impersonating user ${targetUserId}`,
        organization_id: null
      })

      // Use cookie utility instead of direct manipulation
      ImpersonationCookies.set(targetUserId)

      return { success: true, userId: targetUserId }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to start impersonation' }
    }
  }

  async stopImpersonation(adminId: string, targetUserId: string): Promise<ImpersonationStopResult> {
    try {
      await this.impersonationRepo.stopImpersonation(adminId)

      const impersonatingId = await ImpersonationCookies.get()

      if (impersonatingId) {
        // Log the event
        await this.auditRepo.create({
          user_id: adminId,
          event_type: 'logout',
          details: `Admin ${adminId} stopped impersonating user ${targetUserId}`,
          organization_id: null
        })

        // Use cookie utility
        await ImpersonationCookies.clear()
      }

      return { success: true }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to stop impersonation' }
    }
  }

  async getStatus(userId: string) {
    const status = await this.impersonationRepo.getImpersonationStatus(userId)
    const impersonatingId = ImpersonationCookies.get()

    // Only consider impersonation active if both metadata and cookie exist
    const isActive = !!status && !!impersonatingId

    return {
      isImpersonating: isActive,
      impersonatingId: isActive ? status?.impersonating : null,
      realUserId: isActive ? status?.original_user : null
    }
  }
}