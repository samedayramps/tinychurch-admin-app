'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/utils/supabase/client'
import { formatDate } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface UserActivityTabProps {
  userId: string
}

export function UserActivityTab({ userId }: UserActivityTabProps) {
  const [activities, setActivities] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadActivity() {
      const { data } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) {
        setActivities(data)
      }
    }

    loadActivity()
  }, [userId, supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
        <CardDescription>
          Recent user activity and system events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>{formatDate(activity.created_at)}</TableCell>
                <TableCell>{activity.event_type}</TableCell>
                <TableCell>{activity.details}</TableCell>
              </TableRow>
            ))}
            {activities.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No activity recorded
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 