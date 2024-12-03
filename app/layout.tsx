import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { ImpersonationProvider } from '@/lib/contexts/impersonation-context'
import { ImpersonationBorder } from '@/components/impersonation/border'

export const metadata = {
  title: 'TinyChurch Admin',
  description: 'Church Management System',
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
          <ImpersonationProvider>
            <ImpersonationBorder />
            <main className="min-h-screen">
              {children}
            </main>
          </ImpersonationProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
