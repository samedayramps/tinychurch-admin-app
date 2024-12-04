import { getSuperAdminStatus } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const isSuperAdmin = await getSuperAdminStatus()
    return NextResponse.json({ isSuperAdmin })
  } catch (error) {
    console.error('Error checking superadmin status:', error)
    return NextResponse.json({ isSuperAdmin: false })
  }
} 