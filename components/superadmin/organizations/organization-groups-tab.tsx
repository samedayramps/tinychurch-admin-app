'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Users } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/database.types'

type BaseGroup = Database['public']['Tables']['groups']['Row']

type GroupWithCount = BaseGroup & {
  members_count: number
}

interface OrganizationGroupsTabProps {
  organizationId: string
  groups: GroupWithCount[]
}

const formatGroupType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export function OrganizationGroupsTab({ organizationId, groups }: OrganizationGroupsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <CardTitle>Groups</CardTitle>
        <Link href={`/superadmin/organizations/${organizationId}/groups/new`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
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
                    <Link href={`/superadmin/organizations/${organizationId}/groups/${group.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {groups.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No groups found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 