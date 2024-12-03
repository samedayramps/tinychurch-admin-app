'use client'

import { 
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar'
import { 
  HomeIcon, 
  UsersIcon, 
  BuildingIcon,
  SettingsIcon 
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { Profile } from '@/lib/types/auth'
import type { Organization } from '@/lib/types/auth'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon
  },
  {
    title: 'Members',
    href: '/members',
    icon: UsersIcon
  },
  {
    title: 'Organization',
    href: '/organization',
    icon: BuildingIcon
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: SettingsIcon
  }
]

interface AdminSidebarProps {
  user: Profile
  organization: Organization
}

export function AdminSidebar({ user, organization }: AdminSidebarProps) {
  const pathname = usePathname()
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h2 className="text-lg font-bold">{organization.name}</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                >
                  <Link href={item.href}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
} 