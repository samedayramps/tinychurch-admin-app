import { Sidebar } from "@/components/ui/sidebar/sidebar"
import { SidebarItem } from "@/components/ui/sidebar/sidebar-item"
import { SidebarSection } from "@/components/ui/sidebar/sidebar-section"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname } from "next/navigation"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { 
  LayoutDashboard,
  Users,
  Building2,
  Settings
} from "lucide-react"
import type { Organization, Profile } from "@/lib/types/auth"

const menuItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard
      }
    ]
  },
  {
    title: "Management",
    items: [
      {
        title: "Members",
        href: "/members",
        icon: Users
      },
      {
        title: "Organization",
        href: "/organization",
        icon: Building2
      }
    ]
  },
  {
    title: "Settings",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings
      }
    ]
  }
]

interface AdminLayoutProps {
  children: React.ReactNode
  user: Profile
  organization: Organization
}

export default function AdminLayout({ children, user, organization }: AdminLayoutProps) {
  const pathname = usePathname()

  return (
    <AdminGuard>
      <div className="flex h-screen">
        <Sidebar defaultCollapsed={false}>
          <div className="flex h-full flex-col gap-4">
            <div className="flex h-[60px] items-center px-4">
              <h2 className="text-lg font-semibold">{organization.name}</h2>
            </div>
            <ScrollArea className="flex-1">
              {menuItems.map((section) => (
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
          </div>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <Breadcrumbs />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  )
} 