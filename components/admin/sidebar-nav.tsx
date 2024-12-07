'use client'

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/ui/sidebar/sidebar"
import { SidebarItem } from "@/components/ui/sidebar/sidebar-item"
import { SidebarSection } from "@/components/ui/sidebar/sidebar-section"
import { SidebarFooter } from "@/components/ui/sidebar/sidebar-footer"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Organization, Profile, OrganizationMember } from "@/lib/types/auth"
import { adminNavItems } from "@/lib/config/navigation"

interface AdminSidebarNavProps {
  organization: Organization
  profile: Profile
  membership: OrganizationMember
}

export function AdminSidebarNav({ organization, profile, membership }: AdminSidebarNavProps) {
  const pathname = usePathname()

  return (
    <Sidebar defaultCollapsed={false}>
      <div className="flex h-full flex-col">
        <div className="flex h-[60px] items-center px-4">
          <h2 className="text-lg font-semibold">{organization.name}</h2>
        </div>
        
        <ScrollArea className="flex-1 px-4">
          {adminNavItems.map((section) => (
            <SidebarSection
              key={section.title}
              title={section.title}
              className="mb-4"
            >
              {section.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  isActive={pathname === item.href}
                />
              ))}
            </SidebarSection>
          ))}
        </ScrollArea>
        
        <SidebarFooter 
          profile={profile} 
          membership={membership} 
        />
      </div>
    </Sidebar>
  )
} 