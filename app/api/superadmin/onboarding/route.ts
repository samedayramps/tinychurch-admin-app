import { NextResponse } from 'next/server'
import { TenantOnboardingService } from '@/lib/services/tenant-onboarding'
import { requireSuperAdmin } from '@/lib/auth/permissions'
import { AuthApiError } from '@supabase/supabase-js'
import { createClient } from '@/lib/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient(true)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    await requireSuperAdmin()
    const data = await request.json()
    const service = await TenantOnboardingService.create()
    const result = await service.onboardNewTenant(data, user.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Tenant onboarding error:', error)
    
    if (error instanceof AuthApiError) {
      if (error.status === 429) {
        return NextResponse.json(
          { message: 'Rate limit exceeded. Please try again in a few minutes.' },
          { status: 429 }
        )
      }
    }
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 