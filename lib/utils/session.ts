import { User } from '@supabase/supabase-js'

interface SessionPayload {
  userId: string;
  user?: User;
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null

  try {
    // With Supabase, we don't need to manually decode tokens
    // Instead, we should use the built-in auth methods
    return {
      userId: token, // If you need the token ID directly
    }
  } catch (error) {
    console.error('Failed to decrypt session:', error)
    return null
  }
}
