import { NextRequest } from 'next/server'

export function validateRequiredHeaders(
  req: NextRequest,
  headers: string[],
  middlewareName: string
): boolean {
  const missing = headers.filter(header => !req.headers.get(header))
  
  if (missing.length > 0) {
    console.error(`${middlewareName}: Missing required headers`, missing)
    return false
  }
  
  return true
} 