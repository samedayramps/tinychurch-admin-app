import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuditLogs } from '@/lib/dal/audit'
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/database.types'

type AuditLog = Database['public']['Tables']['audit_logs']['Row']

export async function RecentActivity() {
  const logs = await getAuditLogs(5)
  
  if (!logs) return null
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log: AuditLog) => (
            <div key={log.id} className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{log.description}</p>
                <p className="text-sm text-muted-foreground">
                  {log.category} • {log.action}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(log.created_at!), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 