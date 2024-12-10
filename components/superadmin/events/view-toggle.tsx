'use client'

import { CalendarDays, List } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export function ViewToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'list'

  const handleViewChange = (value: string) => {
    if (!value) return
    const params = new URLSearchParams(searchParams)
    params.set('view', value)
    router.push(`/superadmin/events?${params.toString()}`)
  }

  return (
    <ToggleGroup type="single" value={view} onValueChange={handleViewChange}>
      <ToggleGroupItem value="list" aria-label="List view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="calendar" aria-label="Calendar view">
        <CalendarDays className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
} 