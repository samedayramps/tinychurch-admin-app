// lib/services/impersonation.ts
import { createClient } from '@/utils/supabase/server'
import { AuditLogRepository } from '@/lib/dal/repositories/audit-log'
import { ProfileRepository } from '@/lib/dal/repositories/profile'
import { type SupabaseClient } from '@supabase/supabase-js'

export class ImpersonationService {
  private supabase: SupabaseClient
  private auditRepo: AuditLogRepository
  private profileRepo: ProfileRepository

  private constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.auditRepo = new AuditLogRepository(supabase)
    this.profileRepo = new ProfileRepository(supabase)
  }

  static async create(): Promise<ImpersonationService> {
    const supabase = await createClient(true)
    return new ImpersonationService(supabase)
  }

  async startImpersonation(actorId: string, targetId: string) {
    // Verify superadmin status
    const actor = await this.profileRepo.findById(actorId)
    if (!actor?.is_superadmin) {
      throw new Error('Unauthorized - Superadmin access required')
    }

    // Verify target user exists
    const target = await this.profileRepo.findById(targetId)
    if (!target) {
      throw new Error('Target user not found')
    }

    // Set impersonation metadata
    await this.supabase.auth.admin.updateUserById(actorId, {
      app_metadata: {
        impersonation: {
          impersonating: targetId,
          original_user: actorId,
          started_at: Date.now()
        }
      }
    })

    // Log impersonation start
    await this.auditRepo.create({
      category: 'auth',
      action: 'impersonation_start',
      actor_id: actorId,
      target_id: targetId,
      description: `Superadmin ${actor.email} started impersonating user ${target.email}`
    })
  }

  async stopImpersonation(actorId: string) {
    // Clear impersonation metadata
    await this.supabase.auth.admin.updateUserById(actorId, {
      app_metadata: {
        impersonation: null
      }
    })

    // Get user details for audit log
    const actor = await this.profileRepo.findById(actorId)

    // Log impersonation end
    await this.auditRepo.create({
      category: 'auth',
      action: 'impersonation_end',
      actor_id: actorId,
      description: `Superadmin ${actor?.email} stopped impersonation`
    })
  }

  async getImpersonationStatus(userId: string) {
    const { data: { user } } = await this.supabase.auth.admin.getUserById(userId)
    return user?.app_metadata?.impersonation
  }
}