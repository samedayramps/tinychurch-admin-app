'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getUserProfile } from '@/lib/dal/auth'
import { redirect } from 'next/navigation'

export async function startImpersonation(userId: string) {
  const profile = await getUserProfile()
  if (!profile?.is_superadmin) {
    throw new Error('Unauthorized')
  }
  
  // Store the impersonation in a cookie
  cookies().set('impersonating_user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })
  
  // Log the impersonation event
  const supabase = await createClient()
  await supabase.from('audit_logs').insert({
    category: 'auth',
    action: 'impersonation_start',
    actor_id: profile.id,
    target_id: userId,
    description: `Superadmin ${profile.email} started impersonating user ${userId}`,
    severity: 'notice'
  })
  
  redirect('/dashboard')
}

export async function stopImpersonation() {
  const cookieStore = cookies()
  const impersonatingId = cookieStore.get('impersonating_user_id')?.value
  
  if (impersonatingId) {
    cookieStore.delete('impersonating_user_id')
    
    // Log the end of impersonation
    const profile = await getUserProfile()
    const supabase = await createClient()
    await supabase.from('audit_logs').insert({
      category: 'auth',
      action: 'impersonation_end',
      actor_id: profile?.id,
      target_id: impersonatingId,
      description: `Superadmin ${profile?.email} stopped impersonating user ${impersonatingId}`,
      severity: 'notice'
    })
  }
  
  redirect('/superadmin')
} 