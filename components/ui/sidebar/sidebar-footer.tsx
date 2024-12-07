import { ThemeSwitcher } from "@/components/theme-switcher"
import { HeaderAuth } from "@/components/header-auth"
import { Separator } from "@/components/ui/separator"
import type { Profile, OrganizationMember } from "@/lib/types/auth"
import { cn } from "@/lib/utils/cn"

interface SidebarFooterProps {
  profile: Profile
  membership?: OrganizationMember | null
  isCollapsed?: boolean
}

export function SidebarFooter({ 
  profile, 
  membership = null, 
  isCollapsed 
}: SidebarFooterProps) {
  return (
    <div className="mt-auto pt-4 sticky bottom-0 bg-background/60 backdrop-blur-sm">
      <Separator className="mb-4" />
      <div className={cn(
        "px-2 flex gap-2",
        isCollapsed 
          ? "flex-col items-center" 
          : "items-center justify-between flex-wrap"
      )}>
        <ThemeSwitcher />
        <HeaderAuth profile={profile} membership={membership} />
      </div>
    </div>
  )
} 