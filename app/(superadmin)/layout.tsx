import { SuperAdminGuard } from '@/components/auth/superadmin-guard'
import { SuperAdminSidebar } from '@/components/superadmin/sidebar'
import { HeaderAuth } from '@/components/header-auth'
import { getUserProfile } from '@/lib/dal'
import { redirect } from 'next/navigation'

export default async function SuperAdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()
  
  if (!profile?.is_superadmin) {
    redirect('/')
  }

  return (
    <SuperAdminGuard>
      <div className="flex h-screen bg-background">
        <aside className="w-64 border-r bg-background">
          <SuperAdminSidebar profile={profile} />
        </aside>
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 h-16 border-b">
            <HeaderAuth profile={profile} membership={null} />
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SuperAdminGuard>
  )
} 