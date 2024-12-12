import { useQuery } from '@tanstack/react-query'
import type { AuthStatus } from '@/lib/types/auth'

export function useAuthStatus() {
  return useQuery<AuthStatus, Error>({
    queryKey: ['auth-status'],
    queryFn: async () => {
      const response = await fetch('/api/auth/status')
      if (!response.ok) {
        throw new Error('Failed to fetch auth status')
      }
      return response.json()
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false
  })
} 