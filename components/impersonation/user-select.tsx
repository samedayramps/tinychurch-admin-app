'use client'

import { useState, useEffect, useMemo } from 'react'
import { UserCog, StopCircle, ExternalLink } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { startImpersonation, stopImpersonation } from '@/lib/actions/impersonation'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types/auth'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/hooks/use-toast'
import { useTransition } from 'react'
import { useImpersonationStatus } from '@/lib/hooks/use-impersonation'
import { 
  emitImpersonationEvent, 
  IMPERSONATION_EVENT,
  type ImpersonationEventDetail 
} from '@/lib/events/impersonation'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface ImpersonationUserSelectProps {
  users: Profile[]
}

interface UserDetails extends Profile {
  organization?: {
    name: string
    id: string
  }
  role?: string
}

interface UserOption extends Profile {
  organization_members?: Array<{
    organizations: {
      id: string
      name: string
    }
    role: 'admin' | 'staff' | 'ministry_leader' | 'member' | 'visitor'
  }>
}

export function ImpersonationUserSelect({ users }: ImpersonationUserSelectProps) {
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const { isImpersonating, impersonatedUserId, refresh } = useImpersonationStatus()
  const [currentUserName, setCurrentUserName] = useState<string>('')
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Listen for impersonation events
  useEffect(() => {
    function handleImpersonationEvent(e: Event) {
      const event = e as CustomEvent<ImpersonationEventDetail>
      if (event.detail.type === 'stop') {
        setUserDetails(null)
        setCurrentUserName('')
        setSelectedUser('')
      }
    }

    window.addEventListener(IMPERSONATION_EVENT, handleImpersonationEvent)
    return () => window.removeEventListener(IMPERSONATION_EVENT, handleImpersonationEvent)
  }, [])

  // Fetch user details when impersonation changes
  useEffect(() => {
    async function fetchUserDetails() {
      if (!impersonatedUserId) {
        setUserDetails(null)
        setCurrentUserName('')
        return
      }

      try {
        const response = await fetch(`/api/users/${impersonatedUserId}`)
        const data = await response.json()
        setUserDetails(data)
        setCurrentUserName(data.full_name || data.email)
      } catch (error) {
        console.error('Failed to fetch user details:', error)
      }
    }
    
    fetchUserDetails()
  }, [impersonatedUserId])

  const safeUsers = useMemo(() => {
    return Array.isArray(users) ? users : []
  }, [users])

  const filteredUsers = useMemo(() => {
    if (!search) return safeUsers
    
    return safeUsers.filter((user) => {
      const searchTerms = [
        user.full_name || '',
        user.email || '',
        user.organization_members?.[0]?.organizations?.name || '',
        user.organization_members?.[0]?.role || '',
      ].join(' ').toLowerCase()
      
      return searchTerms.includes(search.toLowerCase())
    })
  }, [safeUsers, search])

  const handleSelect = async (userId: string) => {
    try {
      setIsLoading(true)
      setSelectedUser(userId)
      
      // Fetch user details immediately
      const userResponse = await fetch(`/api/users/${userId}`)
      const userData = await userResponse.json()
      
      const result = await startImpersonation(userId)
      
      if ('error' in result) {
        throw new Error(result.error)
      }

      // Update local state first
      setUserDetails(userData)
      setCurrentUserName(userData.full_name || userData.email)
      
      // Emit event
      emitImpersonationEvent({ type: 'start', userId: result.userId })
      
      toast({
        title: "Impersonation started",
        description: "You are now impersonating another user",
      })

      // Force refresh context and routes
      await refresh()
      router.refresh()
    } catch (error) {
      console.error('Failed to start impersonation:', error)
      // Reset state on error
      setUserDetails(null)
      setCurrentUserName('')
      setSelectedUser('')
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start impersonation",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = async () => {
    try {
      setIsLoading(true)
      
      // Clear state first
      setUserDetails(null)
      setCurrentUserName('')
      setSelectedUser('')
      
      // Emit event
      emitImpersonationEvent({ type: 'stop' })
      
      const result = await stopImpersonation()
      
      if ('error' in result) {
        throw new Error(result.error)
      }

      toast({
        title: "Impersonation stopped",
        description: "You are no longer impersonating another user",
      })
      
      // Force refresh context and routes
      await refresh()
      router.refresh()
      router.push('/superadmin/dashboard')
    } catch (error) {
      console.error('Error stopping impersonation:', error)
      
      // Revert state on error
      await refresh()
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 px-4 py-3">
      <div className="flex items-center gap-2">
        <UserCog className="h-4 w-4" />
        <Label>
          {isImpersonating ? "Impersonating" : "Impersonate User"}
        </Label>
      </div>

      {isImpersonating ? (
        <>
          <div className="space-y-2">
            {/* User Info */}
            <div className="space-y-1">
              <a
                href={`/superadmin/users/${impersonatedUserId}`}
                className="font-medium hover:text-foreground inline-flex items-center gap-1 group"
              >
                {currentUserName || <Skeleton className="h-4 w-24" />}
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              {userDetails && (
                <div className="space-y-0.5">
                  <div className="text-xs text-muted-foreground">
                    {userDetails.email}
                  </div>
                  {userDetails.organization && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>{userDetails.organization.name}</span>
                      {userDetails.role && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{userDetails.role}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stop Button */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full border-red-200 group",
                "text-red-600 hover:text-red-700 hover:bg-red-50",
                "animate-pulse"
              )}
              onClick={handleStop}
              disabled={isLoading || isPending}
            >
              <StopCircle className="mr-2 h-4 w-4" />
              <span className="font-medium">Stop</span>
            </Button>
          </div>
        </>
      ) : (
        <Select 
          value={selectedUser} 
          onValueChange={handleSelect}
          disabled={isLoading || isPending}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select user..." />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[300px]">
              {users.map((user) => {
                const org = user.organization_members?.[0]?.organizations
                const role = user.organization_members?.[0]?.role
                
                return (
                  <SelectItem 
                    key={user.id} 
                    value={user.id}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {user.full_name || user.email}
                      </span>
                      {(org || role) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {org && <span>{org.name}</span>}
                          {org && role && (
                            <span className="text-muted-foreground/50">•</span>
                          )}
                          {role && <span>{role}</span>}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                )
              })}
            </ScrollArea>
          </SelectContent>
        </Select>
      )}
    </div>
  )
} 