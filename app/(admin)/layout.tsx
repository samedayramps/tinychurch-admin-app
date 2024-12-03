import { AdminSidebar } from '@/components/admin/sidebar'
import { getUserProfile, getOrganizationMembership } from '@/lib/dal'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [profile, membership] = await Promise.all([
    getUserProfile(),
    getOrganizationMembership()
  ])

  if (!profile || !membership || !['admin', 'staff'].includes(membership.role)) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar user={profile} organization={membership.organizations} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
} 