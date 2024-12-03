import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export const getFamilyRelationships = cache(async (familyId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('family_relationships')
    .select(`
      *,
      person_one:person_one_id (*),
      person_two:person_two_id (*),
      relationship_type (*)
    `)
    .eq('family_id', familyId)
    
  if (error) return null
  return data
})

export const getPersonRelationships = cache(async (personId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('family_relationships')
    .select(`
      *,
      person_one:person_one_id (*),
      person_two:person_two_id (*),
      relationship_type (*)
    `)
    .or(`person_one_id.eq.${personId},person_two_id.eq.${personId}`)
    
  if (error) return null
  return data
}) 