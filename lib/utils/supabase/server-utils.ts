import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerUtils(useAdmin = false) {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = useAdmin 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY! 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set(name, value, options)
        },
        remove(name, options) {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )
} 