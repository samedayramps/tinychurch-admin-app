import { AuditLogRepository } from './repositories/audit-log'
import { createClient } from '@/lib/utils/supabase/server'
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type ActivityLogInsert = Database['public']['Tables']['user_activity_logs']['Insert']

export async function createAuditLog(data: Omit<ActivityLogInsert, 'id' | 'created_at'>) {
  const supabase = await createClient()
  const auditRepo = new AuditLogRepository(supabase)
  
  return auditRepo.create(data)
} 