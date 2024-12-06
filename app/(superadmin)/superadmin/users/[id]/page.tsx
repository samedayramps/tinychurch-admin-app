import { createServerUtils } from '@/lib/utils/supabase/server-utils'
import { UserDashboard } from '@/components/superadmin/users/user-dashboard'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfileTab } from '@/components/superadmin/users/user-profile-tab'
import { UserOrganizationsTab } from '@/components/superadmin/users/user-organizations-tab'
import { UserActivityTab } from '@/components/superadmin/users/user-activity-tab'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserDashboardPage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createServerUtils()
  
  const { data: user } = await supabase
    .from('profiles')
    .select(`
      *,
      organization_members (
        role,
        organizations (id, name)
      )
    `)
    .eq('id', resolvedParams.id)
    .single()
    
  if (!user) {
    notFound()
  }

  const displayName = user.full_name || user.email

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{displayName}</h1>
          <p className="text-sm text-muted-foreground">
            User Management
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <UserDashboard user={user} />
        </TabsContent>

        <TabsContent value="profile">
          <UserProfileTab user={user} />
        </TabsContent>

        <TabsContent value="organizations">
          <UserOrganizationsTab user={user} />
        </TabsContent>

        <TabsContent value="activity">
          <UserActivityTab userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 