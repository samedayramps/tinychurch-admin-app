import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/providers/auth-provider'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { ImpersonationProvider } from '@/lib/contexts/impersonation-context'
import { ImpersonationBorder } from '@/components/impersonation/border'
import { AuthDebug } from '@/components/debug/auth-status'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tinychurch.app'),
  title: 'TinyChurch Admin',
  description: 'Administrative application for church management',
  openGraph: {
    title: 'TinyChurch Admin',
    description: 'Administrative application for church management',
  },
  twitter: {
    card: 'summary',
    title: 'TinyChurch Admin',
    description: 'Administrative application for church management',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ImpersonationProvider>
              <ImpersonationBorder />
              <main className="min-h-screen">
                {children}
              </main>
              <AuthDebug />
            </ImpersonationProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
