import { getDAL } from './factory'
import type { Database } from '@/database.types'
import { createClient } from '@/lib/utils/supabase/server'

type ActivityLogRow = Database['public']['Tables']['user_activity_logs']['Row']
type ActivityLogInsert = Database['public']['Tables']['user_activity_logs']['Insert']

export async function getAuditLogs(limit: number = 10): Promise<ActivityLogRow[]> {
  const supabase = await createClient()
  const dal = await getDAL()
  
  try {
    return await dal.auditLogs.findByCategory('user_action', { limit })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }
}

export async function createAuditLog(data: Omit<ActivityLogInsert, 'id' | 'created_at'>) {
  const supabase = await createClient()
  const dal = await getDAL()
  return dal.auditLogs.create(data)
} 