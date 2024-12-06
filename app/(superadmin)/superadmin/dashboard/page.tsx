import { createClient } from '@/lib/utils/supabase/server'
import { StatsDashboard } from '@/components/superadmin/stats-dashboard'

export default async function SuperAdminDashboardPage() {
  const supabase = await createClient()
  
  // Get some basic stats
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    
  const { count: orgCount } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{userCount}</p>
        </div>
        
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="font-semibold mb-2">Organizations</h3>
          <p className="text-3xl font-bold">{orgCount}</p>
        </div>
      </div>
      
      <StatsDashboard />
    </div>
  )
} 