import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

interface ImpersonationStatus {
  isImpersonating: boolean
  impersonatingId: string | null
  realUserId: string | null
}

export function useImpersonationStatus() {
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const supabase = useRef(createClient())
  const lastCheck = useRef<number>(0)
  const MIN_CHECK_INTERVAL = 5000 // 5 seconds
  
  // Rest of the implementation...
} 