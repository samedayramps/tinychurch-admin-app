import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/dal'

export const metadata = {
  title: {
    default: 'Superadmin Dashboard',
    template: '%s - Superadmin Dashboard'
  },
  description: 'Superadmin dashboard for managing organizations and users'
}

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  if (!profile?.is_superadmin) {
    redirect('/')
  }

  return <>{children}</>
} 