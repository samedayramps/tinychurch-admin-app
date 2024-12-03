import { ImpersonationUserSelect } from './impersonation/user-select'
import { useImpersonationStatus } from '@/lib/hooks/use-impersonation'
import type { Profile } from '@/lib/types/auth'
import { ImpersonationUserList } from './impersonation/user-list'

interface SidebarProps {
  profile: Profile
}

export function Sidebar({ profile }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r bg-background">
      {/* ... existing sidebar content ... */}
      
      {/* Add impersonation selector for superadmins */}
      {profile.is_superadmin && (
        <>
          <div className="h-px bg-border my-4" /> {/* Separator */}
          <ImpersonationUserList />
        </>
      )}
      
      {/* ... rest of sidebar content ... */}
    </aside>
  )
} 