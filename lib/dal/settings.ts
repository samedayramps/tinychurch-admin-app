import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export const getOrganizationSettings = cache(async (organizationId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('settings')
    .eq('id', organizationId)
    .single()
    
  if (error) return null
  return data?.settings
})

export const getFeatureFlags = cache(async (organizationId: string) => {
  const settings = await getOrganizationSettings(organizationId)
  return settings?.features_enabled || {}
}) 