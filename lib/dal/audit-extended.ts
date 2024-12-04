import { AuditLogRepository } from './repositories/audit-log'
import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']

export async function createAuditLog(data: Omit<AuditLogInsert, 'id' | 'created_at'>) {
  const supabase = await createClient()
  const auditRepo = new AuditLogRepository(supabase)
  
  return auditRepo.create(data)
} 