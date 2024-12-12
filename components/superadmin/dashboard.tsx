'use client'

import { useAuthStatus } from '@/lib/hooks/use-auth-status'

export function SuperAdminDashboard() {
  const { data: authStatus, isLoading } = useAuthStatus()

  if (isLoading) {
    return <div>Loading...</div>
  }

  const { 
    user = null, 
  } = authStatus || {}

  return (
    <div>
      <div className="grid gap-6">
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <pre className="text-sm">
            {JSON.stringify({ user }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
} 