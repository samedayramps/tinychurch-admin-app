import { requireSuperAdmin } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireSuperAdmin()
    return <>{children}</>
  } catch (error) {
    redirect('/unauthorized')
  }
} 