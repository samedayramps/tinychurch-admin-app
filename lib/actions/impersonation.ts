'use server'

import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/dal/auth'
import { 
  verifyImpersonationPermissions, 
  logImpersonationEvent 
} from '@/lib/dal/impersonation'
import { redirect } from 'next/navigation'

export async function startImpersonation(userId: string) {
  const profile = await getCurrentUser()
  if (!profile?.id || !profile?.email) {
    throw new Error('Unauthorized')
  }
  
  const hasPermission = await verifyImpersonationPermissions(profile.id)
  if (!hasPermission) {
    throw new Error('Unauthorized')
  }
  
  // Store the impersonation in a cookie
  const cookieStore = await cookies()
  cookieStore.set('impersonating_user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })
  
  // Log the impersonation event
  await logImpersonationEvent({
    action: 'impersonation_start',
    actorId: profile.id,
    actorEmail: profile.email,
    targetId: userId
  })
  
  redirect('/dashboard')
}

export async function stopImpersonation() {
  const cookieStore = await cookies()
  const impersonatingId = cookieStore.get('impersonating_user_id')?.value
  
  if (impersonatingId) {
    cookieStore.delete('impersonating_user_id')
    
    // Log the end of impersonation
    const profile = await getCurrentUser()
    if (profile?.id && profile?.email) {
      await logImpersonationEvent({
        action: 'impersonation_end',
        actorId: profile.id,
        actorEmail: profile.email,
        targetId: impersonatingId
      })
    }
  }
  
  redirect('/superadmin')
} 