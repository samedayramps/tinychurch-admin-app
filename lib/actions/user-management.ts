'use server'

import { createServerUtils } from '@/lib/utils/supabase/server-utils'

export async function resendInvitation(userId: string) {
  const supabase = await createServerUtils(true)
  
  // Get user details
  const { data: user } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()
    
  if (!user) throw new Error('User not found')
  
  // Use Supabase's built-in reinvite
  const { error } = await supabase.auth.admin.inviteUserByEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
  })
  
  if (error) throw error
  
  // Update invited_at timestamp
  await supabase
    .from('profiles')
    .update({
      invited_at: new Date().toISOString(),
      status: 'invited'
    })
    .eq('id', userId)
}

export async function suspendUser(userId: string) {
  const supabase = await createServerUtils(true)
  
  // First suspend the auth user
  const { error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    { ban_duration: '87600h' } // 10 years
  )
  
  if (authError) throw authError
  
  // Then update profile status
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      status: 'suspended',
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    
  if (profileError) throw profileError
}

export async function reactivateUser(userId: string) {
  const supabase = await createServerUtils(true)
  
  // First unban the auth user
  const { error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    { ban_duration: '0' }
  )
  
  if (authError) throw authError
  
  // Then update profile status
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      status: 'active',
      is_active: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    
  if (profileError) throw profileError
} 