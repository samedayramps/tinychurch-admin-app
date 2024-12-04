import { getDAL } from './factory'
import type { Database } from '@/database.types'
import { TenantContext } from './context/TenantContext'
import { AuditLogRepository } from './repositories/audit-log'
import { createClient } from '@/utils/supabase/server'

type AuditLogRow = Database['public']['Tables']['audit_logs']['Row']

interface ImpersonationEventData {
  action: 'impersonation_start' | 'impersonation_end'
  actorId: string
  actorEmail: string
  targetId: string
  organizationId: string
}

export async function logImpersonationEvent(data: ImpersonationEventData): Promise<void> {
  const context = new TenantContext(
    data.organizationId,
    data.actorId,
    'superadmin'
  )
  
  const dal = await getDAL(context)
  const auditRepo = dal.getAuditLogRepository()

  await auditRepo.create({
    action: data.action,
    actor_id: data.actorId,
    category: 'security',
    description: `User ${data.actorEmail} ${data.action === 'impersonation_start' ? 'started' : 'stopped'} impersonating user ${data.targetId}`,
    metadata: {
      actor_email: data.actorEmail,
      target_user_id: data.targetId,
      timestamp: new Date().toISOString()
    }
  })
}

export async function getAuditLogs(limit: number = 10): Promise<AuditLogRow[]> {
  const supabase = await createClient()
  const repository = new AuditLogRepository(supabase)
  
  try {
    return await repository.findRecent(limit)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }
}

export async function getImpersonationLogs(organizationId: string, userId: string): Promise<AuditLogRow[]> {
  const context = new TenantContext(
    organizationId,
    userId,
    'superadmin'
  )
  
  const dal = await getDAL(context)
  const auditRepo = dal.getAuditLogRepository()

  return auditRepo.findByCategory('security', {
    limit: 50,
    filter: {
      actor_id: userId,
      'metadata->target_user_id': userId
    }
  })
} 