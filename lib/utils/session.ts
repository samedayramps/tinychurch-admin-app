import { decode, JwtPayload } from 'jsonwebtoken'

interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

export async function decrypt(token: string | undefined): Promise<CustomJwtPayload | null> {
  if (!token) return null

  try {
    // Decode the token and assert its type
    const decoded = decode(token) as CustomJwtPayload
    return decoded
  } catch (error) {
    console.error('Failed to decrypt session:', error)
    return null
  }
}
