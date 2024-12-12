import { redirect } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/server'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading'

export const dynamic = 'force-dynamic'

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()
    
  return { user, profile }
}

// Convert to React component that returns JSX
async function AuthenticatedRoute() {
  const auth = await getAuthenticatedUser()

  if (!auth) {
    redirect('/sign-in')
  }

  if (auth.profile?.is_superadmin) {
    redirect('/superadmin/dashboard')
  }

  redirect('/dashboard')
  
  // This is now a valid React component return
  return <></>
}

export default async function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AuthenticatedRoute />
    </Suspense>
  )
}
