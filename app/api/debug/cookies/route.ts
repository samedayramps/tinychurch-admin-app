import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' })
  }

  return NextResponse.json({ message: 'No cookies available' })
} 