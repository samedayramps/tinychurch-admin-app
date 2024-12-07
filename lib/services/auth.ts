// lib/services/auth.ts
import { createClient } from '@/lib/utils/supabase/server'
import { type AuthError } from '@supabase/supabase-js'
import { ProfileRepository } from '@/lib/dal/repositories/profile'
import { AuditLogRepository } from '@/lib/dal/repositories/audit-log'
import { type SupabaseClient } from '@supabase/supabase-js'
import { type JsonValue } from '@/lib/types/audit'

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
    await this.logUserLogin(data.user.id)

    return data
  }

  async signOut(userId: string) {
    await this.supabase.auth.signOut()

    // Log the sign out
    await this.logUserLogout(userId)
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

    await this.logPasswordChange(userId)
  }

  async logUserLogin(userId: string, metadata?: JsonValue) {
    await this.auditRepo.create({
      user_id: userId,
      event_type: 'auth',
      details: `User ${userId} logged in`,
      metadata: metadata ?? null
    })
  }

  async logUserLogout(userId: string) {
    await this.auditRepo.create({
      user_id: userId,
      event_type: 'auth',
      details: `User ${userId} logged out`
    })
  }

  async logPasswordChange(userId: string) {
    await this.auditRepo.create({
      user_id: userId,
      event_type: 'auth',
      details: `User ${userId} changed their password`
    })
  }
}