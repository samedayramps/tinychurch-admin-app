'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserTable } from './users/user-table'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export function UserManagement() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button 
          onClick={() => router.push('/superadmin/users/invite')}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>
      
      <UserTable setIsLoading={setIsLoading} />
    </div>
  )
} 