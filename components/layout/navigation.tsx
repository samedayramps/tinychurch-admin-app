'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent
} from '@/components/ui/navigation-menu'
import { Breadcrumbs } from './breadcrumbs'
import { useImpersonationStatus } from '@/lib/hooks/use-impersonation'

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const { isImpersonating } = useImpersonationStatus()
  
  return (
    <div className={cn(
      "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      isImpersonating && "mt-12",
      className
    )}>
      <div className="container flex h-14 items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Dashboard</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 w-[400px]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      {/* Dashboard menu items */}
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            {/* Add other menu items */}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <Breadcrumbs />
    </div>
  )
} 