// lib/services/superadmin.ts
import { createClient } from '@/lib/utils/supabase/server'
import { ProfileRepository } from '@/lib/dal/repositories/profile'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { AuditLogRepository } from '@/lib/dal/repositories/audit-log'
import { SettingsRepository } from '@/lib/dal/repositories/settings'
import { type SupabaseClient } from '@supabase/supabase-js'
import { TenantContext } from '@/lib/dal/context/TenantContext'
import { type UserRole } from '@/lib/types/auth'
import { getEventCategory } from '@/lib/types/audit'
import type { Database } from '@/database.types'
import type { CreateAuditLogParams } from '@/lib/types/audit'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

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
      user_id: actorId,
      event_type: 'system',
      details: `Updated organization limits: ${JSON.stringify(limits)}`,
      organization_id: orgId,
      metadata: limits
    })
  }

  async assignSuperadminRole(userId: string, actorId: string) {
    await this.profileRepo.update(userId, {
      is_superadmin: true
    })

    await this.auditRepo.create({
      user_id: actorId,
      event_type: 'system',
      details: `Granted superadmin role to user ${userId}`,
      organization_id: null
    })
  }

  async getSystemAuditLog(options: {
    startDate?: string
    endDate?: string
    category?: string
    limit?: number
  } = {}) {
    return this.auditRepo.findByCategory('role_change', {
      limit: options.limit
    })
  }

  async auditAction(userId: string, action: string) {
    await this.auditRepo.create({
      user_id: userId,
      event_type: 'user_action',
      details: action,
      organization_id: null
    })
  }

  async getAuditLogs(options: { limit?: number } = {}) {
    try {
      return await this.auditRepo.findByCategory('profile_update', { 
        limit: options.limit 
      })
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      return []
    }
  }

  async updateUserProfile(userId: string, data: Partial<ProfileRow>) {
    await this.profileRepo.update(userId, data)

    await this.auditRepo.create({
      user_id: userId,
      event_type: 'user_action',
      details: `Profile updated for user ${userId}`,
      metadata: { changes: data }
    })
  }

  async updateUserRole(userId: string, role: UserRole) {
    const { data: member } = await this.supabase
      .from('organization_members')
      .select('id, role')
      .eq('user_id', userId)
      .single()

    if (member) {
      await this.supabase
        .from('organization_members')
        .update({ role })
        .eq('id', member.id)
    }

    await this.auditRepo.create({
      user_id: userId,
      event_type: 'system',
      details: `Role changed to ${role} for user ${userId}`,
      metadata: {
        new_role: role,
        previous_role: member?.role ?? null,
        updated_at: new Date().toISOString()
      }
    })
  }
}