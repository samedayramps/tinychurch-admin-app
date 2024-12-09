'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Database } from '@/database.types'

type Organization = Database['public']['Tables']['organizations']['Row']

interface OrganizationFilterProps {
  organizations: Organization[]
  selectedOrg: string
  onOrganizationChange: (orgId: string) => void
}

export function OrganizationFilter({
  organizations,
  selectedOrg,
  onOrganizationChange
}: OrganizationFilterProps) {
  return (
    <div className="w-[250px]">
      <Select value={selectedOrg} onValueChange={onOrganizationChange}>
        <SelectTrigger>
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
    </div>
  )
} 