import { NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import { getCurrentUser } from '@/lib/dal'
import { GroupRepository } from '@/lib/dal/repositories/group'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    const resolvedParams = await params;
    const invitableMembers = await groupRepo.getInvitableMembers(
      resolvedParams.groupId,
      organizationId
    )

    // Add logging
    console.log('API returned invitable members:', invitableMembers?.length)

    return NextResponse.json({ data: invitableMembers })  // Wrap in data property
  } catch (error) {
    console.error('Error fetching invitable members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitable members' },
      { status: 500 }
    )
  }
}