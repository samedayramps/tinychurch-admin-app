// lib/services/auth.ts
import { createClient } from '@/lib/utils/supabase/server'
import { type AuthError } from '@supabase/supabase-js'
import { ProfileRepository } from '@/lib/dal/repositories/profile'
import { AuditLogRepository } from '@/lib/dal/repositories/audit-log'
import { type SupabaseClient } from '@supabase/supabase-js'
import { type JsonValue } from '@/lib/types/audit'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { log } from '@/lib/utils/logger'
import type { Database } from '@/database.types'

type OrganizationMember = Database['public']['Tables']['organization_members']['Row']
type Organization = Database['public']['Tables']['organizations']['Row']

// Type for minimal organization data returned from the auth query
interface MinimalOrganization {
  id: string
  name: string
  slug: string
}

interface OrganizationResponse {
  role: string
  organizations: {
    id: string
    name: string
    slug: string
  }
}

export class AuthService {
  private supabase: SupabaseClient
  private profileRepo: ProfileRepository
  private orgRepo: OrganizationRepository

  private constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.profileRepo = new ProfileRepository(supabase)
    this.orgRepo = new OrganizationRepository(supabase)
  }

  static async create(): Promise<AuthService> {
    const supabase = await createClient()
    log.debug('AuthService instance created')
    return new AuthService(supabase)
  }

  async signIn(email: string | undefined, password: string) {
    const requestId = crypto.randomUUID()
    
    log.info('Sign in attempt started', {
      requestId,
      email,
      hasPassword: !!password
    })
    
    try {
      // Check for undefined email first
      if (!email) {
        log.warn('Sign in attempted without email', { requestId })
        throw new Error('Email is required')
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        log.error('Sign in authentication failed', {
          requestId,
          error: error.message,
          code: error.status,
          email
        })
        throw error
      }

      log.info('Sign in successful, creating/updating profile', {
        requestId,
        userId: data.user.id,
        email: data.user.email
      })

      // Create profile if it doesn't exist
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          status: 'active' as Database['public']['Enums']['auth_status']
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (profileError) {
        log.error('Profile creation/update failed', {
          requestId,
          error: profileError,
          userId: data.user.id
        })
        throw profileError
      }

      log.info('Authentication and profile setup complete', {
        requestId,
        userId: data.user.id,
        email: data.user.email,
        profileId: profile.id,
        redirectTo: '/dashboard'
      })

      return {
        user: data.user,
        profile,
        redirectTo: '/dashboard'
      }
    } catch (error) {
      log.error('Sign in process failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        email
      })
      throw error
    }
  }

  private async setActiveOrganization(organizationId: string) {
    // Store the active organization ID in the user's metadata
    await this.supabase.auth.updateUser({
      data: { active_organization_id: organizationId }
    })
  }

  async getActiveOrganization(userId: string) {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return null

    const activeOrgId = user.user_metadata.active_organization_id
    if (!activeOrgId) return null

    return this.orgRepo.findById(activeOrgId)
  }

  async getSession() {
    const requestId = crypto.randomUUID()
    
    try {
      log.debug('Fetching session', { requestId })
      
      const { data: { session }, error } = await this.supabase.auth.getSession()
      if (error) {
        log.error('Session fetch failed', {
          requestId,
          error: error.message
        })
        throw error
      }
      
      if (!session) {
        log.info('No active session found', { requestId })
        return null
      }

      log.debug('Fetching profile for session', {
        requestId,
        userId: session.user.id
      })
      
      const profile = await this.profileRepo.findById(session.user.id)
      
      log.info('Session and profile retrieved', {
        requestId,
        userId: session.user.id,
        hasProfile: !!profile
      })
      
      return { session, profile }
    } catch (error) {
      log.error('Session retrieval failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  async signOut() {
    const requestId = crypto.randomUUID()
    
    try {
      log.info('Sign out initiated', { requestId })
      await this.supabase.auth.signOut()
      log.info('Sign out successful', { requestId })
    } catch (error) {
      log.error('Sign out failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }
}