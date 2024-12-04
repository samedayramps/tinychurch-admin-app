import { getSuperAdminStatus } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const isSuperAdmin = await getSuperAdminStatus()
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabase = await createClient()
    // Your API logic here
    
    return NextResponse.json({ data: 'your data' })
  } catch (error) {
    console.error('Superadmin API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
} 