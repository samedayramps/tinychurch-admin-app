'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/dal'

export async function updateOrganizationSettings(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  
  const supabase = await createClient()
  
  // Verify user has permission
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .single()
    
  if (!membership || membership.role !== 'admin') {
    throw new Error('Insufficient permissions')
  }
  
  // Update organization
  const { error } = await supabase
    .from('organizations')
    .update({
      name: formData.get('name'),
      settings: JSON.parse(formData.get('settings') as string)
    })
    .eq('id', formData.get('id'))
    
  if (error) throw error
  
  revalidatePath('/organization')
} 