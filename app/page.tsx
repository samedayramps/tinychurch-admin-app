import { getUserProfile } from '@/lib/dal'
import { redirect } from 'next/navigation'

export default async function Index() {
  const profile = await getUserProfile()
  
  // Redirect authenticated users based on their role
  if (profile) {
    if (profile.is_superadmin) {
      redirect('/superadmin/dashboard')
    } else {
      redirect('/dashboard')
    }
  }

  // Redirect unauthenticated users to sign in
  redirect('/sign-in')
}
