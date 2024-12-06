import { createClient } from '@/lib/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      organization_members!inner (
        role,
        organizations (
          id,
          name
        )
      )
    `)
    .order('full_name')
  
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  return NextResponse.json(data)
} 