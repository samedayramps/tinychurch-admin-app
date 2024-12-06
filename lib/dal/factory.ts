// lib/dal/factory.ts
import { createClient } from '@/lib/utils/supabase/server'
import { TenantContext } from './context/TenantContext'
import { cache } from 'react'
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ProfileRepository } from './repositories/profile'
import { OrganizationRepository } from './repositories/organization'
import { AuditLogRepository } from './repositories/audit-log'

export class DALFactory {
  private static instance: Promise<DALFactory>
  private client: SupabaseClient<Database>

  private constructor(client: SupabaseClient<Database>) {
    this.client = client
  }

  static async getInstance(): Promise<DALFactory> {
    if (!this.instance) {
      this.instance = createClient().then(client => new DALFactory(client))
    }
    return this.instance
  }

  getRepository(context?: TenantContext) {
    return {
      profiles: new ProfileRepository(this.client, context),
      organizations: new OrganizationRepository(this.client, context),
      auditLogs: new AuditLogRepository(this.client, context)
    }
  }
}

export const getDAL = cache(async (context?: TenantContext) => {
  const factory = await DALFactory.getInstance()
  return factory.getRepository(context)
})

export type DAL = ReturnType<DALFactory['getRepository']>