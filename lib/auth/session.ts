import { createClient } from '@/lib/utils/supabase/server'

export async function getSession() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw error
  }
  
  if (!user) {
    throw new Error('No user found')
  }
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('No session found')
  }
  
  return session
} 