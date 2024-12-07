'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Users, Building2 } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/database.types'

// Define types using Database type
type BaseGroup = Database['public']['Tables']['groups']['Row']
type BaseOrganization = Database['public']['Tables']['organizations']['Row']

type SuperadminGroup = BaseGroup & {
  members_count: number
  organization: {
    name: string
    slug: string
  }
}

interface SuperadminGroupsListProps {
  groups: SuperadminGroup[]
  organizations: BaseOrganization[]
}

// Helper function to format group type for display
const formatGroupType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export function SuperadminGroupsList({ groups, organizations }: SuperadminGroupsListProps) {
  const [selectedOrg, setSelectedOrg] = useState<string>('all')
  
  // Filter groups based on selected organization
  const filteredGroups = selectedOrg === 'all' 
    ? groups 
    : groups.filter(group => group.organization_id === selectedOrg)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Groups Management</h2>
          <p className="text-muted-foreground">
            Manage groups across all organizations
          </p>
        </div>
        <Link href="/superadmin/groups/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Groups</CardTitle>
            <div className="w-[200px]">
              <Select
                value={selectedOrg}
                onValueChange={setSelectedOrg}
              >
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {group.organization.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {formatGroupType(group.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {group.members_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {group.visibility}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/superadmin/groups/${group.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredGroups.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No groups found
              {selectedOrg !== 'all' && ' for the selected organization'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 