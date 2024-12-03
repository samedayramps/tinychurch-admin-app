import { HeaderAuth } from '@/components/header-auth'
import { ThemeSwitcher } from '@/components/theme-switcher'
import Link from 'next/link'
import { getUserProfile, getOrganizationMembership } from '@/lib/dal'

export default async function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, membership] = await Promise.all([
    getUserProfile(),
    getOrganizationMembership()
  ])

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href="/">TinyChurch Admin</Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <HeaderAuth profile={profile} membership={membership} />
          </div>
        </div>
      </nav>
      <div className="flex-1 container mx-auto py-6">
        {children}
      </div>
      <footer className="w-full border-t border-t-foreground/10 py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} TinyChurch. All rights reserved.</p>
      </footer>
    </main>
  )
} 