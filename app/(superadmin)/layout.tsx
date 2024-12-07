import { SuperAdminSidebarNav } from "@/components/superadmin/sidebar-nav"
import { SuperAdminGuard } from "@/components/auth/superadmin-guard"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { getUserProfile } from '@/lib/dal'
import { redirect } from 'next/navigation'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()
  
  if (!profile?.is_superadmin) {
    redirect('/')
  }

  return (
    <SuperAdminGuard>
      <div className="flex min-h-screen flex-col md:flex-row">
        <SuperAdminSidebarNav profile={profile} />
        <div className="flex flex-1 flex-col min-h-screen md:min-h-0">
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Breadcrumbs />
          </div>
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SuperAdminGuard>
  )
} 
