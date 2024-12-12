import { createClient } from '@/lib/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(null)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: orgMemberships } = await supabase
    .from('organization_members')
    .select('*, organizations(*)')
    .eq('user_id', user.id)

  return NextResponse.json({
    user,
    profile,
    orgMemberships
  })
} 