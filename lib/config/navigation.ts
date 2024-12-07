import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Settings,
  Shield,
  Activity
} from "lucide-react"

export const adminNavItems = [
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
        title: "Users",
        href: "/admin/users",
        icon: Users
      },
      {
        title: "Organizations",
        href: "/admin/organizations",
        icon: Building2
      }
    ]
  },
  {
    title: "System",
    items: [
      {
        title: "Access Control",
        href: "/admin/access",
        icon: Shield
      },
      {
        title: "Audit Logs",
        href: "/admin/audit",
        icon: Activity
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings
      }
    ]
  }
] 

export const superAdminNavItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/superadmin/dashboard",
        icon: LayoutDashboard
      }
    ]
  },
  {
    title: "Management",
    items: [
      {
        title: "Organizations",
        href: "/superadmin/organizations",
        icon: Building2
      },
      {
        title: "Users",
        href: "/superadmin/users",
        icon: Users
      }
    ]
  },
  {
    title: "System",
    items: [
      {
        title: "Access Control",
        href: "/superadmin/access",
        icon: Shield
      },
      {
        title: "Audit Logs",
        href: "/superadmin/audit",
        icon: Activity
      },
      {
        title: "Settings",
        href: "/superadmin/settings",
        icon: Settings
      }
    ]
  }
] 