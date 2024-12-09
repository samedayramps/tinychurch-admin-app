import { NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import { log } from '@/lib/utils/logger'

export async function GET(request: Request) {
  log.info('Received GET request for auth redirect', { url: request.url })

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    log.error('Error fetching user', { error })
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (!user) {
    log.warn('No user found, redirecting to sign-in')
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  log.info('User profile fetched', { profile })

  return NextResponse.redirect(new URL(
    profile?.is_superadmin ? '/superadmin/dashboard' : '/dashboard',
    request.url
  ))
} 