'use client'

import { ThemeSwitcher } from "@/components/theme-switcher"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AuthHeader() {
  const pathname = usePathname()
  
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center">
          <Link href="/" className="font-semibold">
            TinyChurch Admin
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          {pathname !== '/sign-in' && (
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
          {pathname !== '/sign-up' && (
            <Button variant="default" asChild>
              <Link href="/sign-up">Sign up</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
} 