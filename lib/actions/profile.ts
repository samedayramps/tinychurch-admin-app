'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/dal'

export async function updateProfile(formData: FormData): Promise<{ error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: 'Unauthorized' }
    
    const supabase = await createClient()
    
    // Get current organization context for audit log
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()
    
    // Prepare profile updates
    const updates = {
      ...Object.fromEntries(
        Object.entries({
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          email: formData.get('email'),
          alternative_email: formData.get('alternative_email'),
          phone: formData.get('phone'),
          language: formData.get('language'),
          theme: formData.get('theme'),
          avatar_url: formData.get('avatar_url'),
          notification_preferences: formData.get('notification_preferences') 
            ? JSON.parse(formData.get('notification_preferences') as string)
            : undefined
        }).filter(([_, value]) => value !== null)
      ),
      updated_at: new Date().toISOString()
    }

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      
    if (error) return { error: error.message }
    
    
    revalidatePath('/settings/profile')
    return {}
  } catch (error) {
    console.error('Profile update error:', error)
    return { error: 'Failed to update profile' }
  }
} 