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
  
  // Check if user is superadmin first
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) {
    // If not superadmin, check for org admin role
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .single()
      
    if (!membership || membership.role !== 'admin') {
      throw new Error('Insufficient permissions')
    }
  }
  
  const organizationId = formData.get('id') as string
  const settings = JSON.parse(formData.get('settings') as string)
  const address = formData.get('address')
  
  // Update organization settings
  await settingsRepo.setSettings(organizationId, settings)
  
  // Update organization address if provided
  if (address) {
    try {
      const addressData = typeof address === 'string' ? JSON.parse(address) : address
      const { error: addressError } = await supabase
        .from('organizations')
        .update({
          address: addressData,
          updated_at: new Date().toISOString()
        })
        .eq('id', organizationId)

      if (addressError) throw addressError
    } catch (error) {
      console.error('Error updating address:', error)
      throw new Error('Failed to update organization address')
    }
  }
  
  revalidatePath('/organization')
  revalidatePath(`/superadmin/organizations/${organizationId}`)
} 