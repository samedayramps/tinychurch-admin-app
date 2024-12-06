import { createClient } from '@/lib/utils/supabase/server'
import { OrganizationMemberRepository } from '@/lib/dal/repositories/organization-member'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const resolvedParams = await context.params
    const repository = new OrganizationMemberRepository(supabase)
    const members = await repository.findByOrganization(resolvedParams.id)

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching organization members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization members' },
      { status: 500 }
    )
  }
} 