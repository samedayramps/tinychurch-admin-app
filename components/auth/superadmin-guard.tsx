import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/dal'
import type { Profile } from '@/lib/types/auth'

interface SuperAdminGuardProps {
  children: React.ReactNode
}

export async function SuperAdminGuard({ children }: SuperAdminGuardProps) {
  const profile = await getUserProfile()
  
  if (!profile?.is_superadmin) {
    redirect('/')
  }
  
  return <>{children}</>
} 