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
    return new AuthService(supabase)
  }

  async signIn(email: string | undefined, password: string) {
    const requestId = crypto.randomUUID()
    
    try {
      // Check for undefined email first
      if (!email) {
        throw new Error('Email is required')
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email, // Now TypeScript knows email is string
        password
      })
      
      if (error) throw error

      // Create profile if it doesn't exist
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,  // Add default values
          status: 'active' as Database['public']['Enums']['auth_status'] // Add proper type
        }, {
          onConflict: 'id',
          ignoreDuplicates: false // Change to false to ensure updates
        })
        .select()
        .single()

      if (profileError) {
        log.error('Profile error', {
          requestId,
          error: profileError,
          userId: data.user.id
        })
        throw profileError
      }

      return {
        user: data.user,
        profile,
        redirectTo: '/dashboard'
      }
    } catch (error) {
      log.error('Sign in error', {
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
    const { data: { session }, error } = await this.supabase.auth.getSession()
    if (error) throw error
    if (!session) return null

    const profile = await this.profileRepo.findById(session.user.id)
    return { session, profile }
  }

  async signOut() {
    await this.supabase.auth.signOut()
  }
}