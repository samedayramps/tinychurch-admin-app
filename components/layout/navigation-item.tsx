import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { NavigationMenuLink } from '@/components/ui/navigation-menu'

interface NavigationItemProps {
  title: string
  href: string
  description?: string
}

export function NavigationItem({ title, href, description }: NavigationItemProps) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          )}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {description && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {description}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  )
} 