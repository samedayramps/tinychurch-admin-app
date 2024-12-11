import { getUserProfile } from '@/lib/dal'
import { redirect } from 'next/navigation'

export default async function Index() {
  try {
    const profile = await getUserProfile()
    
    if (!profile) {
      redirect('/sign-in')
    }

    if (profile.is_superadmin) {
      redirect('/superadmin/dashboard')
    } else {
      redirect('/dashboard')
    }
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('NEXT_REDIRECT')) {
      console.error('Error fetching user profile:', error)
      redirect('/error')
    }
    throw error
  }
}
