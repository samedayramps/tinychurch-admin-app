import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' })
  }

  const headersList = await headers()
  const relevantHeaders = {
  }

  return NextResponse.json(relevantHeaders)
} 