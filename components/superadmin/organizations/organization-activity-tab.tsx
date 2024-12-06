'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useToast } from '@/lib/hooks/use-toast'

interface ActivityLog {
  id: string
  organization_id: string
  action: string
  actor: string
  timestamp: string
  details?: Record<string, any>
}

interface ApiResponse {
  error?: string
  data?: ActivityLog[]
}

interface OrganizationActivityTabProps {
  organizationId: string
}

export function OrganizationActivityTab({ organizationId }: OrganizationActivityTabProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadActivity() {
      try {
        const response = await fetch(`/api/organizations/${organizationId}/activity`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Check if the response is an error
        if ('error' in data) {
          throw new Error(data.error)
        }
        
        // Validate that data is an array
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format')
        }

        // Type guard to validate activity log structure
        const isValidActivityLog = (item: any): item is ActivityLog => {
          return (
            typeof item === 'object' &&
            item !== null &&
            typeof item.id === 'string' &&
            typeof item.action === 'string' &&
            typeof item.actor === 'string' &&
            typeof item.timestamp === 'string'
          )
        }

        // Filter out any invalid activity logs
        const validActivities = data.filter(isValidActivityLog)
        setActivities(validActivities)
      } catch (error) {
        console.error('Failed to load activity:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load activity log',
          variant: 'destructive',
        })
        setActivities([]) // Reset to empty array on error
      } finally {
        setLoading(false)
      }
    }

    loadActivity()
  }, [organizationId, toast])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Loading activity...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              {/* You could add a loading spinner here */}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Recent activity in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.actor}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
                <Badge variant="outline">
                  {activity.details?.type || 'System'}
                </Badge>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center text-muted-foreground">
                No recent activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 