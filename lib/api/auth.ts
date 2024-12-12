import { createClient } from '@/lib/utils/supabase/server'
import type { User } from '@supabase/supabase-js'

export async function getAuthStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
    }
  }

  return {
    user,
  }
}