// lib/dal/factory.ts
import { SupabaseClient } from '@supabase/supabase-js'
import { TenantContext } from './context/TenantContext'
import { createClient } from '@/utils/supabase/server'
import { DalError } from './errors/DalError'
import type { Database } from '@/database.types'

// Import repositories directly from their files instead of barrel import
import { OrganizationRepository } from './repositories/organization'
import { UserRepository } from './repositories/user'
import { EventRepository } from './repositories/event'
import { AuditLogRepository } from './repositories/audit-log'
import { OrganizationMemberRepository } from './repositories/organization-member'
import { ProfileRepository } from './repositories/profile'
import { SettingsRepository } from './repositories/settings'

export class DALFactory {
  private static instance: DALFactory
  private repositories: Map<string, any> = new Map()
  private initialized = false
  private supabase!: SupabaseClient<Database>
  private context?: TenantContext

  static async getInstance(): Promise<DALFactory> {
    if (!this.instance) {
      this.instance = new DALFactory()
    }
    return this.instance
  }

  async initialize(context?: TenantContext) {
    if (this.initialized && this.context?.organizationId === context?.organizationId) {
      return this
    }

    this.supabase = await createClient()
    this.context = context
    this.initialized = true
    this.repositories.clear()
    return this
  }

  // Generic repository getter
  private getRepository<T>(key: string, RepositoryClass: new (...args: any[]) => T): T {
    if (!this.initialized) {
      throw new DalError('DAL not initialized', 'INITIALIZATION_ERROR')
    }

    let repo = this.repositories.get(key)
    if (!repo) {
      repo = new RepositoryClass(this.supabase, this.context)
      this.repositories.set(key, repo)
    }
    return repo
  }

  // Repository getters
  getOrganizationRepository() {
    return this.getRepository('organization', OrganizationRepository)
  }

  getUserRepository() {
    return this.getRepository('user', UserRepository)
  }

  getEventRepository() {
    return this.getRepository('event', EventRepository)
  }

  getAuditLogRepository() {
    return this.getRepository('audit', AuditLogRepository)
  }

  getOrganizationMemberRepository() {
    return this.getRepository('organization-member', OrganizationMemberRepository)
  }

  getProfileRepository() {
    return this.getRepository('profile', ProfileRepository)
  }

  getSettingsRepository() {
    return this.getRepository('settings', SettingsRepository)
  }

  // Transaction support with proper typing
  async transaction<T>(callback: (trx: SupabaseClient<Database>) => Promise<T>): Promise<T> {
    if (!this.initialized) {
      throw new DalError('DAL not initialized', 'INITIALIZATION_ERROR')
    }

    try {
      // Start transaction
      const { data: session } = await this.supabase.auth.setSession({
        access_token: '',
        refresh_token: ''
      })

      if (!session) {
        throw new Error('Failed to start transaction')
      }

      const result = await callback(this.supabase)
      return result
    } catch (error) {
      throw new DalError(
        'Transaction failed',
        'TRANSACTION_ERROR',
        this.context?.organizationId,
        error as Error
      )
    }
  }
}

// Helper function to get initialized DAL instance
export async function getDAL(context?: TenantContext) {
  const factory = await DALFactory.getInstance()
  await factory.initialize(context)
  return factory
}