'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Organization {
  id: string
  name: string
}

interface OrganizationSelectProps {
  organizations: Organization[]
}

export function OrganizationSelect({ organizations }: OrganizationSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentOrgId = searchParams.get('organization_id')

  const handleOrgChange = (orgId: string) => {
    const params = new URLSearchParams(searchParams)
    if (orgId === 'all') {
      params.delete('organization_id')
    } else {
      params.set('organization_id', orgId)
    }
    router.push(`/superadmin/events?${params.toString()}`)
  }

  return (
    <Select
      value={currentOrgId || 'all'}
      onValueChange={handleOrgChange}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Organizations</SelectItem>
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 