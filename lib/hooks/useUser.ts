'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/utils/supabase/client'
import type { Profile } from '@/lib/types/auth'

interface UserState {
  user: Profile | null
  loading: boolean
  error: Error | null
}

export function useUser() {
  const [state, setState] = useState<UserState>({
    user: null,
    loading: true,
    error: null
  })

  const supabase = createClient()

  const fetchUser = useCallback(async () => {
    try {
      // Get auth user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        setState({ user: null, loading: false, error: null })
        return
      }

      // Get profile with superadmin status
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          *,
          organization_members(
            role,
            organizations(
              id,
              name
            )
          )
        `)
        .eq('id', authUser.id)
        .single()

      setState({ 
        user: profile as Profile,
        loading: false,
        error: null 
      })
    } catch (error) {
      setState({ 
        user: null, 
        loading: false, 
        error: error instanceof Error ? error : new Error('Failed to fetch user') 
      })
    }
  }, [supabase])

  useEffect(() => {
    fetchUser()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUser, supabase.auth])

  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }))
    fetchUser()
  }, [fetchUser])

  return {
    ...state,
    refresh
  }
} 