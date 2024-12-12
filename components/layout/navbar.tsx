import { cn } from '@/lib/utils/cn'
import { useAuthStatus } from '@/lib/hooks/use-auth-status'

export function Navbar() {
  const { data: authStatus } = useAuthStatus()
  
  return (
    <nav className={cn(
      "sticky top-0 z-40 border-b bg-background/95 backdrop-blur"
    )}>
      {/* Your existing navbar content */}
    </nav>
  )
} 