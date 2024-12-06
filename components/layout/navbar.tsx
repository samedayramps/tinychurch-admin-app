import { cn } from '@/lib/utils/cn'
import { useImpersonationStatus } from '@/lib/hooks/use-impersonation'

export function Navbar() {
  const { isImpersonating } = useImpersonationStatus()
  
  return (
    <nav className={cn(
      "sticky top-0 z-40 border-b bg-background/95 backdrop-blur",
      isImpersonating && "mt-12" // Add space for impersonation banner
    )}>
      {/* Your existing navbar content */}
    </nav>
  )
} 