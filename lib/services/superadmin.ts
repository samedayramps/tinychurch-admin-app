// lib/services/superadmin.ts
import { createClient } from '@/utils/supabase/server'
import { ProfileRepository } from '@/lib/dal/repositories/profile'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { AuditLogRepository } from '@/lib/dal/repositories/audit-log'
import { SettingsRepository } from '@/lib/dal/repositories/settings'
import { type SupabaseClient } from '@supabase/supabase-js'
import { TenantContext } from '@/lib/dal/context/TenantContext'
import { type UserRole } from '@/lib/types/auth'

export class SuperadminService {
  private supabase: SupabaseClient
  private profileRepo: ProfileRepository
  private orgRepo: OrganizationRepository
  private auditRepo: AuditLogRepository

  private constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.profileRepo = new ProfileRepository(supabase)
    this.orgRepo = new OrganizationRepository(supabase)
    this.auditRepo = new AuditLogRepository(supabase)
  }

  static async create(): Promise<SuperadminService> {
    const supabase = await createClient(true)
    return new SuperadminService(supabase)
  }

  async getSystemStats() {
    const [
      { count: totalUsers },
      { count: totalOrgs },
      { count: activeUsers }
    ] = await Promise.all([
      this.supabase.from('profiles').select('*', { count: 'exact', head: true }),
      this.supabase.from('organizations').select('*', { count: 'exact', head: true }),
      this.supabase.from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('last_login', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ])

    return {
      totalUsers,
      totalOrgs,
      activeUsers
    }
  }

  async updateOrganizationLimits(
    orgId: string, 
    limits: Record<string, number>,
    actorId: string
  ) {
    const tenantContext = new TenantContext(
      orgId,
      actorId,
      'superadmin' as UserRole
    )
    
    const settingsRepo = new SettingsRepository(this.supabase, tenantContext)
    await settingsRepo.updateSettings({ limits }, { merge: true })

    await this.auditRepo.create({
      category: 'system',
      action: 'update_limits',
      actor_id: actorId,
      organization_id: orgId,
      description: `Updated organization limits`,
      metadata: limits
    })
  }

  async assignSuperadminRole(userId: string, actorId: string) {
    await this.profileRepo.update(userId, {
      is_superadmin: true
    })

    await this.auditRepo.create({
      category: 'system',
      action: 'grant_superadmin',
      actor_id: actorId,
      target_id: userId,
      description: 'Granted superadmin role'
    })
  }

  async getSystemAuditLog(options: {
    startDate?: string
    endDate?: string
    category?: string
    limit?: number
  } = {}) {
    return this.auditRepo.findByCategory('system', {
      limit: options.limit,
      filter: {
        created_at: options.startDate ? { gte: options.startDate } : undefined,
        // Add other filters as needed
      }
    })
  }
}