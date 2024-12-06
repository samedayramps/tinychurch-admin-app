export function handleImpersonationError(error: unknown, context: string) {
  console.error(`Impersonation error (${context}):`, error)
  const message = error instanceof Error ? error.message : 'An error occurred'
  return { error: message }
} 