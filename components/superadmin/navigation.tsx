import { Building2, Users, Plus, Mail } from 'lucide-react'

export const superadminNavItems = [
  {
    title: "Dashboard",
    href: "/superadmin/dashboard",
    icon: Building2
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
  },
  {
    title: "Messaging",
    href: "/superadmin/messaging",
    icon: Mail
  },
  {
    title: "Onboard Tenant",
    href: "/superadmin/onboarding",
    icon: Plus
  }
  // ... other navigation items
] 