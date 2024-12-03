'use client'

import { useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, User, Building2, Shield } from 'lucide-react'
import type { Profile, OrganizationMember } from '@/lib/types/auth'

interface HeaderAuthProps {
  profile: Profile | null
  membership: OrganizationMember | null
}

export function HeaderAuth({ profile, membership }: HeaderAuthProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.refresh()
  }, [supabase.auth, router])

  if (!profile) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.push('/sign-in')}>
          Sign in
        </Button>
        <Button variant="default" onClick={() => router.push('/sign-up')}>
          Sign up
        </Button>
      </div>
    )
  }

  const initials = profile.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || profile.email?.[0].toUpperCase() || '?'

  return (
    <div className="flex items-center gap-4">
      {/* Show impersonation banner if applicable */}
      {profile.impersonated && (
        <div className="text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
          Impersonating User
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {profile.avatar_url ? (
                <AvatarImage 
                  src={supabase.storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl} 
                  alt={profile.full_name || profile.email || ''} 
                />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile.full_name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {profile.email}
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Organization Context */}
          {membership && (
            <>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-medium leading-none text-muted-foreground">
                    Organization
                  </p>
                  <p className="text-sm leading-none">
                    {membership.organizations.name}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          
          {membership && (
            <DropdownMenuItem onClick={() => router.push(`/org/${membership.organizations.slug}/settings`)}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Organization Settings</span>
            </DropdownMenuItem>
          )}
          
          {/* Show superadmin link if applicable */}
          {profile.is_superadmin && (
            <DropdownMenuItem onClick={() => router.push('/superadmin')}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Console</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
