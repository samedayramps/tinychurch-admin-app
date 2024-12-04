import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/dal'

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