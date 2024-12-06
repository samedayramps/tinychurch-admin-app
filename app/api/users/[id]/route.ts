import { createClient } from '@/lib/utils/supabase/server'
import { type NextRequest } from 'next/server'
import type { Database } from '@/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

type ProfileWithOrg = Profile & {
  organization_members?: Array<{
    organizations: {
      id: string
      name: string
    },
    role: string
  }>
}

type UserDetails = Omit<Profile, 'organization_members'> & {
  organization?: {
    id: string
    name: string
  },
  role?: string
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const supabase = await createClient()
    const id = (await context.params).id
    
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
      .eq('id', id)
      .single()
      
    if (error) {
      console.error('Error fetching user:', error)
      return Response.json(
        { error: 'User not found' }, 
        { status: 404 }
      )
    }
    
    // Transform the data to a simpler structure
    const profileData = data as unknown as ProfileWithOrg
    const userDetails: UserDetails = {
      ...profileData,
      organization: profileData.organization_members?.[0]?.organizations,
      role: profileData.organization_members?.[0]?.role
    }
    
    return Response.json(userDetails)
  } catch (error) {
    console.error('Error in user route:', error)
    return Response.json(
      { error: 'Failed to fetch user' }, 
      { status: 500 }
    )
  }
} 