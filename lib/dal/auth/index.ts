import { cache } from 'react'
import { createClient } from '@/lib/utils/supabase/server'
import { ProfileDTO } from '../dto'
import type { Database } from '@/database.types'
import { DalError } from '../errors'

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  return profile ? ProfileDTO.fromRow(profile) : null
})

export const requireAuth = cache(async () => {
  const user = await getCurrentUser()
  if (!user) {
    throw new DalError('Authentication required', 'UNAUTHORIZED')
  }
  return user
})

export const requireSuperAdmin = cache(async () => {
  const user = await requireAuth()
  if (!user.isSuperAdmin) {
    throw DalError.unauthorized()
  }
  return user
}) 