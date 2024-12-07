'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { Profile } from '@/lib/types/auth'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  // Add your authentication logic here
  return <>{children}</>
} 