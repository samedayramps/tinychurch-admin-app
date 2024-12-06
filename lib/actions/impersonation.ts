'use server'

import { ImpersonationService } from '@/lib/services/impersonation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/utils/supabase/server'
import { handleImpersonationError } from '@/lib/utils/error-handling'

export async function startImpersonation(targetUserId: string) {
  try {
    const supabase = await createClient(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Authentication required')
    }

    const service = await ImpersonationService.create()
    const result = await service.startImpersonation(user.id, targetUserId)

    // Revalidate all affected paths
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
    revalidatePath('/api/auth/impersonation-status')
    revalidatePath('/superadmin/dashboard')

    return result
  } catch (error) {
    return handleImpersonationError(error, 'start-impersonation')
  }
}

export async function stopImpersonation() {
  try {
    const supabase = await createClient(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Authentication required')
    }

    const service = await ImpersonationService.create()
    
    // Get current impersonation status to get the target user ID
    const status = await service.getStatus(user.id)
    if (!status.impersonatingId) {
      throw new Error('No active impersonation session')
    }

    const result = await service.stopImpersonation(user.id, status.impersonatingId)

    // Revalidate all affected paths
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
    revalidatePath('/api/auth/impersonation-status')
    revalidatePath('/superadmin/dashboard')

    return result
  } catch (error) {
    return handleImpersonationError(error, 'stop-impersonation')
  }
} 