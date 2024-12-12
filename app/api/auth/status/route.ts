import { createClient } from '@/lib/utils/supabase/server'
import { NextResponse } from 'next/server'
import { log } from '@/lib/utils/logger'

export async function GET() {
  const requestId = crypto.randomUUID()
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({
        user: null,
      })
    }

    return NextResponse.json({
      user,
    })
    
  } catch (error) {
    console.error('Auth status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 