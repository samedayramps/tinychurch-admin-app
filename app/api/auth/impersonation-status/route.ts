import { ImpersonationService } from '@/lib/services/impersonation'
import { createClient } from '@/lib/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({
      isImpersonating: false,
      impersonatingId: null,
      realUserId: null
    })
  }
  
  const service = await ImpersonationService.create()
  const status = await service.getStatus(user.id)
  
  return Response.json(status)
} 