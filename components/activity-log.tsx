'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

interface ActivityLogProps {
  logs: Array<{
    id: string
    details: string
    event_type: string
    created_at: string
  }>
  title?: string
}

export function ActivityLog({ logs, title = 'Recent Activity' }: ActivityLogProps) {
  if (!logs?.length) return null
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{log.details}</p>
                <p className="text-sm text-muted-foreground">
                  {log.event_type}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 