import { BaseRepositoryBase } from '../base/repository-base'
import type { Database } from '@/database.types'
import { DalError } from '../errors'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TenantContext } from '../context/TenantContext'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export class ImpersonationRepository extends BaseRepositoryBase<'profiles'> {
  protected tableName = 'profiles' as const
  protected organizationField = 'organization_id' as keyof ProfileRow

  constructor(protected client: SupabaseClient<Database>, context?: TenantContext) {
    super(client, context)
  }

  async verifyImpersonationAccess(actorId: string, targetId: string) {
    // Add check to prevent self-impersonation
    if (actorId === targetId) {
      throw new DalError('Cannot impersonate yourself', 'VALIDATION_ERROR')
    }

    // Get actor's profile and verify superadmin status
    const { data: actor } = await this.client
      .from(this.tableName)
      .select('is_superadmin, email')
      .eq('id', actorId)
      .single()

    if (!actor?.is_superadmin) {
      throw new DalError('Unauthorized - Superadmin access required', 'PERMISSION_DENIED')
    }

    // Verify target exists and get organization context
    const { data: target } = await this.client
      .from(this.tableName)
      .select(`
        *,
        organization_members!inner (
          organization_id
        )
      `)
      .eq('id', targetId)
      .single()

    if (!target) {
      throw new DalError('Target user not found', 'RESOURCE_NOT_FOUND')
    }

    return {
      actor,
      target,
      organizationId: target.organization_members[0]?.organization_id
    }
  }

  async startImpersonation(actorId: string, targetId: string) {
    const { actor, target, organizationId } = await this.verifyImpersonationAccess(actorId, targetId)

    // Set impersonation metadata
    const { error: updateError } = await this.client.auth.admin.updateUserById(
      actorId,
      {
        app_metadata: {
          impersonation: {
            impersonating: targetId,
            original_user: actorId,
            started_at: Date.now()
          }
        }
      }
    )

    if (updateError) {
      throw new DalError(
        `Failed to update user metadata: ${updateError.message}`,
        'DATABASE_ERROR',
        {
          organizationId,
          actorId,
          targetId,
          error: updateError.message
        }
      )
    }

    return { actor, target }
  }

  async stopImpersonation(actorId: string) {
    const { error } = await this.client.auth.admin.updateUserById(
      actorId,
      {
        app_metadata: {
          impersonation: null
        }
      }
    )

    if (error) {
      throw new DalError(
        `Failed to clear impersonation metadata: ${error.message}`,
        'DATABASE_ERROR',
        {
          actorId,
          error: error.message
        }
      )
    }
  }

  async getImpersonationStatus(userId: string) {
    const { data: { user }, error } = await this.client.auth.admin.getUserById(userId)
    
    if (error || !user) {
      return null
    }

    return user.app_metadata?.impersonation
  }

  async logImpersonationEvent(data: {
    action: 'impersonation_start' | 'impersonation_end'
    actorId: string
    targetId: string
    organizationId: string
    metadata?: Record<string, any>
  }) {
    // Implementation here
  }

  async getActiveSession(userId: string) {
    const { data: session, error } = await this.client
      .from('impersonation_sessions')
      .select('*')
      .or(`real_user_id.eq.${userId},target_user_id.eq.${userId}`)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching active session:', error);
      return null;
    }

    return session;
  }
}
