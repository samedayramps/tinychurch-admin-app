import { AuditLogRepository } from '@/lib/dal/repositories/audit-log'
import { createClient } from '@/lib/utils/supabase/server'
import { AuditLogsClient } from '@/components/superadmin/audit/audit-logs-client'

export default async function AuditPage() {
  const supabase = await createClient()
  const auditRepo = new AuditLogRepository(supabase)

  try {
    // Fetch initial data
    const [systemLogs, userLogs, securityLogs, { data: organizations }] = await Promise.all([
      auditRepo.findByCategory('system', { limit: 100 }).catch(() => []),
      auditRepo.findByCategory('user_action', { limit: 100 }).catch(() => []),
      auditRepo.findByCategory('security', { limit: 100 }).catch(() => []),
      supabase.from('organizations').select('id, name').order('name')
    ])

    return (
      <AuditLogsClient
        initialSystemLogs={systemLogs}
        initialUserLogs={userLogs}
        initialSecurityLogs={securityLogs}
        organizations={organizations || []}
      />
    )
  } catch (error) {
    throw error // This will be caught by the error boundary
  }
} 