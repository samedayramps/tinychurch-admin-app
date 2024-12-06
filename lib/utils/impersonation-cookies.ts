import { cookies } from 'next/headers'

const COOKIE_NAME = 'impersonating_user_id'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/'
}

export const ImpersonationCookies = {
  async set(userId: string) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, userId, COOKIE_OPTIONS)
  },

  async clear() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
  },

  async get(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get(COOKIE_NAME)?.value ?? null
  }
} 