import type { Profile } from '@/lib/types/auth'

interface SidebarProps {
  profile: Profile
}

export function Sidebar({ profile }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r bg-background">
      {/* ... existing sidebar content ... */}
      
      {/* ... rest of sidebar content ... */}
    </aside>
  )
} 