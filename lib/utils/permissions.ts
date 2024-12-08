import { createClient } from './supabase/server'

export async function checkPermission(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string
) {
  const supabase = await createClient()

  // First check if user is superadmin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', userId)
    .single()

  // Superadmins always have permission
  if (profile?.is_superadmin) {
    return true
  }

  // Add your regular permission checks here
  // For example, checking if user is group leader:
  if (resourceType === 'group') {
    const { data: membership } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', resourceId)
      .eq('user_id', userId)
      .eq('role', 'leader')
      .single()

    return !!membership
  }

  return false
} 