import { NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  return NextResponse.redirect(new URL(
    profile?.is_superadmin ? '/superadmin/dashboard' : '/dashboard',
    request.url
  ))
} 