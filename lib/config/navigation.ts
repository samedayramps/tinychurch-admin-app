import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Settings,
  Shield,
  Activity,
  Plus,
  Mail,
  FileText
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
    title: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/superadmin/dashboard",
        icon: LayoutDashboard
      },
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
    title: "Communication",
    items: [
      {
        title: "Messaging",
        href: "/superadmin/messaging",
        icon: Mail
      },
      {
        title: "Templates",
        href: "/superadmin/templates",
        icon: FileText
      }
    ]
  },
  {
    title: "Administration",
    items: [
      {
        title: "Onboard Tenant",
        href: "/superadmin/onboarding",
        icon: Plus
      },
      {
        title: "Audit Logs",
        href: "/superadmin/audit",
        icon: FileText
      },
      {
        title: "Settings",
        href: "/superadmin/settings",
        icon: Settings
      }
    ]
  }
] 