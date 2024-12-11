// lib/services/impersonation.ts
import { ImpersonationRepository } from '@/lib/dal/repositories/impersonation'
import { AuditLogRepository } from '@/lib/dal/repositories/audit-log'
import { createClient } from '@/lib/utils/supabase/server'
import { ImpersonationCookies } from '@/lib/utils/impersonation-cookies'
import { ImpersonationStartResult, ImpersonationStopResult } from '@/lib/types/impersonation'
import { getEventCategory } from '@/lib/types/audit'

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
        event_type: 'auth',
        details: `Admin ${adminId} started impersonating user ${targetUserId}`,
        organization_id: organizationId,
        metadata: { impersonated_user_id: targetUserId }
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
          event_type: 'auth',
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
    try {
      console.log('Checking status for user:', userId);
      
      // Check for active session in database using the repository
      const session = await this.impersonationRepo.getActiveSession(userId);
      console.log('Session query result:', session);

      const impersonatingId = await ImpersonationCookies.get();
      console.log('Cookie impersonation ID:', impersonatingId);

      // Only consider impersonation active if both session and cookie exist
      const isActive = !!session && !!impersonatingId;

      const status = {
        isImpersonating: isActive,
        impersonatingId: isActive ? session?.target_user_id : null,
        realUserId: isActive ? session?.real_user_id : null
      };

      console.log('Returning status:', status);
      return status;
    } catch (error) {
      console.error('Error getting impersonation status:', error);
      return {
        isImpersonating: false,
        impersonatingId: null,
        realUserId: null
      };
    }
  }
}