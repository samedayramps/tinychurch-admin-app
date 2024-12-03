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
  ShieldIcon,
  ActivityIcon,
  SettingsIcon 
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { Profile } from '@/lib/types/auth'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/superadmin/dashboard',
    icon: HomeIcon
  },
  {
    title: 'Organizations',
    href: '/superadmin/organizations',
    icon: BuildingIcon
  },
  {
    title: 'Users',
    href: '/superadmin/users',
    icon: UsersIcon
  },
  {
    title: 'Access Control',
    href: '/superadmin/access',
    icon: ShieldIcon
  },
  {
    title: 'Audit Logs',
    href: '/superadmin/audit',
    icon: ActivityIcon
  },
  {
    title: 'System Settings',
    href: '/superadmin/settings',
    icon: SettingsIcon
  }
]

export function SuperAdminSidebar() {
  const pathname = usePathname()
  
  return (
    <SidebarProvider>
      <Sidebar className="border-0">
        <SidebarHeader className="px-6 py-4">
          <Link href="/superadmin/dashboard" className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Admin Console</h2>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  className="px-6"
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