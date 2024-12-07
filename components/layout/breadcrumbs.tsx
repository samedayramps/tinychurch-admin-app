'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useBreadcrumbs } from '@/lib/contexts/breadcrumbs-context'

export function Breadcrumbs() {
  const pathname = usePathname()
  const { organizationName, groupName } = useBreadcrumbs()
  const segments = pathname.split('/').filter(Boolean)

  console.log('Breadcrumbs Debug:', {
    pathname,
    organizationName,
    segments,
  })

  const isUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`
    let label = segment

    // Replace organization ID with name if available
    if (organizationName && segments[index - 1] === 'organizations' && isUUID(segment)) {
      console.log('Attempting to replace org ID:', {
        segment,
        isUUID: isUUID(segment),
        organizationName,
        prevSegment: segments[index - 1]
      })
      label = organizationName
    }

    // Replace group ID with name if available
    if (groupName && segments[index - 1] === 'groups' && isUUID(segment)) {
      label = groupName
    }

    // Format segment labels
    label = label
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return {
      href,
      label,
    }
  })

  if (breadcrumbs.length === 0) return null

  return (
    <nav className="flex items-center space-x-1 px-4 py-3 text-sm md:px-6 lg:px-8">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <Link
            href={crumb.href}
            className={`ml-1 hover:text-foreground ${
              index === breadcrumbs.length - 1
                ? 'font-medium text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            {crumb.label}
          </Link>
        </div>
      ))}
    </nav>
  )
} 