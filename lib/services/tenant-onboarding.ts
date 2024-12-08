import { createClient } from '@/lib/utils/supabase/server'
import { SuperadminService } from './superadmin'
import type { Database } from '@/database.types'
import { type SupabaseClient, AuthApiError } from '@supabase/supabase-js'
import { Monitor } from '@/lib/dal/monitoring'

interface TenantOnboardingData {
  organization: {
    name: string
    slug: string
    limits?: Record<string, number>
  }
  admin: {
    email: string
    first_name: string
    last_name: string
    phone?: string
  }
}

export class TenantOnboardingService {
  private monitor: Monitor

  constructor(
    private supabase: SupabaseClient,
    private superadminService: SuperadminService
  ) {
    this.monitor = new Monitor()
  }

  static async create(): Promise<TenantOnboardingService> {
    const supabase = await createClient(true)
    const superadminService = await SuperadminService.create()
    return new TenantOnboardingService(supabase, superadminService)
  }

  async onboardNewTenant(data: TenantOnboardingData, actorId: string) {
    const endTimer = this.monitor.trackDuration('tenant.onboarding', {
      operation: 'create_tenant',
      status: 'success'
    })

    try {
      // 1. Create the organization first
      const { data: org, error: orgError } = await this.supabase
        .from('organizations')
        .insert({
          name: data.organization.name,
          slug: data.organization.slug,
          created_at: new Date().toISOString(),
          status: 'active'
        })
        .select()
        .single()

      if (orgError) throw orgError

      // 2. Send admin invitation
      const { data: authUser, error: inviteError } = await this.supabase.auth.admin.inviteUserByEmail(
        data.admin.email,
        {
          data: {
            organization_id: org.id,
            organization_name: org.name,
            role: 'admin',
            first_name: data.admin.first_name,
            last_name: data.admin.last_name,
            is_admin: true
          },
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/setup/${org.slug}`
        }
      )

      if (inviteError) {
        // Clean up organization if invitation fails
        await this.supabase
          .from('organizations')
          .delete()
          .eq('id', org.id)
        throw inviteError
      }

      // 3. Create profile
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: data.admin.email,
          first_name: data.admin.first_name,
          last_name: data.admin.last_name,
          phone: data.admin.phone,
          is_active: true,
          is_superadmin: false,
          status: 'invited'
        })

      if (profileError) {
        // Clean up auth user and organization if profile creation fails
        await this.supabase.auth.admin.deleteUser(authUser.user.id)
        await this.supabase
          .from('organizations')
          .delete()
          .eq('id', org.id)
        throw profileError
      }

      // 4. Create organization membership
      const { error: memberError } = await this.supabase
        .from('organization_members')
        .insert({
          user_id: authUser.user.id,
          organization_id: org.id,
          role: 'admin',
          joined_date: new Date().toISOString()
        })

      if (memberError) {
        // Clean up profile, auth user, and organization if membership creation fails
        await this.supabase
          .from('profiles')
          .delete()
          .eq('id', authUser.user.id)
        await this.supabase.auth.admin.deleteUser(authUser.user.id)
        await this.supabase
          .from('organizations')
          .delete()
          .eq('id', org.id)
        throw memberError
      }

      // 5. Create audit log entry
      await this.superadminService.auditAction(
        actorId,
        `Created new tenant organization: ${data.organization.name} (${org.id})`
      )

      endTimer()
      this.monitor.trackMetric('tenant.onboarding.success', 1, {
        operation: 'create_tenant',
        status: 'success'
      })

      return {
        organization: org,
        adminUser: {
          id: authUser.user.id,
          email: data.admin.email
        }
      }
    } catch (error) {
      endTimer()
      this.monitor.trackMetric('tenant.onboarding.error', 1, {
        operation: 'create_tenant',
        status: 'error'
      })

      if (error instanceof AuthApiError && error.status === 429) {
        throw new Error('Email sending rate limit exceeded. Please try again in a few minutes.')
      }
      throw error
    }
  }
} 