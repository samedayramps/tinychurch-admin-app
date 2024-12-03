import { Card, CardContent } from '@/components/ui/card'
import { UsersIcon, HomeIcon, CalendarIcon, UserCheckIcon } from 'lucide-react'

type Stats = {
  totalMembers: number
  totalMinistries: number
  totalEvents: number
  totalAttendance: number
} | null

interface DashboardMetricsProps {
  stats: Stats
}

export function DashboardMetrics({ stats }: DashboardMetricsProps) {
  if (!stats) return null
  
  const metrics = [
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: UsersIcon
    },
    {
      title: 'Ministries',
      value: stats.totalMinistries,
      icon: HomeIcon
    },
    {
      title: 'Events',
      value: stats.totalEvents,
      icon: CalendarIcon
    },
    {
      title: 'Total Attendance',
      value: stats.totalAttendance,
      icon: UserCheckIcon
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <metric.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 