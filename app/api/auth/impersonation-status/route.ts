import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return Response.json({
      isImpersonating: false,
      impersonatingId: null,
      realUserId: null
    })
  }
  
  const impersonationData = user.app_metadata?.impersonation
  const cookieStore = await cookies()
  const impersonatingId = cookieStore.get('impersonating_user_id')?.value
  
  // Only consider impersonation active if both metadata and cookie exist
  const isActive = !!impersonationData && !!impersonatingId
  
  // Force revalidation of layout
  revalidatePath('/', 'layout')
  
  return Response.json({
    isImpersonating: isActive,
    impersonatingId: isActive ? impersonationData?.impersonating : null,
    realUserId: isActive ? impersonationData?.original_user : null
  })
} 