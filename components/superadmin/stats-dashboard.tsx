import { requireSuperAdmin } from '@/lib/auth/permissions'

export async function StatsDashboard() {
  // This will throw an error if not superadmin
  const profile = await requireSuperAdmin()
  
  return (
    <div>
      <h2>Admin Stats</h2>
      {/* Your component content */}
    </div>
  )
} 