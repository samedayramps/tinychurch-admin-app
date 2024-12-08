import { useCallback } from 'react'
import { useUser } from '@/lib/hooks/useUser'

export function usePermissions() {
  const { user } = useUser()

  const checkPermission = useCallback(async (
    action: string,
    resourceType: string,
    resourceId: string
  ) => {
    if (!user) return false
    
    // Client-side superadmin check
    if (user.is_superadmin) return true

    // Make API call to check other permissions
    const response = await fetch(`/api/permissions/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, resourceType, resourceId })
    })

    const { hasPermission } = await response.json()
    return hasPermission
  }, [user])

  return { checkPermission }
} 