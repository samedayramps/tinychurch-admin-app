import { DashboardMetrics } from '@/components/admin/dashboard/metrics'
import { RecentActivity } from '@/components/admin/dashboard/recent-activity'
import { getOrganizationStats } from '@/lib/dal/repositories/organization'

export default async function DashboardPage() {
  const stats = await getOrganizationStats()
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <DashboardMetrics stats={stats} />
      <RecentActivity />
    </div>
  )
} 