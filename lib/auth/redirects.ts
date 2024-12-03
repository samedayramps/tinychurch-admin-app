export const getRedirectPath = async (profile: any, isAuthenticated: boolean) => {
  if (!isAuthenticated) {
    return '/sign-in'
  }
  
  if (profile?.is_superadmin) {
    return '/superadmin/dashboard'
  }
  
  return '/dashboard'
}

export const getErrorRedirect = (error: string, returnTo?: string) => {
  const base = returnTo ? `/error?returnTo=${returnTo}` : '/error'
  return `${base}?message=${encodeURIComponent(error)}`
} 