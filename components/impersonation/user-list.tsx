'use client'

import { useEffect, useState } from 'react'
import { ImpersonationUserSelect } from './user-select'
import type { Profile } from '@/lib/types/auth'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function ImpersonationUserList() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)
        const response = await fetch('/api/users/impersonatable')
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to fetch users')
        }
        const data = await response.json()
        setUsers(data || [])
      } catch (error) {
        console.error('Failed to fetch users:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch users')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [])
  
  if (loading) {
    return (
      <div className="px-4 py-3">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  
  if (!users.length) {
    return (
      <div className="px-4 py-3 text-sm text-muted-foreground">
        No users available for impersonation
      </div>
    )
  }
  
  return <ImpersonationUserSelect users={users} />
} 