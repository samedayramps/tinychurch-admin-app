// lib/services/auth.ts
import { createClient } from '@/lib/utils/supabase/server'
import { type AuthError } from '@supabase/supabase-js'
import { ProfileRepository } from '@/lib/dal/repositories/profile'
import { AuditLogRepository } from '@/lib/dal/repositories/audit-log'
import { type SupabaseClient } from '@supabase/supabase-js'

export class AuthService {
  private supabase: SupabaseClient
  private profileRepo: ProfileRepository
  private auditRepo: AuditLogRepository

  private constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.profileRepo = new ProfileRepository(supabase)
    this.auditRepo = new AuditLogRepository(supabase)
  }

  static async create(): Promise<AuthService> {
    const supabase = await createClient()
    return new AuthService(supabase)
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Update profile
    await this.profileRepo.updateLastActivity(data.user.id)

    // Log the sign in
    await this.auditRepo.create({
      user_id: data.user.id,
      event_type: 'login',
      details: 'User logged in',
      organization_id: null
    })

    return data
  }

  async signOut(userId: string) {
    await this.supabase.auth.signOut()

    // Log the sign out
    await this.auditRepo.create({
      user_id: userId,
      event_type: 'logout',
      details: 'User logged out',
      organization_id: null
    })
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  async updatePassword(userId: string, newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error

    await this.auditRepo.create({
      user_id: userId,
      event_type: 'password_change',
      details: 'User updated password',
      organization_id: null
    })
  }
}