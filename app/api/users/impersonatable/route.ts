import { createClient } from '@/lib/utils/supabase/server'
import { NextResponse } from 'next/server'
import { log } from '@/lib/utils/logger'

export async function GET() {
  const requestId = crypto.randomUUID()
  
  try {
    const supabase = await createClient()

    // First verify the current user is a superadmin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      log.warn('No authenticated user found', { requestId })
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    // Verify superadmin status directly
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    log.info('Checking superadmin status', {
      requestId,
      userId: user.id,
      isSuperadmin: profile?.is_superadmin,
      profileError
    })

    if (profileError || !profile?.is_superadmin) {
      log.warn('User is not a superadmin', {
        requestId,
        userId: user.id,
        error: profileError
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Log the attempt
    log.info('Fetching impersonatable users', {
      requestId,
      userId: user.id
    })

    const { data, error } = await supabase
      .rpc('get_impersonatable_users')

    if (error) {
      log.error('Error fetching impersonatable users', {
        requestId,
        error,
        userId: user.id,
        errorDetails: {
          message: error.message,
          details: error.details,
          hint: error.hint
        }
      })
      return NextResponse.json(
        { error: 'Failed to fetch users' }, 
        { status: 500 }
      )
    }

    log.info('Successfully fetched impersonatable users', {
      requestId,
      userId: user.id,
      userCount: data?.length ?? 0,
      firstUser: data?.[0] ? {
        id: data[0].id,
        hasEmail: !!data[0].email,
        hasFullName: !!data[0].full_name,
        orgMembersCount: data[0].organization_members?.length ?? 0
      } : null
    })

    return NextResponse.json(data)
  } catch (error) {
    log.error('Impersonatable users error', {
      requestId,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : 'Unknown error'
    })
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 