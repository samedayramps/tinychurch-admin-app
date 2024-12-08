import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Database } from '@/database.types'

type InvitationWithDetails = Database['public']['Tables']['group_invitations']['Row'] & {
  groups: {
    name: string
  }
  organizations: {
    name: string
  }
}

interface InvitationPageProps {
  params: Promise<{
    token: string
  }>
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const resolvedParams = await params;
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // Get the invitation details with proper join syntax
  const { data: invitation } = await supabase
    .from('group_invitations')
    .select(`
      id,
      group_id,
      organization_id,
      groups:groups!inner (
        name
      ),
      organizations:organizations!inner (
        name
      )
    `)
    .eq('token', resolvedParams.token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single<InvitationWithDetails>()

  if (!invitation) {
    redirect('/error?message=Invalid or expired invitation')
  }

  return (
    <div className="max-w-lg mx-auto mt-16 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Group Invitation</h1>
      <p className="mb-4">
        You've been invited to join {invitation.groups.name} at {invitation.organizations.name}.
      </p>
      <form action={`/api/invitations/${resolvedParams.token}`} method="GET">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Accept Invitation
        </button>
      </form>
    </div>
  )
} 