'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/dal'
import { OrganizationSettingsRepository } from '@/lib/dal/repositories/organization-settings'

export async function updateOrganizationSettings(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  
  const supabase = await createClient()
  const settingsRepo = new OrganizationSettingsRepository(supabase)
  
  // Verify user has permission
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .single()
    
  if (!membership || membership.role !== 'admin') {
    throw new Error('Insufficient permissions')
  }
  
  const organizationId = formData.get('id') as string
  const settings = JSON.parse(formData.get('settings') as string)
  
  await settingsRepo.setSettings(organizationId, settings)
  
  revalidatePath('/organization')
} 