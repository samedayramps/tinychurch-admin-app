// components/groups/groups-list.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Users, Settings, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/database.types'

type Group = Database['public']['Tables']['groups']['Row']
type GroupType = Database['public']['Enums']['group_type']

// Helper function to format group type for display
const formatGroupType = (type: GroupType) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

interface GroupsListProps {
  groups: (Group & { members_count: number })[]
  organizationId: string
  onDeleteGroup?: (groupId: string) => Promise<void>
}

export function GroupsList({ groups, organizationId, onDeleteGroup }: GroupsListProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleDelete = async (groupId: string) => {
    if (!onDeleteGroup) return
    
    setLoading(groupId)
    try {
      await onDeleteGroup(groupId)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Groups</h2>
          <p className="text-muted-foreground">
            Manage your ministry teams, small groups, and committees
          </p>
        </div>
        <Link href={`/org/${organizationId}/groups/new`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {group.name}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/org/${organizationId}/groups/${group.id}`}>
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/org/${organizationId}/groups/${group.id}/settings`}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {onDeleteGroup && (
                    <DropdownMenuItem
                      className="text-destructive"
                      disabled={loading === group.id}
                      onClick={() => handleDelete(group.id)}
                    >
                      Delete Group
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                {group.description || 'No description provided'}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {formatGroupType(group.type)}
                  </Badge>
                  <Badge variant="outline">
                    <Users className="w-3 h-3 mr-1" />
                    {group.members_count}
                  </Badge>
                </div>
                <Link
                  href={`/org/${organizationId}/groups/${group.id}/members`}
                  className="text-sm text-primary hover:underline"
                >
                  View Members
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full text-center py-12 bg-muted/10 rounded-lg">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Groups Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first group to start organizing your ministry teams and small groups.
            </p>
            <Link href={`/org/${organizationId}/groups/new`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Group
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}